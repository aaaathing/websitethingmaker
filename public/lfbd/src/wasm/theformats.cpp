/*
A volume is something that contains stuff.
subchunks are volumes and are part of chunk
*/
// anything between /*  */ or after // is either information or unused code

const long int MOVE_COUNT_MULT = 32;// higher causes more memoru
const long int WAIT_COUNT = 20000; // 20 ticks per second
const long int ARRAY_TO_CHUNKS_ITERS_PER_YIELD_THREAD = (1<<12)-1;
const long int MAX_FREE_OBJECTS = 1000;

#include "c++funcs.cpp"
#include <stdlib.h>
#include <stdint.h>
#include <algorithm>
#include <string>
#include <memory>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <functional>
#include <numeric>
#include <limits>
#include <array>
#include <queue>
#include <coroutine>

extern "C" {
 	IMPORT("printy") extern void printy(const char* x, int objectify=0);
	IMPORT("getNow") extern long getNow();
	IMPORT("noOpt") extern void noOpt(int64_t);
}
void printy(std::string a, int objectify=0){
	printy(a.c_str(), objectify);
}

#include "funcs.cpp"

template <typename T>
struct lessAllocator{
	std::vector<T*> allocds;
	auto allocOne(){
		if(allocds.empty()) return (T*) operator new(sizeof(T));
		else{
			auto one = allocds.back();
			allocds.pop_back();
			return one;
		}
	}
	void deallocOne(T* one){
		if(allocds.size() < MAX_FREE_OBJECTS) allocds.push_back(one);
		else operator delete(one);
	}
	lessAllocator(){
		allocds.reserve(MAX_FREE_OBJECTS);
	}
};

struct coroutine
{
	struct promise_type
	{
		bool returned = false;
		std::coroutine_handle<> awaiter;
		coroutine get_return_object() { return {this}; }
		std::suspend_never initial_suspend() noexcept { return {}; }
		std::suspend_never final_suspend() noexcept { return {}; }
		void return_void() {
			returned = true;
			if(awaiter) awaiter.resume();
		}
		void unhandled_exception() {}
	};
	std::coroutine_handle<promise_type> ch;
	coroutine(promise_type* p): ch{std::coroutine_handle<promise_type>::from_promise(*p)} {}
	bool returned(){return ch.promise().returned;}

	/*static thisType newFinished(){
		auto a = new promise_type;
		a->returned = true;
		return a->get_return_object();
	}*/

	struct Awaiter {
		std::coroutine_handle<promise_type> handle;
		bool await_ready() const noexcept { return handle.promise().returned; }
		void await_suspend(std::coroutine_handle<> calling) noexcept
		{
				handle.promise().awaiter = calling;
		}
		void await_resume() noexcept { }
	};

	auto operator co_await() noexcept { return Awaiter { ch }; }
};
struct lazyCoroutine : coroutine{
	struct promise_type : coroutine::promise_type{
		std::suspend_always initial_suspend() noexcept { return {}; }
		lazyCoroutine get_return_object() { return {this}; }
	};
};
extern "C"{
	IMPORT("externYieldThread") extern void externYieldThread(std::coroutine_handle<>*);
	EXPORT("externYieldThreadDone") void externYieldThreadDone(std::coroutine_handle<>* handle){
		handle->resume();
		delete handle;
	}
}
struct yieldThread{
	struct Awaiter {
		bool await_ready() const noexcept { return false; }
		void await_suspend(std::coroutine_handle<> caller) noexcept
		{
			externYieldThread(new std::coroutine_handle<>(caller));
		}
		void await_resume() noexcept { }
	};

	Awaiter operator co_await() noexcept { return {}; }
};


class ByteArray{
	std::vector<uint32_t> v;
	uint32_t idx;
	public:
		ByteArray():v(),idx(0){}
		ByteArray(size_t s):v(s),idx(0){}
		ByteArray& add(uint32_t x){
			v.push_back(x);
			return *this;
		}
		template<typename T>
		ByteArray& add(std::vector<T> a){
			v.insert(v.end(), a.begin(), a.end());
			return *this;
		}
		template<typename Iter>
		ByteArray& add(Iter begin, Iter end){
			v.insert(v.end(), begin, end);
			return *this;
		}
		ByteArray& removeAndAdd(uint32_t x){
			v.pop_back();
			v.push_back(x);
			return *this;
		}
		/*template<typename Iter>
		ByteArray& addVarsize(Iter begin, Iter end){
			v.push_back(end-begin);
			v.insert(v.end(), begin, end);
			return *this;
		}*/
		uint32_t read(){
			return v.at(idx++);
		}
		uint32_t next(){
			return v.at(idx);
		}
		auto read(uint32_t howmany){
			idx+=howmany;
			return std::vector<uint32_t>(v.begin() + idx-howmany, v.begin() + idx);
		}
		auto skip(uint32_t howmany){
			idx+=howmany;
			return v.begin()+idx-howmany;
		}
		bool atEnd(){return idx==v.size();}
		std::string tostring()const{
			return std::accumulate(v.begin()+1, v.end(), std::to_string(v[0]),
			[](const std::string& a, uint32_t b){
						return a + ',' + std::to_string(b);
			});
		}
		auto begin(){return v.begin();}
		auto end(){return v.end();}
		void clear(){v.clear();}
		auto size(){return v.size();}
		auto replace(size_t i, uint32_t x){
			v[i] = x;
		}
};

struct intSetHash{
	size_t operator()(const sorted_vector<uint32_t> s)const{
		size_t x = 0;
		for(uint32_t i : s){
			x ^= std::hash<uint32_t>{}(i);
		}
		return x;
	}
};

struct subchunkChanges{
	bool activeChange;
	bool merge;
	bool clientUpdated;
	subchunkChanges(bool all=false):activeChange(all),merge(all),clientUpdated(all){}
	bool any(){
		return activeChange||merge||clientUpdated;
	}
	void combine(subchunkChanges other){
		activeChange = activeChange || other.activeChange;
		merge = merge || other.merge;
		clientUpdated = clientUpdated || other.clientUpdated;
	}
};

template <typename WorldStuff>
class World{
	public:
		//bits should be limited to 32
		struct AttributeFormat{
			uint32_t bitOffset;
			uint32_t bits;
			uint32_t intOffset;
			uint32_t mask;
			uint32_t rightMask;
			bool used;
			AttributeFormat(uint32_t bits=0,uint32_t bitOffset=0,uint32_t intOffset=0,bool used=false):bitOffset(bitOffset),bits(bits),intOffset(intOffset),mask(((((uint32_t)1)<<bits)-1)<<bitOffset),rightMask(((((uint32_t)1)<<bits)-1)),used(used){};
			void toByteArray(ByteArray& arr){
				arr.add(bitOffset);
				arr.add(bits);
				arr.add(intOffset);
				arr.add(mask);
				arr.add((uint32_t)used);
			}
			void fromByteArray(ByteArray& arr){
				bitOffset = arr.read();
				bits = arr.read();
				intOffset = arr.read();
				mask = arr.read();
				used = bool(arr.read());
			}
		};
		struct attributeCombinationInformation{
			uint32_t offset; uint8_t intLength;
		};
		/*struct AttrGen{
			std::vector<AttributeFormat>& attributeTypes;
			AttrGen(std::vector<AttributeFormat>& attributeTypes):attributeTypes(attributeTypes){}
			uint32_t add(uint32_t bits){
				attributeTypes.emplace_back(bits);
				return attributeTypes.size()-1;
			}
		};*/
		template <uint32_t N=0>
		struct AttrGen{
			std::array<AttributeFormat,N> arr;
			std::array<bool,N> usedArr;
			template <uint32_t id>
			constexpr auto add(AttributeFormat x){
				AttrGen<std::max(N,id+1)> a;
				std::copy(arr.begin(),arr.end(), a.arr.begin());
				std::copy(usedArr.begin(),usedArr.end(), a.usedArr.begin());
				std::fill(a.usedArr.begin()+usedArr.size(),a.usedArr.end(),false);
				if(a.usedArr[id]) throw std::logic_error("Attribute id already used");
				a.arr[id] = x;
				a.usedArr[id] = true;
				return a;
			}
		};

		struct PartsNode;
		class SubchunkOctree;
		class SubchunkArray;

		//subchunks are volumes and are part of chunk
		//STUFF: subchunks decided here
		#define TYPE_LIST(f) f(std::unique_ptr<PartsNode>, pn) f(std::unique_ptr<SubchunkOctree>, o) f(std::unique_ptr<SubchunkArray>, a)
		#define TYPENAME SubchunkNode
		#include "thingVariant.cpp"
		#define TYPE_LIST(f) f(PartsNode*, pn) f(SubchunkOctree*, o) f(SubchunkArray*, a)
		#define TYPENAME SubchunkNodePtr
		#define NO_CONSTRUCT
		#include "thingVariant.cpp"

		struct argsForMove{
			SubchunkNodePtr containerNode;
			vec3u containerPos;
			uint32_t containerWidth;
			PartsNode& partsNode;
			vec3u pos;
			int32_t partsNodeDepth;
			uint32_t partWhere;
			int32_t containerDepth;
		};

		class Chunk;
		struct Client{
			std::unordered_set<Chunk*> updates;
			vec3i chunkPos = vec3i(0,0,0);
		};

		struct syncTypes{
			static const uint32_t edges = 1;
			static const uint32_t move = 2;
		};

		struct commonAttrs{
			static constexpr uint32_t active = 0;
			static constexpr uint32_t tickVer = 1;
		};
		constexpr static auto hereAttrs(){
			auto arr = WorldStuff::hereAttrs(AttrGen()
				.template add<commonAttrs::active>(AttributeFormat(1))
				.template add<commonAttrs::tickVer>(AttributeFormat(1))
			);
			return arr.arr;
		}
		inline static const auto attributeTypes = hereAttrs();
		inline static const size_t attributeTypesCount = attributeTypes.size();

	//std::unordered_set<std::unique_ptr<Client>> clients;
		std::unordered_map<vec3i,std::unique_ptr<Chunk>> chunks;
		std::vector<Chunk*> edgesUpdatedChunks;
		std::vector<Chunk*> toMoveChunks;
		std::unordered_set<Chunk*> ownedChunks;
		const int32_t depth;
		const int32_t chunkSize;
		const uint32_t workerCount;
		const uint32_t thisWId;
		WorldStuff worldStuff;
		long tickEndTime;
		bool tickTimeChecked;
		uint32_t ticks = 0;
		World(int32_t depth, int32_t workerCount, int32_t thisWId):
		depth(depth), chunkSize(((uint32_t)1)<<depth), workerCount(workerCount), thisWId(thisWId),
		worldStuff(this)
		{
			/*std::unordered_map<std::string,uint32_t> attributeIds;
			for(auto& i : attrs){
				attributeIds[i.first] = attributeTypes.size();
				attributeTypes.push_back(i.second);
			}*/
			/*AttrGen attrGen(attributeTypes);
			commonAttrs::active = attrGen.add(1);
			commonAttrs::tickVer = attrGen.add(1);
			worldStuff.hereAttrs(attrGen);
			attributeTypesCount = attributeTypes.size();*/
		}
		Chunk* getChunk(vec3i pos){
			return chunks.at(pos).get();
		}
		bool chunkExist(vec3i pos){
			return chunks.contains(pos);
		}

		class Chunk{
			private:
				SubchunkNode thing;
				bool active;
			public:
				//possibleoptimize: replace map of int with vector
				std::unordered_map<sorted_vector<uint32_t>, attributeCombinationInformation, intSetHash> attributeCombinationsFromSet;
				std::unordered_map<uint32_t, attributeCombinationInformation> attributeCombinationsFromOffset;//used in syncMove, not synced by syncEdges
				std::unordered_set<uint32_t> attributeCombinationsToSync; //contains attribute offsets
				const int32_t depth;
				World<WorldStuff>* world;
				std::vector<AttributeFormat> usedAttributes;
				std::vector<Client*> loadedClients; //loadedClients should have the same order when adding and removing
				const vec3i pos;
				const uint32_t ownerId;
				const bool owned;
				std::vector<myBitset<uint32_t,27>> neighbours;
				ByteArray toMove;
				ByteArray toMoveAttrs;
				bool edgesUpdated;
				uint32_t tickVer;
				Chunk(World<WorldStuff>* world, vec3i pos, uint32_t ownerId):
				world(world),depth(world->depth),
				thing(std::make_unique<PartsNode>()),pos(pos),ownerId(ownerId),owned(ownerId==world->thisWId),active(false),edgesUpdated(false),
				tickVer(0)
				{
					neighbours.resize(world->workerCount);
					int32_t i = 0, chunkSize = world->chunkSize;
					for(int32_t x=-chunkSize; x<=chunkSize; x+=chunkSize){for(int32_t y=-chunkSize; y<=chunkSize; y+=chunkSize){for(int32_t z=-chunkSize; z<=chunkSize; z+=chunkSize,i++){
						if(!world->chunkExist(vec3i(pos.x+x,pos.y+y,pos.z+z))) continue;
						Chunk* that = world->getChunk(vec3i(pos.x+x,pos.y+y,pos.z+z));
						if(that->ownerId == ownerId) continue;
						neighbours[that->ownerId].set(i,true);
						that->neighbours[ownerId].set(26-i,true);
					}}}
				}
				void beforeDelete(){
					int32_t i = 0, chunkSize = world->chunkSize;
					for(int32_t x=-chunkSize; x<=chunkSize; x+=chunkSize){for(int32_t y=-chunkSize; y<=chunkSize; y+=chunkSize){for(int32_t z=-chunkSize; z<=chunkSize; z+=chunkSize,i++){
						if(!world->chunkExist(vec3i(pos.x+x,pos.y+y,pos.z+z))) continue;
						Chunk* that = world->getChunk(vec3i(pos.x+x,pos.y+y,pos.z+z));
						if(that->ownerId == ownerId) continue;
						that->neighbours[ownerId].set(26-i,false);
					}}}
				}
				bool isActive(){return active;}
				SubchunkNode& getSubchunk(){return thing;}
				/*AttributeFormat& requireAttr(int32_t id){
					if(!usedAttributes[id].used){
						usedAttributes[id].used = true;
						if(lastAttrIntOffset+usedAttributes[id].bits>32){
							usedAttributes[id].intOffset = lastAttrIntOffset+1;
							usedAttributes[id].bitOffset = 0;
							lastAttrIntOffset++;
						}else{
							usedAttributes[id].bitOffset = lastAttrBitOffset;
							usedAttributes[id].intOffset = lastAttrIntOffset;
						}
						lastAttrBitOffset = usedAttributes[id].bitOffset+usedAttributes[id].bits;
					}
					return usedAttributes[id];
				}*/
				attributeCombinationInformation requireAttrs(const sorted_vector<uint32_t>& ids){
					if(attributeCombinationsFromSet.contains(ids)){
						return attributeCombinationsFromSet.at(ids);
					}else{
						// make format
						uint32_t offset = usedAttributes.size();
						usedAttributes.reserve(usedAttributes.size()+world->attributeTypesCount);
						uint32_t lastAttrBitOffset = 0, lastAttrIntOffset = 0, id = 0;
						auto idsIdx = ids.begin();
						for(auto& attr : world->attributeTypes){
							if((*idsIdx) == id){// it is sorted
								idsIdx++;
								int32_t intOffset,bitOffset;
								if(lastAttrBitOffset+attr.bits>32){
									intOffset = lastAttrIntOffset+1;
									bitOffset = 0;
									lastAttrIntOffset++;
								}else{
									bitOffset = lastAttrBitOffset;
									intOffset = lastAttrIntOffset;
								}
								usedAttributes.emplace_back(attr.bits,bitOffset,intOffset,true);
								lastAttrBitOffset = bitOffset+attr.bits;
							}else usedAttributes.emplace_back(attr);
							id++;
							//auto &i=usedAttributes.back();
							//printy("attr "+std::to_string(id)+" "+(i.used?std::string("t"):std::string("f"))+" "+std::to_string(i.bits)+" "+std::to_string(i.bitOffset)+" "+std::to_string(i.intOffset));
						}
						if(offset>=(((uint32_t)1)<<24) || (lastAttrIntOffset+1)>=(((uint32_t)1)<<8)) throw std::runtime_error("attributes offset or length too large");
						attributeCombinationInformation newi{.offset=offset, .intLength=uint8_t(lastAttrIntOffset+1)};
						attributeCombinationsFromSet.insert(std::make_pair(ids,newi));
						attributeCombinationsFromOffset.insert(std::make_pair(offset,newi));
						if(owned){
							attributeCombinationsToSync.insert(offset);
						}else{// if this chunk is not owned and a attribute was added, send the new attribute
							toMoveAttrs.add(offset).add(ids.size()).add(ids.begin(),ids.end());
							//todo: possibly use attributeCombinationsToSync instead of toMoveAttrs
						}
						return newi;
					}
				}
				void load(SubchunkNode what);
				template <typename T, typename T2>
				void add(const T& data, uint32_t x, uint32_t y, uint32_t z, T2 func);
				template <typename Iter, typename T>
				void addRaw(Iter begin,Iter end,uint32_t x,uint32_t y,uint32_t z,T wheres);
				template <typename T>
				void fillCell(const T& what, uint32_t x, uint32_t y, uint32_t z);
				std::string tostring();
				void syncSendEdges();
				void syncRecieve(uint32_t typecode, ByteArray& arr, ByteArray& arr2);
				void addClient(Client* c);
				void removeClient(Client* c);
				ByteArray flattenClient(const Client* forClient);
				subchunkChanges tickActiveCb(argsForMove, uint32_t& outNewAutoConvertMoveCount);
				void tick();
				void partMove(argsForMove&, vec3i moveBy);
				void updateI(subchunkChanges deeperUpdates=subchunkChanges(true));
				void searchAroundNoBoundsCheck(vec3i where, uint32_t whereS, vec3i thisPos, std::function<void(PartsNode*, uint32_t,uint32_t,vec3i, Chunk&)> cb);
				void searchAround(vec3i where, uint32_t whereS, std::function<void(PartsNode*, uint32_t,uint32_t,vec3i, Chunk&)> cb);
		};
		void chunkNew(vec3i pos,uint32_t ownerId){
			chunks.insert(std::make_pair(pos,std::make_unique<Chunk>(this,pos,ownerId)));
			Chunk* chunk = getChunk(pos);
			if(chunk->owned) ownedChunks.insert(chunk);
		}
		void chunkDelete(vec3i pos){
			Chunk* chunk = getChunk(pos);
			chunk->beforeDelete();
			if(chunk->owned) ownedChunks.erase(chunk);
			chunks.erase(pos);
		}
		void tick(long tickEndTime){
			tickTimeChecked = false;
			this->tickEndTime = tickEndTime;
			ticks++;
			worldStuff.beforeTick();
			for(Chunk* chunk : ownedChunks){
				if(chunk->loadedClients.size()) chunk->tick();
			}
			for(Chunk* chunk : edgesUpdatedChunks){
				chunk->syncSendEdges();
				chunk->edgesUpdated = false;
			}
			for(Chunk* chunk : toMoveChunks){
				externSyncSend(this,chunk->ownerId,chunk->pos.x,chunk->pos.y,chunk->pos.z,syncTypes::move,&*chunk->toMove.begin(),&*chunk->toMove.end(),&*chunk->toMoveAttrs.begin(),&*chunk->toMoveAttrs.end());
				chunk->toMove.clear();
				chunk->toMoveAttrs.clear();
			}
			edgesUpdatedChunks.clear();
			toMoveChunks.clear();
			worldStuff.tick();
		}
		bool canDoSlowStuff(){
			bool prevTickTimeChecked = tickTimeChecked;
			tickTimeChecked = true;
			return !prevTickTimeChecked || getNow()<tickEndTime;
		}
		bool canDoSlowStuffNext(){
			return !tickTimeChecked || getNow()<tickEndTime;
		}
};
extern "C" {
	//void externSyncSendEdges(void* world,int32_t toW,int32_t x,int32_t y,int32_t z,uint32_t* arrBegin, uint32_t* arrEnd, uint32_t* attrarrBegin, uint32_t* attrarrEnd);
	//void externSyncSendMove(void* world,int32_t toW,int32_t x,int32_t y,int32_t z,uint32_t* arrBegin, uint32_t* arrEnd, uint32_t* attrarrBegin, uint32_t* attrarrEnd);
	IMPORT("externSyncSend") void externSyncSend(void* world,int32_t toW, int32_t x,int32_t y,int32_t z, uint32_t typecode, uint32_t* arrBegin, uint32_t* arrEnd, uint32_t* arr2Begin, uint32_t* arr2End);
}

template <typename WorldStuff>
bool isSubchunk(typename World<WorldStuff>::SubchunkNode& that){
	return !that.template has<std::unique_ptr<typename World<WorldStuff>::PartsNode>>();
}
/*template <typename T>
int subchunkTypecode(){return variant_index<SubchunkNode,std::unique_ptr<T>>();}*/

template <typename WorldStuff>
struct convChunk{
	uint32_t x;
	uint32_t y;
	uint32_t z;
	int32_t depth;
	World<WorldStuff>::PartsNode* data;
};
template <typename WorldStuff, typename DstT, typename T>
auto volumeConvertDoConv(DstT* newC, T& src, int32_t depth, bool moveNoCopy=false){
	if constexpr (requires { src.template convIterateChunks<DstT>([](convChunk<WorldStuff> toAdd){}, int32_t()); DstT(int32_t()).convFromChunks(convChunk<WorldStuff>(),int32_t(),bool()); }){
		return src.template convIterateChunks<DstT>(/*capture by value allows async*/[=](convChunk<WorldStuff> toAdd){newC->convFromChunks(toAdd,depth,moveNoCopy);}, depth);
	}else{
		static_assert(requires { src.template convIterateChunks<DstT>([](convChunk<WorldStuff> toAdd){}, int32_t()); DstT(int32_t()).convFromChunks(convChunk<WorldStuff>(),int32_t(),bool()); }, "NO conversion can be done!!!!!!!!!");
	}
}
template <typename WorldStuff, typename DstT, typename T>
auto volumeConvert(T& src, int32_t depth, bool moveNoCopy=false){
	auto* newC = new DstT(depth);
	typedef decltype(volumeConvertDoConv<WorldStuff,DstT,T>(newC, src,depth,moveNoCopy)) retType;
	if constexpr(std::is_same<retType,void>::value){
		struct ret{ DstT* dst; };
		volumeConvertDoConv<WorldStuff,DstT,T>(newC, src,depth,moveNoCopy);
		return ret{ newC };
	}else{
		struct ret{
			DstT* dst;
			retType ret;
		};
		return ret{
			newC,
			volumeConvertDoConv<WorldStuff,DstT,T>(newC, src,depth,moveNoCopy)
		};
	}
}
/*template <typename WorldStuff, typename DstT, typename T>
auto volumeConvertAsync(T& src, int32_t depth, bool moveNoCopy=false){
	struct ret{ DstT* dst; coroutine coroutine; };
	if constexpr (requires { src.template convIterateChunksAsync<DstT>([](convChunk<WorldStuff> toAdd){}, int32_t()); DstT(int32_t()).convFromChunks(convChunk<WorldStuff>(),int32_t(),bool()); }){
		auto* newC = new DstT(depth);
		return ret{newC, src.template convIterateChunksAsync<DstT>([=](convChunk<WorldStuff> toAdd){newC->convFromChunks(toAdd,depth,moveNoCopy);}, depth)};
	}else{
		return ret{volumeConvert(src, depth, moveNoCopy), coroutine::newFinished()};
	}
}*/

//it should be looped from end to start
//format for one part: offset in usedAttributes and length, data (multiple)
//format for PartsNode: multiple parts
//when created with no other, it should be not active
//it should have same attribute formats as other one
template <typename WorldStuff>
struct World<WorldStuff>::PartsNode{
	static const size_t partInStructSize = sizeof(std::vector<uint32_t>)/sizeof(uint32_t);
	typedef std::vector<uint32_t> vecT;
	typedef std::array<uint32_t,partInStructSize> inStructT;
	typedef null_t emptyT;
	#define TYPE_LIST(f) f(emptyT,emptyT) f(inStructT,inStructT) f(vecT,vecT)
	#define TYPENAME partsVariant
	#include "thingVariant.cpp"
	partsVariant parts;
	uint32_t activeCount;
	PartsNode(): parts(emptyT()), activeCount(0) {}
	PartsNode(const PartsNode& other):activeCount(other.activeCount),parts(emptyT()){
		if(other.parts.template has<vecT>()){
			auto& vec = other.parts.template get<vecT>();
			if(vec.empty()){
				parts = emptyT();
			}else if(vec.begin()+vec[0] == vec.end() && vec.size() <= partInStructSize){
				//if other is using vector but the contents can fit in the struct
				inStructT arr{};
				std::copy(vec.begin(), vec.end(), arr.begin());
				parts = std::move(arr);
			}else parts = vecT(vec);//copy
		}else if(other.parts.template has<inStructT>()){
			parts = inStructT(other.parts.template get<inStructT>());//copy
		}else parts = emptyT();
	}
	PartsNode(const PartsNode* other): PartsNode(*other){
		//printy("copy"+other->tostring());printy("this"+tostring());printy(std::to_string((unsigned long long)(void**)this));
	}
	PartsNode(int32_t depth):PartsNode(){}
	void add(const sorted_vector<uint32_t>& attributes, uint32_t x,uint32_t y,uint32_t z,int32_t depth, std::function<void(PartsNode*, uint32_t)> func, Chunk& chunk){
		add(chunk.requireAttrs(attributes), x,y,z,depth,func,chunk);
	}
	void add(const attributeCombinationInformation wheres, uint32_t x,uint32_t y,uint32_t z,int32_t depth, std::function<void(PartsNode*, uint32_t)> func, Chunk& chunk){
		/*int32_t length = 0;
		for(int32_t a : attributes){
			length = std::max(length, thectx.chunk->requireAttr(a).intOffset);
		}
		length += 2;//1 for intoffset being 0 based, 1 for length*/
		uint32_t length = wheres.intLength+2;// add 2 for offset&length at front and back
		if(!parts.template has<vecT>()){
			if(parts.template has<emptyT>()){
				if(length > partInStructSize){//can't fit in struct
					parts = std::move(vecT());
				}else{
					inStructT arr{};
					arr[length-1] = arr[0] = ((uint32_t)wheres.offset<<8) | ((uint32_t)length&255);
					parts = std::move(arr);
					func(this,0);
					return;//skip code after here in function
				}
			}else{// printy(std::to_string((unsigned long)std::begin(parts.inStruct))+","+std::to_string((unsigned long)(std::begin(parts.inStruct)+(parts.inStruct[0])))+","+std::to_string((unsigned long)std::end(parts.inStruct)));
				inStructT& arr = parts.template get<inStructT>();
				parts = vecT(arr.begin(),arr.begin()+(arr[0]&255));
			}
		}
		vecT& vec = parts.template get<vecT>();
		size_t where = vec.size();
		vec.resize(where+length,0);
		vec[where+length-1] = vec[where] = ((uint32_t)wheres.offset<<8) | ((uint32_t)length&255);
		func(this,where);
		return;
	}
	template <typename Iter, typename wherest>
	subchunkChanges addRaw(Iter begin,Iter end, uint32_t x, uint32_t y, uint32_t z, int32_t depth, wherest wheres, Chunk& chunk){
		uint32_t length = end-begin;// add 1 for first thing
		if constexpr(!std::is_same_v<wherest,null_t>){
			auto& activeAttr = chunk.usedAttributes[wheres.offset+World<WorldStuff>::commonAttrs::active];
			if(activeAttr.used && bool((*(begin+1+activeAttr.intOffset))&activeAttr.mask)) activeCount++;
		}else{
			auto& activeAttr = chunk.usedAttributes[((*begin)>>8)+World<WorldStuff>::commonAttrs::active];
			if(activeAttr.used && bool((*(begin+1+activeAttr.intOffset))&activeAttr.mask)) activeCount++;
		}
		if(!parts.template has<vecT>()){
			if(parts.template has<emptyT>()){
				if(length > partInStructSize){//can't fit in struct
					parts = std::move(vecT());
				}else{
					inStructT arr{};
					std::copy(begin,end,std::begin(arr));
					if constexpr(!std::is_same_v<wherest,null_t>) arr[length-1] = arr[0] = ((uint32_t)wheres.offset<<8) | ((uint32_t)length&255);
					parts = std::move(arr);
					return subchunkChanges(true);//skip code after here in function
				}
			}else{
				inStructT& arr = parts.template get<inStructT>();
				parts = vecT(arr.begin(),arr.begin()+(arr[0]&255));
			}
		}
		vecT& vec = parts.template get<vecT>();
		size_t where = vec.size();
		vec.resize(where+length);
		std::copy(begin,end, vec.end()-length);
		if constexpr(!std::is_same_v<wherest,null_t>) vec[where+length-1] = vec[where] = ((uint32_t)wheres.offset<<8) | ((uint32_t)length&255);
		return subchunkChanges(true);
	}
	subchunkChanges remove(size_t where, uint32_t x, uint32_t y, uint32_t z, int32_t depth, Chunk& chunk){
		if(parts.template has<vecT>()){
			vecT& vec = parts.template get<vecT>();
			auto& activeAttr = chunk.usedAttributes[(vec[where]>>8)+World<WorldStuff>::commonAttrs::active];
			if(activeAttr.used && bool((vec[where+1+activeAttr.intOffset])&activeAttr.mask)) activeCount--;
			vec.erase(vec.begin()+where,vec.begin()+where+(vec[where]&255));
		}else if(where == 0){
			inStructT& arr = parts.template get<inStructT>();
			auto& activeAttr = chunk.usedAttributes[(arr[where]>>8)+World<WorldStuff>::commonAttrs::active];
			if(activeAttr.used && bool((arr[where+1+activeAttr.intOffset])&activeAttr.mask)) activeCount--;
			parts = emptyT(); //part is in struct, so make it empty
		}
		return subchunkChanges(true);
	}
	void searchAround(vec3i where, size_t whereS, vec3i thisPos,int32_t depth, std::function<void(PartsNode*, uint32_t,uint32_t,vec3i, Chunk&)> cb, Chunk& chunk){
		int32_t cs = ((uint32_t)1)<<(depth+1);
		if(where.x-int32_t(whereS)<thisPos.x+cs && where.x+int32_t(whereS)>=thisPos.x && where.y-int32_t(whereS)<thisPos.y+cs && where.y+int32_t(whereS)>=thisPos.y && where.z-int32_t(whereS)<thisPos.z+cs && where.z+int32_t(whereS)>=thisPos.z){
			if(parts.template has<vecT>()){
				vecT& vec = parts.template get<vecT>();
				for (auto it = vec.begin(); it < vec.end(); it+=(*it)&255) { //iterate by adding size of each part
					cb(this,it-vec.begin(),cs,thisPos,chunk);
				}
			}else if(parts.template has<inStructT>()){
				inStructT& arr = parts.template get<inStructT>();
				cb(this,0,cs,thisPos,chunk);
			}
		}
	}
	const uint32_t* partBegin(size_t where)const{
		return begin()+where;
	}
	const uint32_t* partEnd(size_t where)const{
		if(parts.template has<vecT>()){
			const vecT& vec = parts.template get<vecT>();
			return ((uint32_t*)&*vec.begin())+where+(vec[where]&255);
		}else if(parts.template has<inStructT>()){
			const inStructT& arr = parts.template get<inStructT>();
			return std::begin(arr)+where+(arr[where]&255);
		}else return (uint32_t*)0;
	}
	auto attr(size_t where,uint32_t attrid, Chunk& chunk){
		struct proxy {
			AttributeFormat& attr;
			uint32_t& changeWhat;
			uint32_t* activeCount;
			//set to something using =
			//when setting attribute, the new value can use more bits than the attribute has
			proxy& operator=(uint32_t what){
				if(activeCount) *activeCount += uint32_t(int32_t(bool(what)) - int32_t(bool(changeWhat&attr.mask)));
				changeWhat = changeWhat&(~attr.mask)|((what&attr.rightMask)<<attr.bitOffset);
				return *this;
			}
			//get value
			operator uint32_t(){
				return (changeWhat&attr.mask)>>attr.bitOffset;
			}
			//int64 is used to allow negatives
			proxy& operator+=(int64_t add){
				uint32_t what = (uint32_t)(((int64_t)((changeWhat&attr.mask)>>attr.bitOffset))+add);
				if(activeCount) *activeCount += uint32_t(int32_t(bool(what)) - int32_t(bool(changeWhat&attr.mask)));
				changeWhat = changeWhat&(~attr.mask)|((what&attr.rightMask)<<attr.bitOffset);
				return *this;
			}
		};
		auto ptr = const_cast<uint32_t*>(partBegin(where));
		auto& attr = chunk.usedAttributes[((*ptr)>>8)+attrid];
		if(!attr.used) throw std::runtime_error("unused attribute v");
		return proxy{attr,*(ptr+1+attr.intOffset), attrid == World<WorldStuff>::commonAttrs::active ? &activeCount : nullptr};
		/*if(parts.template has<vecT>()){
			vecT& vec = parts.template get<vecT>();
			auto& attr = chunk.usedAttributes[(vec[where]>>8)+attrid];
			if(!attr.used) throw std::runtime_error("unused attribute v");
			return proxy{attr,vec[where+1+attr.intOffset], attrid == World<WorldStuff>::commonAttrs::active ? &activeCount : nullptr};
			//return (attr.used/-* && attr.intOffset<vec[where]-1*-/) ? (vec[where+1+attr.intOffset]&attr.mask)>>attr.bitOffset : 0;
		}else if(where == 0 && parts.template has<inStructT>()){
			inStructT& arr = parts.template get<inStructT>();
			auto& attr = chunk.usedAttributes[(arr[0]>>8)+attrid];
			if(!attr.used) throw std::runtime_error("unused attribute i");
			return proxy{attr,arr[1+attr.intOffset], attrid == World<WorldStuff>::commonAttrs::active ? &activeCount : nullptr};
			//return (attr.used/-* && attr.intOffset<arr[0]-1*-/) ? (arr[1+attr.intOffset]&attr.mask)>>attr.bitOffset : 0;
		}else throw std::runtime_error("'where' is out of bounds or something");*/
	}
	/*void setAttr(size_t where,uint32_t attrid, uint32_t what, Chunk& chunk){
		if(parts.template has<vecT>()){
			vecT& vec = parts.template get<vecT>();
			auto& attr = chunk.usedAttributes[(vec[where]>>8)+attrid];
			if(!attr.used) throw std::runtime_error("setting unused attribute");
			if(attrid == chunk.world->commonAttrs::active){
				if(bool(vec[where+1+attr.intOffset]&attr.mask)){
					if(!what) activeCount--;
				}else{
					if(what) activeCount++;
				}
				//printy(std::to_string(where)+" "+std::to_string(attr.intOffset)+" "+std::to_string(attr.bitOffset)+" "+std::to_string(attr.mask)+" "+std::to_string(what)+" "+std::to_string(vec[where+1+attr.intOffset]));
			}
			vec[where+1+attr.intOffset] = vec[where+1+attr.intOffset]&(~attr.mask)|(what<<attr.bitOffset);
		}else if(parts.template has<inStructT>() && where == 0){
			inStructT& arr = parts.template get<inStructT>();
			auto& attr = chunk.usedAttributes[(arr[0]>>8)+attrid];
			if(!attr.used) throw std::runtime_error("setting unused attribute");
			if(attrid == chunk.world->commonAttrs::active){
				if(bool(arr[1+attr.intOffset]&attr.mask)){
					if(!what) activeCount--;
				}else{
					if(what) activeCount++;
				}
			}
			arr[1+attr.intOffset] = arr[1+attr.intOffset]&(~attr.mask)|(what<<attr.bitOffset);
		}
	}*/
	uint32_t getAttr(size_t where,uint32_t attrid, Chunk& chunk){
		auto ptr = const_cast<uint32_t*>(partBegin(where));
		auto& attr = chunk.usedAttributes[((*ptr)>>8)+attrid];
		return attr.used ? ((*(ptr+1+attr.intOffset))&attr.mask)>>attr.bitOffset : 0;
		/*if(parts.template has<vecT>()){
			vecT& vec = parts.template get<vecT>();
			auto& attr = chunk.usedAttributes[(vec[where]>>8)+attrid];
			return (attr.used/-* && attr.intOffset<vec[where]-1*-/) ? (vec[where+1+attr.intOffset]&attr.mask)>>attr.bitOffset : 0;
		}else if(where == 0 && parts.template has<inStructT>()){
			inStructT& arr = parts.template get<inStructT>();
			auto& attr = chunk.usedAttributes[(arr[0]>>8)+attrid];
			return (attr.used/-* && attr.intOffset<arr[0]-1*-/) ? (arr[1+attr.intOffset]&attr.mask)>>attr.bitOffset : 0;
		}else return 0;*/
	}
	bool empty(){
		return parts.template has<vecT>() ? parts.template get<vecT>().empty() : parts.template has<emptyT>();
	}
	const uint32_t* begin()const{
		return parts.template has<vecT>() ? (uint32_t*)&*std::begin(parts.template get<vecT>()) : (parts.template has<emptyT>() ? (uint32_t*)0 : std::begin(parts.template get<inStructT>()));
	}
	const uint32_t* end()const{
		return parts.template has<vecT>() ? (uint32_t*)&*std::end(parts.template get<vecT>()) : (parts.template has<emptyT>() ? (uint32_t*)0 : std::begin(parts.template get<inStructT>())+(parts.template get<inStructT>()[0]&255));
	}
	size_t size()const{
		return parts.template has<vecT>() ? parts.template get<vecT>().size() : (parts.template has<inStructT>() ? (parts.template get<inStructT>()[0]&255) : 0);
	}
	bool compare(const PartsNode& that)const{
		//return empty() && that.empty() || (parts[0] == parts.size() && that.parts[0] == that.parts.size() && that.parts == parts);
		if(parts.template has<vecT>()){
			const vecT& vec = parts.template get<vecT>();
			return vec.size() == that.size() && std::equal(vec.begin(),vec.end(),that.begin());
		}else if(parts.template has<inStructT>()){
			const inStructT& arr = parts.template get<inStructT>();
			return arr.size() == that.size() && std::equal(std::begin(arr),std::end(arr),that.begin());
		}else return that.size() == 0;
	}
	void fillCell(const PartsNode& what, uint32_t x, uint32_t y, uint32_t z, int32_t depth){
		if(what.parts.template has<vecT>()){
			parts = vecT(what.parts.template get<vecT>());//copy
		}else if(what.parts.template has<inStructT>()){
			parts = inStructT(what.parts.template get<inStructT>());//copy
		}else{
			parts = emptyT();
		}
		activeCount = what.activeCount;
	}
	//for clearing
	void fillCell(const null_t what, uint32_t x, uint32_t y, uint32_t z, int32_t depth){
		parts = emptyT();
		activeCount = 0;
	}
	bool isActive(){
		/*if(parts.template has<vecT>()){
			vecT& vec = parts.template get<vecT>();
			for (auto it = vec.begin(); it < vec.end(); it+=(*it)&255) { //iterate by adding size of each part
				auto& attr = chunk.usedAttributes[((*it)>>8)+chunk.world->commonAttrs::active];
				if(attr.used && bool((*(it+1+attr.intOffset))&attr.mask)) return true;
			}
			return false;
		}else if(parts.template has<inStructT>()){
			inStructT& arr = parts.template get<inStructT>();
			auto& attr = chunk.usedAttributes[(arr[0]>>8)+chunk.world->commonAttrs::active];
			return attr.used && (arr[1+attr.intOffset])&attr.mask;
		}else return true;*/
		return bool(activeCount);
	}
	void flattenClient(ByteArray& arr, const Client* forClient, bool all, Chunk& chunk){
		arr.add(chunk.world->worldStuff.flattenClient(*this,chunk));
	}
	void flattenEdges(ByteArray& arr, uint32_t neighbours){
		bool useVector = parts.template has<vecT>();
		bool inStructEmpty = parts.template has<emptyT>();
		arr.add(useVector | inStructEmpty<<1);
		if(useVector){
			vecT& vec = parts.template get<vecT>();
			arr.add(vec.size());
			arr.add(vec);
		}else if(!inStructEmpty){
			inStructT& arri = parts.template get<inStructT>();
			arr.add(std::begin(arri),std::end(arri));
		}
		//if(parts.index()>2)printy("oop "+std::to_string(parts.index()));
	}
	void unflattenEdges(ByteArray& arr,int32_t depth){
		int32_t stuff = arr.read();
		if(stuff&1){
			uint32_t l=arr.read();
			//if(l>2)throw std::runtime_error("l big "+std::to_string(l)+" at "+std::to_string(arr.idx));
			parts = std::move(arr.read(l));
		}else if(stuff&2){
			parts = emptyT();
		}else{
			inStructT arri = inStructT();
			for(int32_t i=0; i<partInStructSize; i++){
				arri[i] = arr.read();
			}
			parts = std::move(arri);
		}
	}
	template <typename DstT>
	void convIterateChunks(std::function<void(convChunk<WorldStuff>)> cb, int32_t depth,uint32_t x=0,uint32_t y=0,uint32_t z=0){
		cb(convChunk<WorldStuff>{.x=x,.y=y,.z=z,.depth=depth,.data=this});
	}
	PartsNode& operator=(const PartsNode& other){//copy assignment operator
		fillCell(other, 0,0,0, 0);
		return *this;
	}
	/*PartsNode& operator=(const PartsNode&& other){//move assignment operator
		parts = std::move(other.parts); //doesn't work, it copys
		activeCount = other.activeCount;
		return *this;
	}*/
	bool operator==(const PartsNode& other)const{
		return compare(other);
	}
	void updateAll(std::vector<Client*> clients){}
	//partsnode iterateActive should only be called when it is the only thing in a chunk
	subchunkChanges iterateActive(int32_t depth,vec3u pos, uint32_t& outNewAutoConvertMoveCount, Chunk& chunk){
		return chunk.tickActiveCb(argsForMove{this,pos,1u<<depth, *this, pos, depth, 0,depth}, outNewAutoConvertMoveCount);
	}
	uint32_t getLenAt(size_t where){
		return parts.template has<vecT>() ? (parts.template get<vecT>()[where]&255) : (parts.template has<inStructT>() ? (parts.template get<inStructT>()[where]&255) : 0);
	}
	subchunkChanges autoConvertTry(SubchunkNode& thisThing,int32_t depth, Chunk& chunk){
		return subchunkChanges();
	}
	/*void update(uint32_t x, uint32_t y, uint32_t z, int32_t depth){
		
	}*/
	std::string tostring() const{//printy("le"+std::to_string(parts.size())+" "+std::to_string((unsigned long long)(void**)this));
		std::string a="{";
		if(parts.template has<vecT>()){
			a += "vector:[";
			const vecT& vec = parts.template get<vecT>();
			for(const uint32_t i : vec){
				a=a+std::to_string(i)+",";
			}
		}else if(parts.template has<inStructT>()){
			a+="inStruct:[";
			const inStructT& arr = parts.template get<inStructT>();
			for(uint32_t i=0; i<partInStructSize; i++){
				a=a+std::to_string(arr[i])+",";
			}
		}else a+="empty:[";
		return a+"]}";
	}
};

/*
some code from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve

algorithm 1:
use z-order curve to find run of same stuff from current position
go back to the last biggest node

algorithm 2:
use z-order curve to find run of same stuff
figure out what octree leafs there are in this run
*/
template <typename T, typename arrT>
void arrayToChunks(arrT& arr, int32_t depth, std::function<void(int32_t x,int32_t y,int32_t z,int32_t depth,T& data)> cb){
	int32_t sh = depth+1;
	uint32_t size = ((uint32_t)1)<<sh;
	uint32_t indexend = size*size*size;
	uint32_t rx=0, ry=0, rz=0, prx = 0, pry = 0, prz = 0, ri = 0, pri = 0; //run
	bool notReachEnd = true;
	while(notReachEnd){
		T& startStuff = arr[(rx<<sh|ry)<<sh|rz];
		prx = rx, pry = ry, prz = rz, pri = ri;
		do{//find run of same stuff
			uint32_t carry = 1;
			do{
				uint32_t newcarry = rx & carry;
				rx ^= carry;
				carry = newcarry;
				newcarry = ry & carry;
				ry ^= carry;
				carry = newcarry;
				newcarry = (rz & carry) << 1;
				rz ^= carry;
				carry = newcarry;
			} while (carry != 0);
			ri++;
			if(ri == indexend){
				notReachEnd = false;
				break;
			}
		}while(startStuff==arr[(rx<<sh|ry)<<sh|rz]);
		//rx,ry,rz are the coords of the one after the last one in the run
		uint32_t undepthMask = 7, undepthPow8 = 1, undepthMaskLeft = ~0, undepth = 1;
		int32_t undepthN = -1;
		//first half (get bigger)
		while(!(pri & undepthMask) && undepth != size){
			undepthMask <<= 3; undepthPow8 <<= 3; undepthMaskLeft <<= 3; undepth <<= 1; undepthN++;
		}
		while((pri&undepthMaskLeft) != (ri&undepthMaskLeft)){
			cb(prx,pry,prz,undepthN,startStuff);
			pri += undepthPow8;
			uint32_t carry = undepth;
			do{
				uint32_t newcarry = prx & carry;
				prx ^= carry;
				carry = newcarry;
				newcarry = pry & carry;
				pry ^= carry;
				carry = newcarry;
				newcarry = (prz & carry) << 1;
				prz ^= carry;
				carry = newcarry;
			} while (carry != 0);
			while(!(pri & undepthMask)){
				undepthMask <<= 3; undepthPow8 <<= 3; undepthMaskLeft <<= 3; undepth <<= 1; undepthN++;
			}
		}

		//second half (get smaller)
		while(pri != ri){
			if((pri&undepthMaskLeft) == (ri&undepthMaskLeft)){
				//undepthMaskLeft should have sign bit set (negative) or it will break
				do{
					undepthMask >>= 3, undepthPow8 >>= 3; undepth >>= 1; undepthMaskLeft = rightShiftPad1(undepthMaskLeft,3); undepthN--;
				}while(!(ri & undepthMask) && undepth);
			}
			cb(prx,pry,prz,undepthN,startStuff);
			pri += undepthPow8;
			uint32_t carry = undepth;
			do{
				uint32_t newcarry = prx & carry;
				prx ^= carry;
				carry = newcarry;
				newcarry = pry & carry;
				pry ^= carry;
				carry = newcarry;
				newcarry = (prz & carry) << 1;
				prz ^= carry;
				carry = newcarry;
			} while (carry != 0);
		}
	}
}
template <typename T, typename arrT, typename WorldStuff>
coroutine arrayToChunksAsync(arrT& arr, int32_t depth, std::function<void(int32_t x,int32_t y,int32_t z,int32_t depth,T& data)> cb, World<WorldStuff>* world){
	int32_t sh = depth+1;
	uint32_t size = ((uint32_t)1)<<sh;
	uint32_t indexend = size*size*size;
	uint32_t rx=0, ry=0, rz=0, prx = 0, pry = 0, prz = 0, ri = 0, pri = 0; //run
	uint32_t iters = 0;
	bool notReachEnd = true;
	while(notReachEnd){
		if((iters & ARRAY_TO_CHUNKS_ITERS_PER_YIELD_THREAD) == 0){
			co_await yieldThread();
		}
		T& startStuff = arr[(rx<<sh|ry)<<sh|rz];
		prx = rx, pry = ry, prz = rz, pri = ri;
		do{//find run of same stuff
			uint32_t carry = 1;
			do{
				uint32_t newcarry = rx & carry;
				rx ^= carry;
				carry = newcarry;
				newcarry = ry & carry;
				ry ^= carry;
				carry = newcarry;
				newcarry = (rz & carry) << 1;
				rz ^= carry;
				carry = newcarry;
			} while (carry != 0);
			ri++;
			if(ri == indexend){
				notReachEnd = false;
				break;
			}
		}while(startStuff==arr[(rx<<sh|ry)<<sh|rz]);
		//rx,ry,rz are the coords of the one after the last one in the run
		uint32_t undepthMask = 7, undepthPow8 = 1, undepthMaskLeft = ~0, undepth = 1;
		int32_t undepthN = -1;
		//first half (get bigger)
		while(!(pri & undepthMask) && undepth != size){
			undepthMask <<= 3; undepthPow8 <<= 3; undepthMaskLeft <<= 3; undepth <<= 1; undepthN++;
		}
		while((pri&undepthMaskLeft) != (ri&undepthMaskLeft)){
			cb(prx,pry,prz,undepthN,startStuff);
			pri += undepthPow8;
			uint32_t carry = undepth;
			do{
				uint32_t newcarry = prx & carry;
				prx ^= carry;
				carry = newcarry;
				newcarry = pry & carry;
				pry ^= carry;
				carry = newcarry;
				newcarry = (prz & carry) << 1;
				prz ^= carry;
				carry = newcarry;
			} while (carry != 0);
			while(!(pri & undepthMask)){
				undepthMask <<= 3; undepthPow8 <<= 3; undepthMaskLeft <<= 3; undepth <<= 1; undepthN++;
			}
		}

		//second half (get smaller)
		while(pri != ri){
			if((pri&undepthMaskLeft) == (ri&undepthMaskLeft)){
				//undepthMaskLeft should have sign bit set (negative) or it will break
				do{
					undepthMask >>= 3, undepthPow8 >>= 3; undepth >>= 1; undepthMaskLeft = rightShiftPad1(undepthMaskLeft,3); undepthN--;
				}while(!(ri & undepthMask) && undepth);
			}
			cb(prx,pry,prz,undepthN,startStuff);
			pri += undepthPow8;
			uint32_t carry = undepth;
			do{
				uint32_t newcarry = prx & carry;
				prx ^= carry;
				carry = newcarry;
				newcarry = pry & carry;
				pry ^= carry;
				carry = newcarry;
				newcarry = (prz & carry) << 1;
				prz ^= carry;
				carry = newcarry;
			} while (carry != 0);
		}
		iters++;
		/*if(!world->canDoSlowStuff()){
			printy("before await");
			co_await std::suspend_always();
			printy("after await");
		}*/
	}
}

//max size: 2^31, highest bit used by active
template<typename WorldStuff>
class World<WorldStuff>::SubchunkArray{
	std::vector<PartsNode> arr;
	uint32_t w;
	uint32_t posMask;
	uint32_t size;
	int32_t depth;
	uint32_t autoConvertMoveCount;
	uint32_t autoConvertWaitCount;
	struct activeSet{
		std::vector<uint32_t> active;// active is used as set of indexes, so it's size can change
		std::vector<uint32_t> idxToActiveIdx;// key is index in main array, value is index in active
		static constexpr uint32_t notActive = std::numeric_limits<uint32_t>::max();
		void add(uint32_t i){
			if(idxToActiveIdx[i] == notActive){
				idxToActiveIdx[i] = active.size();
				active.push_back(i);
			}
			//printy("add"+std::to_string(i)+" "+std::to_string(active.size()));
		}
		void remove(uint32_t i){
			if(idxToActiveIdx[i] != notActive){
				idxToActiveIdx[active.back()] = idxToActiveIdx[i];
				active[idxToActiveIdx[i]] = active.back();
				active.pop_back();
				idxToActiveIdx[i] = notActive;
			}
			//printy("remove"+std::to_string(i)+" "+std::to_string(active.size()));
		}
		activeSet(uint32_t size): idxToActiveIdx(size, notActive)
		{
			active.reserve(size);
		}
	} active;
	struct updatesSet{
		std::vector<uint32_t> idxUpdated;// key is index in main array, value shows if it is updated
		std::vector<uint32_t> updateIdxs;// list of unique updated indexes
		uint32_t curUpdateId;
		updatesSet(uint32_t size):idxUpdated(size),curUpdateId(1){}
		void addIdx(uint32_t i){
			if(idxUpdated[i] != curUpdateId){
				idxUpdated[i] = curUpdateId;
				updateIdxs.push_back(i);
			}
		}
		void clear(){
			updateIdxs.clear();
			if(curUpdateId == std::numeric_limits<uint32_t>::max()){
				curUpdateId = 1;
				std::fill(idxUpdated.begin(),idxUpdated.end(),0);// old ids will be reused, so clear
			}else{
				curUpdateId++;
			}
			updatedAll = false;
		}
		bool updatedAll;
	};
	std::vector<std::pair<Client*,updatesSet>> clientUpdates;
	subchunkChanges updateI(uint32_t i, Chunk& chunk){
		PartsNode& cell = arr[i];
		subchunkChanges changes;
		if(cell.isActive()){
			if(active.active.empty()) changes.activeChange = true;
			active.add(i);
		}else{
			active.remove(i);
			if(active.active.empty()) changes.activeChange = true;
		}
		for(auto c : chunk.loadedClients){
			auto whereInUpdates = std::find_if(clientUpdates.begin(),clientUpdates.end(),[&](std::pair<Client*,updatesSet>& stuff){return stuff.first == c;});
			if(whereInUpdates == clientUpdates.end()){
				clientUpdates.emplace_back(c,size);
				whereInUpdates = clientUpdates.end()-1;
				changes.clientUpdated = true;
			}
			whereInUpdates->second.addIdx(i);
		}
		return changes;
	}
	public:
		SubchunkArray(int32_t depth):
		w(((uint32_t)1)<<(depth+1)), depth(depth), size(((uint32_t)1)<<((depth+1)*3)), arr(((uint32_t)1)<<((depth+1)*3)),
		active(((uint32_t)1)<<((depth+1)*3)), posMask((((uint32_t)1)<<(depth+1))-1)
		{}
		//not needed
		/*template <typename T>
		SubchunkArray(int32_t depth, const T& fillWith): w(1<<(depth+1)), depth(depth), arr(){
			arr.reserve(w*w*w);
			for(int32_t i=0; i<w*w*w; i++){
				arr.push_back(PartsNode(T));
			}
		}*/
		/*void update(uint32_t x, uint32_t y, uint32_t z, int32_t depth){
			updateI(((x&posMask)<<(depth+1) | (y&posMask))<<(depth+1) | (z&posMask));
			
		}*/
		template <typename T, typename T2>
		void add(const T& data, uint32_t x, uint32_t y, uint32_t z, int32_t depth, T2 func, Chunk& chunk){
			uint32_t i = ((x&posMask)<<(depth+1) | (y&posMask))<<(depth+1) | (z&posMask);
			PartsNode& cell = arr[i];
			cell.add(data,x,y,z,depth-1,func,chunk);
			updateI(i,chunk);
		}
		template <typename Iter,typename T>
		subchunkChanges addRaw(Iter begin,Iter end, uint32_t x,uint32_t y,uint32_t z, int32_t depth,const T wheres, Chunk& chunk){
			uint32_t i = ((x&posMask)<<(depth+1) | (y&posMask))<<(depth+1) | (z&posMask);
			PartsNode& cell = arr[i];
			cell.addRaw(begin,end,x,y,z,depth-1,wheres,chunk);
			//printy(std::to_string(i)+" ar "+std::to_string(depth)+" "+std::to_string(this->depth)+" "+std::to_string(cell.activeCount));
			return updateI(i,chunk);
		}
		template <typename T>
		void fillCell(const T& what, uint32_t x, uint32_t y, uint32_t z, int32_t depth, Chunk& chunk){
			uint32_t i = ((x&posMask)<<(depth+1) | (y&posMask))<<(depth+1) | (z&posMask);
			PartsNode& cell = arr[i];
			cell.fillCell(what,x,y,z,depth-1,chunk);
			updateI(i,chunk);
		}
		void searchAround(vec3i where, uint32_t whereS,vec3i thisPos,int32_t depth, std::function<void(PartsNode*, uint32_t,uint32_t,vec3i, Chunk&)> cb, Chunk& chunk){
			int32_t xmin = std::max(0,where.x-thisPos.x-int32_t(whereS)), xmax = std::min(int32_t(w),where.x-thisPos.x+int32_t(whereS)), ymin = std::max(0,where.y-thisPos.y-int32_t(whereS)), ymax = std::min(int32_t(w),where.y-thisPos.y+int32_t(whereS)), zmin = std::max(0,where.z-thisPos.z-int32_t(whereS)), zmax = std::min(int32_t(w),where.z-thisPos.z+int32_t(whereS));
			for(int32_t x=xmin; x<xmax; ++x){for(int32_t y=ymin; y<ymax; ++y){for(int32_t z=zmin; z<zmax; ++z){
				arr[(x<<(depth+1) | y)<<(depth+1) | z].searchAround(where,whereS,thisPos+vec3i(x,y,z),depth,cb,chunk);
			}}}
		}
		/*//only works when containing partsnode
		subchunkChanges remove(uint32_t where, uint32_t x, uint32_t y, uint32_t z, int32_t depth){
			uint32_t i = ((x&posMask)<<(depth+1) | (y&posMask))<<(depth+1) | (z&posMask);
			PartsNode& cell = arr[i];
			cell.remove(where, x,y,z,depth);
			return updateI(i);
		}*/
		bool isActive(){
			//return bool(active.active.size());
			return true; //array may need to be converted back any time, so keep iterating
		}
		subchunkChanges iterateActive(int32_t depth,vec3u pos, uint32_t& outNewAutoConvertMoveCount, Chunk& chunk){
			//iterating in reverse makes it not skip
			subchunkChanges changes;
			uint32_t newAutoConvertMoveCount = 0;
			if(!active.active.empty()){
				for(size_t i2=active.active.size(); i2 --> 0;){// wow! it's an arrow!
					uint32_t i = active.active[i2];
					changes.combine(chunk.tickActiveCb(argsForMove{this,pos,w,arr[i], pos+vec3u( i>>(depth+1+depth+1), (i>>(depth+1))&posMask, i&posMask ), -1, 0, depth}, newAutoConvertMoveCount));
					updateI(i,chunk);
				}
			}
			outNewAutoConvertMoveCount += newAutoConvertMoveCount;
			//autoConvertMoveCount += newAutoConvertMoveCount;
			//if(autoConvertMoveCount) autoConvertMoveCount--;
			autoConvertMoveCount = autoConvertMoveCount*0.875+newAutoConvertMoveCount*0.125;
			if(autoConvertWaitCount>0) autoConvertWaitCount--;
			if(newAutoConvertMoveCount>(((uint32_t)1)<<((depth+1)*3))){
				autoConvertWaitCount = WAIT_COUNT;
			}
			//if(!isActive()) autoConvertMoveCount = 0;
			return changes;
		}
		template <typename DstT>
		void convIterateChunks(std::function<void(convChunk<WorldStuff>)> cb, int32_t depth,uint32_t ox=0,uint32_t oy=0,uint32_t oz=0){
			arrayToChunks<PartsNode>(arr,depth, [&](int32_t x,int32_t y,int32_t z,int32_t depth, PartsNode& data){
				cb(convChunk<WorldStuff>{.x=x+ox,.y=y+oy,.z=z+oz,.depth=depth,.data=&data});
			});
		}
		template<>// can be faster when moving
		void convIterateChunks<SubchunkArray>(std::function<void(convChunk<WorldStuff>)> cb, int32_t depth,uint32_t ox,uint32_t oy,uint32_t oz){
			for(uint32_t i=0; i<size; i++){
				cb(convChunk<WorldStuff>{.x=(i>>(depth+1+depth+1))+ox,.y=(i>>(depth+1)&posMask)+oy,.z=(i&posMask)+oz,.depth=-1,.data=&arr[i]});
			}
		}
		void convFromChunks(convChunk<WorldStuff> toAdd, int32_t originalDepth, bool moveNoCopy){
			int32_t sh=depth+1;
			if(toAdd.depth == -1){
				uint32_t i = (toAdd.x<<sh|toAdd.y)<<sh|toAdd.z;
				arr[i] = moveNoCopy ? std::move(*toAdd.data) : toAdd.data/*copy*/;
				if(toAdd.data->isActive()) active.add(i);
			}else{//fill up an area
				uint32_t x=0;
				uint32_t y=0;
				uint32_t z=0;
				uint32_t w = ((uint32_t)1)<<(toAdd.depth+1);
				bool itactive = bool(toAdd.data->isActive());
				while(x != w){
					uint32_t i = ((x+toAdd.x)<<sh|(y+toAdd.y))<<sh|(z+toAdd.z);
					arr[i] = toAdd.data; //copy
					if(itactive) active.add(i);
					if(++z == w){
						z=0;
						if(++y == w){
							y=0;
							x++;
						}
					}
				}
			}
		}
		void flattenClient(ByteArray& barr, const Client* forClient, bool all, Chunk& chunk){
			auto uI = std::find_if(clientUpdates.begin(), clientUpdates.end(), [&forClient](std::pair<Client*, updatesSet>& thing){return thing.first==forClient;});
			updatesSet& u = uI->second;
			//barr.removeAndAdd(0);barr.add(2);u.clear();return;//temps
			barr.add(w);
			if(u.updatedAll || all){
				barr.add(1);
				for(auto& p : arr){
					p.flattenClient(barr,forClient,true,chunk);
				}
			}else{
				barr.add(0).add(u.updateIdxs.size());
				for(auto i : u.updateIdxs){
					barr.add(i);
					arr[i].flattenClient(barr,forClient,all,chunk);
				}
			}
			u.clear();
		}
	private:
		void flattenEdgesThese(ByteArray& barr, uint32_t w,uint32_t h,uint32_t d,uint32_t ox,uint32_t oy,uint32_t oz,uint32_t neighbours){
			for(uint32_t x=ox; x!=w+ox; ++x){for(uint32_t y=oy; y!=h+oy; ++y){for(uint32_t z=oz; z!=d+oz; ++z){
				arr[(x<<(depth+1) | y)<<(depth+1) | z].flattenEdges(barr,neighbours);
			}}}
		}
		void unflattenEdgesThese(ByteArray& barr, uint32_t w,uint32_t h,uint32_t d,uint32_t ox,uint32_t oy,uint32_t oz){
			for(uint32_t x=ox; x!=w+ox; ++x){for(uint32_t y=oy; y!=h+oy; ++y){for(uint32_t z=oz; z!=d+oz; ++z){
				arr[(x<<(depth+1) | y)<<(depth+1) | z].unflattenEdges(barr,-1);
			}}}
		}
	public:
		void flattenEdges(ByteArray& arr, uint32_t neighbours){
			//find which 27 edges, sides, corners are touching the 27 neighbours
			uint32_t do000 = neighbours&0b000000000000001011000011011;
			uint32_t do100 = neighbours&0b000000000000000010000010010;
			uint32_t do200 = neighbours&0b000000000000100110000110110;
			uint32_t do010 = neighbours&0b000000000000001000000011000;
			uint32_t do110 = neighbours&0b000000000000000000000010000;
			uint32_t do210 = neighbours&0b000000000000100000000110000;
			uint32_t do020 = neighbours&0b000000000011001000011011000;
			uint32_t do120 = neighbours&0b000000000010000000010010000;
			uint32_t do220 = neighbours&0b000000000110100000110110000;
			uint32_t do001 = neighbours&0b000000000000001011000000000;
			uint32_t do101 = neighbours&0b000000000000000010000000000;
			uint32_t do201 = neighbours&0b000000000000100110000000000;
			uint32_t do011 = neighbours&0b000000000000001000000000000;
			//   do111   center not exposed
			uint32_t do211 = neighbours&0b000000000000100000000000000;
			uint32_t do021 = neighbours&0b000000000011001000000000000;
			uint32_t do121 = neighbours&0b000000000010000000000000000;
			uint32_t do221 = neighbours&0b000000000110100000000000000;
			uint32_t do002 = neighbours&0b000011011000001011000000000;
			uint32_t do102 = neighbours&0b000010010000000010000000000;
			uint32_t do202 = neighbours&0b000110110000100110000000000;
			uint32_t do012 = neighbours&0b000011000000001000000000000;
			uint32_t do112 = neighbours&0b000010000000000000000000000;
			uint32_t do212 = neighbours&0b000110000000100000000000000;
			uint32_t do022 = neighbours&0b011011000011001000000000000;
			uint32_t do122 = neighbours&0b010010000010000000000000000;
			uint32_t do222 = neighbours&0b110110000110100000000000000;

			arr.add(bool(do000)|bool(do100)<<1|bool(do200)<<2|bool(do010)<<3|bool(do110)<<4|bool(do210)<<5|bool(do020)<<6|bool(do120)<<7|bool(do220)<<8|bool(do001)<<9|bool(do101)<<10|bool(do201)<<11|bool(do011)<<12/*center*/|bool(do211)<<14|bool(do021)<<15|bool(do121)<<16|bool(do221)<<17|bool(do002)<<18|bool(do102)<<19|bool(do202)<<20|bool(do012)<<21|bool(do112)<<22|bool(do212)<<23|bool(do022)<<24|bool(do122)<<25|bool(do222)<<26);
			uint32_t o = w-1;//corner offset
			uint32_t l = w-2;//edge width

			if(do000) flattenEdgesThese(arr,1,1,1, 0,0,0,neighbours);
			if(do100) flattenEdgesThese(arr,l,1,1, 1,0,0,neighbours);
			if(do200) flattenEdgesThese(arr,1,1,1, o,0,0,neighbours);
			if(do010) flattenEdgesThese(arr,1,l,1, 0,1,0,neighbours);
			if(do110) flattenEdgesThese(arr,l,l,1, 1,1,0,neighbours);
			if(do210) flattenEdgesThese(arr,1,l,1, o,1,0,neighbours);
			if(do020) flattenEdgesThese(arr,1,1,1, 0,o,0,neighbours);
			if(do120) flattenEdgesThese(arr,l,1,1, 1,o,0,neighbours);
			if(do220) flattenEdgesThese(arr,1,1,1, o,o,0,neighbours);

			if(do001) flattenEdgesThese(arr,1,1,l, 0,0,1,neighbours);
			if(do101) flattenEdgesThese(arr,l,1,l, 1,0,1,neighbours);
			if(do201) flattenEdgesThese(arr,1,1,l, o,0,1,neighbours);
			if(do011) flattenEdgesThese(arr,1,l,l, 0,1,1,neighbours);
			// do111  no center
			if(do211) flattenEdgesThese(arr,1,l,l, o,1,1,neighbours);
			if(do021) flattenEdgesThese(arr,1,1,l, 0,o,1,neighbours);
			if(do121) flattenEdgesThese(arr,l,1,l, 1,o,1,neighbours);
			if(do221) flattenEdgesThese(arr,1,1,l, o,o,1,neighbours);

			if(do002) flattenEdgesThese(arr,1,1,1, 0,0,o,neighbours);
			if(do102) flattenEdgesThese(arr,l,1,1, 1,0,o,neighbours);
			if(do202) flattenEdgesThese(arr,1,1,1, o,0,o,neighbours);
			if(do012) flattenEdgesThese(arr,1,l,1, 0,1,o,neighbours);
			if(do112) flattenEdgesThese(arr,l,l,1, 1,1,o,neighbours);
			if(do212) flattenEdgesThese(arr,1,l,1, o,1,o,neighbours);
			if(do022) flattenEdgesThese(arr,1,1,1, 0,o,o,neighbours);
			if(do122) flattenEdgesThese(arr,l,1,1, 1,o,o,neighbours);
			if(do222) flattenEdgesThese(arr,1,1,1, o,o,o,neighbours);
		}
		void unflattenEdges(ByteArray& arr, int32_t depth){ //if(this->depth!=arr.next())printy(std::to_string(this->depth)+" "+std::to_string(arr.next())+" "+std::to_string(depth));arr.read();
			uint32_t dow = arr.read();
			uint32_t o = w-1;//corner offset
			uint32_t l = w-2;//edge width

			if(dow&(((uint32_t)1)<<0)) unflattenEdgesThese(arr,1,1,1, 0,0,0);
			if(dow&(((uint32_t)1)<<1)) unflattenEdgesThese(arr,l,1,1, 1,0,0);
			if(dow&(((uint32_t)1)<<2)) unflattenEdgesThese(arr,1,1,1, o,0,0);
			if(dow&(((uint32_t)1)<<3)) unflattenEdgesThese(arr,1,l,1, 0,1,0);
			if(dow&(((uint32_t)1)<<4)) unflattenEdgesThese(arr,l,l,1, 1,1,0);
			if(dow&(((uint32_t)1)<<5)) unflattenEdgesThese(arr,1,l,1, o,1,0);
			if(dow&(((uint32_t)1)<<6)) unflattenEdgesThese(arr,1,1,1, 0,o,0);
			if(dow&(((uint32_t)1)<<7)) unflattenEdgesThese(arr,l,1,1, 1,o,0);
			if(dow&(((uint32_t)1)<<8)) unflattenEdgesThese(arr,1,1,1, o,o,0);

			if(dow&(((uint32_t)1)<<9)) unflattenEdgesThese(arr,1,1,l, 0,0,1);
			if(dow&(((uint32_t)1)<<10)) unflattenEdgesThese(arr,l,1,l, 1,0,1);
			if(dow&(((uint32_t)1)<<11)) unflattenEdgesThese(arr,1,1,l, o,0,1);
			if(dow&(((uint32_t)1)<<12)) unflattenEdgesThese(arr,1,l,l, 0,1,1);
			// do111  no center
			if(dow&(((uint32_t)1)<<14)) unflattenEdgesThese(arr,1,l,l, o,1,1);
			if(dow&(((uint32_t)1)<<15)) unflattenEdgesThese(arr,1,1,l, 0,o,1);
			if(dow&(((uint32_t)1)<<16)) unflattenEdgesThese(arr,l,1,l, 1,o,1);
			if(dow&(((uint32_t)1)<<17)) unflattenEdgesThese(arr,1,1,l, o,o,1);

			if(dow&(((uint32_t)1)<<18)) unflattenEdgesThese(arr,1,1,1, 0,0,o);
			if(dow&(((uint32_t)1)<<19)) unflattenEdgesThese(arr,l,1,1, 1,0,o);
			if(dow&(((uint32_t)1)<<20)) unflattenEdgesThese(arr,1,1,1, o,0,o);
			if(dow&(((uint32_t)1)<<21)) unflattenEdgesThese(arr,1,l,1, 0,1,o);
			if(dow&(((uint32_t)1)<<22)) unflattenEdgesThese(arr,l,l,1, 1,1,o);
			if(dow&(((uint32_t)1)<<23)) unflattenEdgesThese(arr,1,l,1, o,1,o);
			if(dow&(((uint32_t)1)<<24)) unflattenEdgesThese(arr,1,1,1, 0,o,o);
			if(dow&(((uint32_t)1)<<25)) unflattenEdgesThese(arr,l,1,1, 1,o,o);
			if(dow&(((uint32_t)1)<<26)) unflattenEdgesThese(arr,1,1,1, o,o,o);
		}
		void updateAll(std::vector<Client*> clients){
			for(auto c : clients){
				auto whereInUpdates = std::find_if(clientUpdates.begin(),clientUpdates.end(),[&](std::pair<Client*,updatesSet>& stuff){return stuff.first == c;});
				if(whereInUpdates == clientUpdates.end()){
					clientUpdates.emplace_back(c,updatesSet(size));
					whereInUpdates = clientUpdates.end()-1;
				}
				whereInUpdates->second.updatedAll = true;
			}
		}
		subchunkChanges autoConvertTry(SubchunkNode& thisThing,int32_t depth, Chunk& chukn);
		std::string tostring()const{
			std::string a = "{scArr:[";
			for(auto& i : arr){
				a += i.tostring()+",";
			}
			return a+"]}";
		}
};

template <typename WorldStuff>
class World<WorldStuff>::SubchunkOctree {
  public: 
		//static inline lessAllocator<SubchunkOctree> allocer{};
		template <typename T>
		SubchunkOctree(int32_t depth, T& fillWith):things{
			std::make_unique<PartsNode>(fillWith),std::make_unique<PartsNode>(fillWith),std::make_unique<PartsNode>(fillWith),std::make_unique<PartsNode>(fillWith),
			std::make_unique<PartsNode>(fillWith),std::make_unique<PartsNode>(fillWith),std::make_unique<PartsNode>(fillWith),std::make_unique<PartsNode>(fillWith)
		},autoConvertMoveCount(0)//,autoConvertActiveCount(fillWith.isActive()*8)
		{
			//if(autoConvertActiveCount) active.set();
			if(fillWith.isActive()) active.fill();
		}
		SubchunkOctree(int32_t depth):things{
			std::make_unique<PartsNode>(),std::make_unique<PartsNode>(),std::make_unique<PartsNode>(),std::make_unique<PartsNode>(),
			std::make_unique<PartsNode>(),std::make_unique<PartsNode>(),std::make_unique<PartsNode>(),std::make_unique<PartsNode>()
		},autoConvertMoveCount(0)//,autoConvertActiveCount(0)
		{}
		/*~SubchunkOctree(){
			for(uint32_t i=0; i<8; i++){
				if(things[i].template has<std::unique_ptr<SubchunkOctree>>()){
					auto old = things[i].template get<std::unique_ptr<SubchunkOctree>>().release();
					old->~SubchunkOctree();
					allocer.deallocOne(old);
				}
			}
		}*/
	private:
		SubchunkNode things[8];
		myBitset<uint8_t,8> active;
		//uint32_t autoConvertActiveCount;
		uint32_t autoConvertMoveCount;
		std::vector<std::pair<Client*,myBitset<uint16_t,9>>> clientUpdates; //9th bit is update all
	public:
		bool canMerge(){
			if(!things[0].template has<std::unique_ptr<PartsNode>>()) return false;
			std::unique_ptr<PartsNode>& first = things[0].template get<std::unique_ptr<PartsNode>>();
			return(
				things[1].template has<std::unique_ptr<PartsNode>>() &&
				things[2].template has<std::unique_ptr<PartsNode>>() &&
				things[3].template has<std::unique_ptr<PartsNode>>() &&
				things[4].template has<std::unique_ptr<PartsNode>>() &&
				things[5].template has<std::unique_ptr<PartsNode>>() &&
				things[6].template has<std::unique_ptr<PartsNode>>() &&
				things[7].template has<std::unique_ptr<PartsNode>>() &&
				things[1].template get<std::unique_ptr<PartsNode>>()->compare(*first) &&
				things[2].template get<std::unique_ptr<PartsNode>>()->compare(*first) &&
				things[3].template get<std::unique_ptr<PartsNode>>()->compare(*first) &&
				things[4].template get<std::unique_ptr<PartsNode>>()->compare(*first) &&
				things[5].template get<std::unique_ptr<PartsNode>>()->compare(*first) &&
				things[6].template get<std::unique_ptr<PartsNode>>()->compare(*first) &&
				things[7].template get<std::unique_ptr<PartsNode>>()->compare(*first)
			);
		}
		SubchunkNode& merge(){
			/*for(uint32_t i=1; i<8; ++i){
				if(things[i].template has<std::unique_ptr<SubchunkOctree>>()){
					auto old = things[i].template get<std::unique_ptr<SubchunkOctree>>().release();
					old->~SubchunkOctree();
					allocer.deallocOne(old);
				}
			}*/
			return things[0];
		}
		bool isActive(){
			return active.any();//autoConvertActiveCount;
		}
		//Causes flattenClient to do whole tree (for when chunk loads for player and other stuff)
		void updateAll(std::vector<Client*> clients){
			for(auto c : clients){
				auto where = std::find_if(clientUpdates.begin(), clientUpdates.end(), [&c](std::pair<Client*, myBitset<uint16_t,9>>& thing){return thing.first==c;});
				if(where == clientUpdates.end()){
					clientUpdates.emplace_back(c,myBitset<uint16_t,9>().fill());
				}else{
					where->second.fill();
				}
			}
		}
	private:
		template <typename T>
		subchunkChanges updateI(uint32_t i, Chunk& chunk, T& thing, subchunkChanges deeperUpdates=subchunkChanges(true)){
			subchunkChanges changes;
			/*uint32_t newAutoConvertActiveCount = 0;
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[0] = bool(a);},things[0]);
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[1] = bool(a);},things[1]);
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[2] = bool(a);},things[2]);
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[3] = bool(a);},things[3]);
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[4] = bool(a);},things[4]);
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[5] = bool(a);},things[5]);
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[6] = bool(a);},things[6]);
			std::visit([&,this](auto& athing) { uint32_t a = athing->isActive(); newAutoConvertActiveCount += a; active[7] = bool(a);},things[7]);
			changes.activeChange = newAutoConvertActiveCount != autoConvertActiveCount;
			autoConvertActiveCount = newAutoConvertActiveCount;*/
			bool prevActive = isActive();
			active.set(i,thing->isActive());
			changes.activeChange = isActive() != prevActive;
			//always check for merge so it will work with caching
			//if(canMerge()) changes.merge = true;
			if constexpr(std::is_same<T,std::unique_ptr<SubchunkOctree>>::value){
				if(thing->canMerge()){
					auto stuff = std::move(thing->merge().template get<std::unique_ptr<PartsNode>>());
					things[i] = std::move(stuff);
					changes.merge = true;
				}
			}
			if(deeperUpdates.clientUpdated){
				for(auto c : chunk.loadedClients){
					auto where = std::find_if(clientUpdates.begin(), clientUpdates.end(), [&c](std::pair<Client*, myBitset<uint16_t,9>>& thing){return thing.first==c;});
					if(where == clientUpdates.end()){
						auto u = myBitset<uint16_t,9>();
						u.set(i,true);
						clientUpdates.emplace_back(c,u);
						changes.clientUpdated = true;
					}else{
						where->second.set(i,true);
					}
				}
			}
			return changes;
		}
	public:
		/*//update thing at position
		void update(uint32_t x, uint32_t y, uint32_t z, int32_t depth){
			uint32_t i = (x>>depth & 1)<<2 | (y>>depth & 1)<<1 | (z>>depth & 1);
			std::visit([&,this](auto& athing) {
				athing->update(x,y,z,depth-1);
			},things[i]);
			updateI(i);
		}*/
		template <typename T, typename T2>
		void add(const T& data, uint32_t x, uint32_t y, uint32_t z, int32_t depth, T2 func, Chunk& chunk){
			uint32_t i = (x>>depth & 1)<<2 | (y>>depth & 1)<<1 | (z>>depth & 1);
			//		printy("add  "+std::to_string(depth)+" "+std::to_string(i));
			things[i].visit([&]<typename Thing>(Thing& athing) {
				if constexpr(std::is_same<Thing,std::unique_ptr<PartsNode>>::value){if(depth != 0){
					//printy("split "+std::to_string(depth));
					auto newthing = new /*(allocer.allocOne())*/ SubchunkOctree(depth-1,*athing);
					things[i] = std::unique_ptr<SubchunkOctree>(newthing);//split
					newthing->updateAll(chunk.loadedClients);
					newthing->add(data,x,y,z,depth-1,func,chunk);
					return updateI(i,chunk,newthing);
				}}
				athing->add(data,x,y,z,depth-1,func,chunk);
				return updateI(i,chunk,athing);
				//printy("a "+std::to_string(depth)+" "+(athing->isActive()?"t":"f"));
			});
		}
		template <typename Iter,typename T>
		subchunkChanges addRaw(Iter begin,Iter end, uint32_t x,uint32_t y,uint32_t z, int32_t depth,const T wheres, Chunk& chunk){
			uint32_t i = (x>>depth & 1)<<2 | (y>>depth & 1)<<1 | (z>>depth & 1);
			return things[i].visit([&]<typename Thing>(Thing& athing) {
				if constexpr(std::is_same<Thing,std::unique_ptr<PartsNode>>::value){if(depth != 0){
					//printy("split "+std::to_string(depth));
					auto newthing = new /*(allocer.allocOne())*/ SubchunkOctree(depth-1,*athing);
					things[i] = std::unique_ptr<SubchunkOctree>(newthing);//split
					newthing->updateAll(chunk.loadedClients);
					subchunkChanges deeperChanges = newthing->addRaw(begin,end,x,y,z,depth-1,wheres,chunk);
					deeperChanges.clientUpdated = true; //because of updateAll
					return updateI(i,chunk,newthing,deeperChanges);
				}}
				return updateI(i,chunk,athing,athing->addRaw(begin,end,x,y,z,depth-1,wheres,chunk));
			});
		}
		template <typename T>
		void fillCell(const T& what, uint32_t x, uint32_t y, uint32_t z, int32_t depth, Chunk& chunk){
			uint32_t i = (x>>depth & 1)<<2 | (y>>depth & 1)<<1 | (z>>depth & 1);
			//		printy("fill  "+std::to_string(depth)+" "+std::to_string(i));
			things[i].visit([&]<typename Thing>(Thing& athing) {
				if constexpr(std::is_same<Thing,std::unique_ptr<PartsNode>>::value){if(depth != 0){
					//printy("split "+std::to_string(depth));
					auto newthing = new /*(allocer.allocOne())*/ SubchunkOctree(depth-1,*athing);
					things[i] = std::unique_ptr<SubchunkOctree>(newthing);//split
					newthing->updateAll(chunk.loadedClients);
					newthing->fillCell(what,x,y,z,depth-1,chunk);
					return updateI(i,chunk,newthing);
				}}
				athing->fillCell(what,x,y,z,depth-1,chunk);
				return updateI(i,chunk,athing);
			});
		}
		/*//only works when containing partsnode
		subchunkChanges remove(uint32_t where, uint32_t x, uint32_t y, uint32_t z, int32_t depth){
			uint32_t i = (x>>depth & 1)<<2 | (y>>depth & 1)<<1 | (z>>depth & 1);
			std::unique_ptr<PartsNode>& athing = thing.template get<std::unique_ptr<PartsNode>>();
			athing->remove(where,x,y,z,depth-1);
			return updateI(i);
		}*/
		void searchAround(vec3i where, uint32_t whereS, vec3i thisPos, int32_t depth, std::function<void(PartsNode*, uint32_t,uint32_t,vec3i, Chunk&)> cb, Chunk& chunk){
			int32_t cs = ((uint32_t)1)<<(depth+1);
			//printy(std::string("sa ")+(where.z-int32_t(whereS)<thisPos.z+cs ? "t":"f")+(where.z+int32_t(whereS)>=thisPos.z?"t":"f"));
			if(where.x-int32_t(whereS)<thisPos.x+cs && where.x+int32_t(whereS)>=thisPos.x && where.y-int32_t(whereS)<thisPos.y+cs && where.y+int32_t(whereS)>=thisPos.y && where.z-int32_t(whereS)<thisPos.z+cs && where.z+int32_t(whereS)>=thisPos.z){
				int32_t s = ((uint32_t)1)<<depth;
				things[0].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos             ,depth-1,cb,chunk);});
				things[1].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos+vec3i(0,0,s),depth-1,cb,chunk);});
				things[2].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos+vec3i(0,s,0),depth-1,cb,chunk);});
				things[3].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos+vec3i(0,s,s),depth-1,cb,chunk);});
				things[4].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos+vec3i(s,0,0),depth-1,cb,chunk);});
				things[5].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos+vec3i(s,0,s),depth-1,cb,chunk);});
				things[6].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos+vec3i(s,s,0),depth-1,cb,chunk);});
				things[7].visit([&](auto& thing){thing->searchAround(where,whereS,thisPos+vec3i(s,s,s),depth-1,cb,chunk);});
			}
		}
		subchunkChanges autoConvertTry(SubchunkNode& thisThing,int32_t depth, Chunk& chunk){
			//if(autoConvertActiveCount>(((uint32_t)1)<<((depth+1)*3-1))){//half size
			// if depth is 0, it is similar to array already
			if(autoConvertMoveCount>(((uint32_t)1)<<((depth+1)*3)) && depth>0 && chunk.world->canDoSlowStuff()){
				//printy("It changed!");
				thisThing = std::unique_ptr<SubchunkArray>(volumeConvert<WorldStuff,SubchunkArray>(*this, depth, true).dst);
				thisThing.template get<std::unique_ptr<SubchunkArray>>()->updateAll(chunk.loadedClients);
				return subchunkChanges(true);
			}
			return subchunkChanges();
		}
		subchunkChanges iterateActive(int32_t depth,vec3u pos, uint32_t& outNewAutoConvertMoveCount, Chunk& chunk){
			int32_t s = ((uint32_t)1)<<depth;
			uint32_t cs = ((uint32_t)1)<<(depth+1);
			uint32_t newAutoConvertMoveCount = 0;
			subchunkChanges changes; //the tickActiveCb changes is combined with changes directly because it can cause changes to octree
			if(active[0]){ if(!isSubchunk<WorldStuff>(things[0])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[0].template get<std::unique_ptr<PartsNode>>(),pos             ,depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(0,chunk,things[0].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[0].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[0],depth-1,chunk));}); things[0].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos             ,newAutoConvertMoveCount,chunk)); changes.combine(updateI(0,chunk,thing,thatChanges)); }); } }
			if(active[1]){ if(!isSubchunk<WorldStuff>(things[1])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[1].template get<std::unique_ptr<PartsNode>>(),pos+vec3u(0,0,s),depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(1,chunk,things[1].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[1].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[1],depth-1,chunk));}); things[1].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos+vec3u(0,0,s),newAutoConvertMoveCount,chunk)); changes.combine(updateI(1,chunk,thing,thatChanges)); }); } }
			if(active[2]){ if(!isSubchunk<WorldStuff>(things[2])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[2].template get<std::unique_ptr<PartsNode>>(),pos+vec3u(0,s,0),depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(2,chunk,things[2].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[2].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[2],depth-1,chunk));}); things[2].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos+vec3u(0,s,0),newAutoConvertMoveCount,chunk)); changes.combine(updateI(2,chunk,thing,thatChanges)); }); } }
			if(active[3]){ if(!isSubchunk<WorldStuff>(things[3])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[3].template get<std::unique_ptr<PartsNode>>(),pos+vec3u(0,s,s),depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(3,chunk,things[3].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[3].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[3],depth-1,chunk));}); things[3].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos+vec3u(0,s,s),newAutoConvertMoveCount,chunk)); changes.combine(updateI(3,chunk,thing,thatChanges)); }); } }
			if(active[4]){ if(!isSubchunk<WorldStuff>(things[4])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[4].template get<std::unique_ptr<PartsNode>>(),pos+vec3u(s,0,0),depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(4,chunk,things[4].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[4].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[4],depth-1,chunk));}); things[4].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos+vec3u(s,0,0),newAutoConvertMoveCount,chunk)); changes.combine(updateI(4,chunk,thing,thatChanges)); }); } }
			if(active[5]){ if(!isSubchunk<WorldStuff>(things[5])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[5].template get<std::unique_ptr<PartsNode>>(),pos+vec3u(s,0,s),depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(5,chunk,things[5].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[5].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[5],depth-1,chunk));}); things[5].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos+vec3u(s,0,s),newAutoConvertMoveCount,chunk)); changes.combine(updateI(5,chunk,thing,thatChanges)); }); } }
			if(active[6]){ if(!isSubchunk<WorldStuff>(things[6])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[6].template get<std::unique_ptr<PartsNode>>(),pos+vec3u(s,s,0),depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(6,chunk,things[6].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[6].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[6],depth-1,chunk));}); things[6].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos+vec3u(s,s,0),newAutoConvertMoveCount,chunk)); changes.combine(updateI(6,chunk,thing,thatChanges)); }); } }
			if(active[7]){ if(!isSubchunk<WorldStuff>(things[7])){subchunkChanges thatChanges = chunk.tickActiveCb(argsForMove{this,pos,cs,*things[7].template get<std::unique_ptr<PartsNode>>(),pos+vec3u(s,s,s),depth-1,0,depth},newAutoConvertMoveCount);changes.combine(thatChanges);updateI(7,chunk,things[7].template get<std::unique_ptr<PartsNode>>(),thatChanges);}else{ subchunkChanges thatChanges; things[7].visit([&,this](auto& thing){thatChanges.combine(thing->autoConvertTry(things[7],depth-1,chunk));}); things[7].visit([&,this](auto& thing){ thatChanges.combine(thing->iterateActive(depth-1,pos+vec3u(s,s,s),newAutoConvertMoveCount,chunk)); changes.combine(updateI(7,chunk,thing,thatChanges)); }); } }
			outNewAutoConvertMoveCount += newAutoConvertMoveCount;
			//autoConvertMoveCount += newAutoConvertMoveCount;
			//if(autoConvertMoveCount > 0) autoConvertMoveCount--;
			autoConvertMoveCount = autoConvertMoveCount*0.875+newAutoConvertMoveCount*0.125;
			if(!isActive()) autoConvertMoveCount = 0;
			//printy(std::to_string(depth)+" "+std::to_string(autoConvertMoveCount));
			return changes;
		}
		void flattenClient(ByteArray& arr, const Client* forClient, bool all, Chunk& chunk){
			auto uI = std::find_if(clientUpdates.begin(), clientUpdates.end(), [&forClient](std::pair<Client*, myBitset<uint16_t,9>>& thing){return thing.first==forClient;});
			unsigned long updatesN = all ? 0x1ff/*9th bit*/ : (uI == clientUpdates.end() ? 0 : (*uI).second.x); //sometimes, whole tree should be added (for when chunk loads for player and other stuff)
			bool newAll = updatesN & 0x100;
			if(uI != clientUpdates.end()) clientUpdates.erase(uI);
			arr.add(updatesN);
			if(updatesN&1){ arr.add(things[0].index()); things[0].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			if(updatesN&2){ arr.add(things[1].index()); things[1].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			if(updatesN&4){ arr.add(things[2].index()); things[2].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			if(updatesN&8){ arr.add(things[3].index()); things[3].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			if(updatesN&16){ arr.add(things[4].index()); things[4].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			if(updatesN&32){ arr.add(things[5].index()); things[5].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			if(updatesN&64){ arr.add(things[6].index()); things[6].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			if(updatesN&128){ arr.add(things[7].index()); things[7].visit([&](auto& thing){ thing->flattenClient(arr,forClient,newAll,chunk);});}
			/*if(updatesN&1){ arr.add(things[0].index()); arr.add(pointers[0]); }
			if(updatesN&2){ arr.add(things[1].index()); arr.add(pointers[1]); }
			if(updatesN&4){ arr.add(things[2].index()); arr.add(pointers[2]); }
			if(updatesN&8){ arr.add(things[3].index()); arr.add(pointers[3]); }
			if(updatesN&16){ arr.add(things[4].index()); arr.add(pointers[4]); }
			if(updatesN&32){ arr.add(things[5].index()); arr.add(pointers[5]); }
			if(updatesN&64){ arr.add(things[6].index()); arr.add(pointers[6]); }
			if(updatesN&128){ arr.add(things[7].index()); arr.add(pointers[7]); }*/
		}
		void flattenEdges(ByteArray& arr, uint32_t neighbours){
			uint32_t do0 = neighbours&0b000000000000001011000011011;
			uint32_t do1 = neighbours&0b000000000000100110000110110;
			uint32_t do2 = neighbours&0b000000000011001000011011000;
			uint32_t do3 = neighbours&0b000000000110100000110110000;
			uint32_t do4 = neighbours&0b000011011000001011000000000;
			uint32_t do5 = neighbours&0b000110110000100110000000000;
			uint32_t do6 = neighbours&0b011011000011001000000000000;
			uint32_t do7 = neighbours&0b110110000110100000000000000;
			arr.add(bool(do7)<<7|bool(do6)<<6|bool(do5)<<5|bool(do4)<<4|bool(do3)<<3|bool(do2)<<2|bool(do1)<<1|bool(do0));
			if(do0){ arr.add(things[0].index()); things[0].visit([&arr,&do0](auto& thing){thing->flattenEdges(arr,do0);});}
			if(do1){ arr.add(things[1].index()); things[1].visit([&arr,&do1](auto& thing){thing->flattenEdges(arr,do1);});}
			if(do2){ arr.add(things[2].index()); things[2].visit([&arr,&do2](auto& thing){thing->flattenEdges(arr,do2);});}
			if(do3){ arr.add(things[3].index()); things[3].visit([&arr,&do3](auto& thing){thing->flattenEdges(arr,do3);});}
			if(do4){ arr.add(things[4].index()); things[4].visit([&arr,&do4](auto& thing){thing->flattenEdges(arr,do4);});}
			if(do5){ arr.add(things[5].index()); things[5].visit([&arr,&do5](auto& thing){thing->flattenEdges(arr,do5);});}
			if(do6){ arr.add(things[6].index()); things[6].visit([&arr,&do6](auto& thing){thing->flattenEdges(arr,do6);});}
			if(do7){ arr.add(things[7].index()); things[7].visit([&arr,&do7](auto& thing){thing->flattenEdges(arr,do7);});}
		}
		void unflattenEdges(ByteArray& arr, int32_t depth){
			int32_t dow = arr.read();
			int32_t depthminus = depth-1;
			if(dow&1){ size_t which = arr.read(); bool diff = which != things[0].index(); if(diff) things[0].fromIndex(which); things[0].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
			if(dow&2){ size_t which = arr.read(); bool diff = which != things[1].index(); if(diff) things[1].fromIndex(which); things[1].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
			if(dow&4){ size_t which = arr.read(); bool diff = which != things[2].index(); if(diff) things[2].fromIndex(which); things[2].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
			if(dow&8){ size_t which = arr.read(); bool diff = which != things[3].index(); if(diff) things[3].fromIndex(which); things[3].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
			if(dow&16){ size_t which = arr.read(); bool diff = which != things[4].index(); if(diff) things[4].fromIndex(which); things[4].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
			if(dow&32){ size_t which = arr.read(); bool diff = which != things[5].index(); if(diff) things[5].fromIndex(which); things[5].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
			if(dow&64){ size_t which = arr.read(); bool diff = which != things[6].index(); if(diff) things[6].fromIndex(which); things[6].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
			if(dow&128){ size_t which = arr.read(); bool diff = which != things[7].index(); if(diff) things[7].fromIndex(which); things[7].visit([&arr,&diff,&depthminus]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);}); }
		}
		template <typename DstT>
		void convIterateChunks(std::function<void(convChunk<WorldStuff>)> cb, int32_t depth,uint32_t x=0,uint32_t y=0,uint32_t z=0){
			uint32_t s = ((uint32_t)1)<<depth;
			things[0].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x,y,z);});
			things[1].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x,y,z+s);});
			things[2].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x,y+s,z);});
			things[3].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x,y+s,z+s);});
			things[4].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x+s,y,z);});
			things[5].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x+s,y,z+s);});
			things[6].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x+s,y+s,z);});
			things[7].visit([&](auto& thing){thing->template convIterateChunks<DstT>(cb,depth-1,x+s,y+s,z+s);});
			/*class octreeIt{
				int32_t idx = 0;
				SubchunkNode[]& things = things;
				octreeIt* other = nullptr;//must allow other pointers types
				int32_t x=x;int32_t y=y;int32_t z=z;
				int32_t depth=depth;
				public:
					convChunk next(){
						if(idx>=8) return convChunk{.done=true};
						if(isSubchunk(things[idx])){
							if(other == nullptr){
								std::visit([this](auto& thing){
									other = thing.convIterateChunks(depth-1,x+(((idx>>2)&1)<<depth),(((idx>>1)&1)<<depth),((idx&1)<<depth));
								})
							};
							convChunk r = other.next();
							if(r.done) other = nullptr;
							else return r;
						}
						return convChunk{
							.x=x+(((idx>>2)&1)<<depth),
							.y=y+(((idx>>1)&1)<<depth),
							.z=z+((idx&1)<<depth),
							.size=((uint32_t)1)<<depth,
							.data=things[idx].template get<std::unique_ptr<PartsNode>>(),
							.done=false
						};
					}
			} s;*/
		}
		void convFromChunks(convChunk<WorldStuff> toAdd, int32_t originalDepth, bool moveNoCopy){//printy(std::to_string(toAdd.x)+","+std::to_string(toAdd.y)+","+std::to_string(toAdd.z)+","+std::to_string(toAdd.depth));
			if(toAdd.depth == originalDepth){//filled with one thing
				things[0] = std::make_unique<PartsNode>(toAdd.data);
				things[1] = std::make_unique<PartsNode>(toAdd.data);
				things[2] = std::make_unique<PartsNode>(toAdd.data);
				things[3] = std::make_unique<PartsNode>(toAdd.data);
				things[4] = std::make_unique<PartsNode>(toAdd.data);
				things[5] = std::make_unique<PartsNode>(toAdd.data);
				things[6] = std::make_unique<PartsNode>(toAdd.data);
				things[7] = std::make_unique<PartsNode>(toAdd.data);
				/*uint32_t a = toAdd.data->isActive();
				autoConvertActiveCount = a*8;
				if(a) active.set();*/
				if(toAdd.data->isActive()) active.fill();
				return;
			}
			convFromChunkSet(toAdd,originalDepth,moveNoCopy,toAdd.data->isActive());
			/*SubchunkOctree* t = this;
			int32_t depth = originalDepth;
			while(depth-1 > toAdd.depth){
				uint32_t i = (toAdd.x>>depth&1)<<2 | (toAdd.y>>depth&1)<<1 | toAdd.z>>depth&1;
				if(!isSubchunk(t->things[i])){//if leaf node, split
					t->things[i] = std::make_unique<SubchunkOctree>(depth-1);
				}
				t = t->things[i].template get<std::unique_ptr<SubchunkOctree>>().template get();
				depth--;
			}
			t->things[(toAdd.x>>depth&1)<<2 | (toAdd.y>>depth&1)<<1 | toAdd.z>>depth&1] = std::make_unique<PartsNode>(toAdd.data);*/
		}
		void convFromChunkSet(convChunk<WorldStuff> toAdd,int32_t depth,bool moveNoCopy,bool toAddActive){
			if(depth-1>toAdd.depth){
				uint32_t i = (toAdd.x>>depth&1)<<2 | (toAdd.y>>depth&1)<<1 | toAdd.z>>depth&1;
				if(!isSubchunk<WorldStuff>(things[i])){//if leaf node, split
					things[i] = std::make_unique<SubchunkOctree>(depth-1);
				}
				SubchunkOctree* that = things[i].template get<std::unique_ptr<SubchunkOctree>>().get();
				that->convFromChunkSet(toAdd,depth-1,moveNoCopy, toAddActive);
				active.set(i,bool(that->isActive()));
				//autoConvertActiveCount += toAddActive;
				//printy((active[i]?std::string("t"):std::string("f"))+" at "+std::to_string(depth));
			}else{
				uint32_t i = (toAdd.x>>depth&1)<<2 | (toAdd.y>>depth&1)<<1 | toAdd.z>>depth&1;
				things[i] = moveNoCopy ? std::make_unique<PartsNode>(std::move(*toAdd.data)) : std::make_unique<PartsNode>(toAdd.data);
				active.set(i,bool(toAddActive));
				//autoConvertActiveCount += toAddActive;
				//printy((active[i]?std::string("t"):std::string("f"))+" at bottom");
			}
		}
		/*PartsNode* gettest(int32_t x,int32_t y,int32_t z,int32_t depth){
			int32_t i = (x>>depth & 1)<<2 | (y>>depth & 1)<<1 | (z>>depth & 1);
			PartsNode* ret;
			printy("get "+std::to_string(depth)+" "+std::to_string(i));
			std::visit([&x,&y,&z,&depth,&ret](auto& thing) {
				ret = thing->gettest(x,y,z,depth-1);
			},things[i]);
			return ret;
		}*/
		std::string tostring()const{
			std::string a="{";
			for(int32_t i=0; i<8;i++){
				if(i)a=a+",";
				a=a+std::to_string(i)+":";
				things[i].visit([&a](auto& thing) {
					a=a+thing->tostring();
				});
			}
			return a+"}";
		}
};
template <typename WorldStuff>
subchunkChanges World<WorldStuff>::SubchunkArray::autoConvertTry(SubchunkNode& thisThing,int32_t depth, Chunk& chunk){
	//if(active.active.size()<(((uint32_t)1)<<((depth+1)*3-1))){//half size
	if(autoConvertMoveCount == 0 && autoConvertWaitCount == 0 && chunk.world->canDoSlowStuff()){
		//printy("It changed a 2 o");
		thisThing = std::unique_ptr<SubchunkOctree>(volumeConvert<WorldStuff,SubchunkOctree>(*this, depth, true).dst);
		thisThing.template get<std::unique_ptr<SubchunkOctree>>()->updateAll(chunk.loadedClients);
		return subchunkChanges(true);
	}
	return subchunkChanges();
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::updateI(subchunkChanges deeperUpdates/*=subchunkChanges(true)*/){
	//always check for merge so it will work with caching
	if(thing.template has<std::unique_ptr<SubchunkOctree>>()){
		std::unique_ptr<SubchunkOctree>& tomerge = thing.template get<std::unique_ptr<SubchunkOctree>>();
		if(tomerge->canMerge()){
			auto stuff = std::move(tomerge->merge().template get<std::unique_ptr<PartsNode>>());
			thing = std::move(stuff);
		}
	}
	if(!owned) return;
	if(deeperUpdates.clientUpdated){
		for(auto c : loadedClients){
			c->updates.insert(this);
		}
	}
	thing.visit([&,this](auto& athing) {
		active = bool(athing->isActive());
	});
	if(!edgesUpdated){
		edgesUpdated = true;
		world->edgesUpdatedChunks.push_back(this);
	}
}
template <typename WorldStuff>
template <typename T, typename T2>
void World<WorldStuff>::Chunk::add(const T& data, uint32_t x, uint32_t y, uint32_t z, T2 func){
	if(thing.template has<std::unique_ptr<PartsNode>>() && depth != 0){
		thing = std::make_unique<SubchunkOctree>(depth-1,*thing.template get<std::unique_ptr<PartsNode>>());//split
		thing.template get<std::unique_ptr<SubchunkOctree>>()->updateAll(loadedClients);
	}
	thing.visit([&,this](auto& athing) {
		athing->add(data,x,y,z,depth-1,func,*this);
	});
	updateI();
}
template <typename WorldStuff>
template <typename Iter,typename T>
void World<WorldStuff>::Chunk::addRaw(Iter begin,Iter end, uint32_t x,uint32_t y,uint32_t z,const T wheres){
	if(thing.template has<std::unique_ptr<PartsNode>>() && depth != 0){
		thing = std::make_unique<SubchunkOctree>(depth-1,*thing.template get<std::unique_ptr<PartsNode>>());//split
		thing.template get<std::unique_ptr<SubchunkOctree>>()->updateAll(loadedClients);
	}
	thing.visit([&](auto& athing) {
		athing->addRaw(begin,end,x,y,z,this->depth-1,wheres,*this);
	});
	updateI();
	//if(std::is_same<T,attributeCombinationInformation>::value)printy("a "+std::to_string(int(isActive()))+" at "+std::to_string(depth));
}
template <typename WorldStuff>
template <typename T>
void World<WorldStuff>::Chunk::fillCell(const T& what, uint32_t x, uint32_t y, uint32_t z){
	if(thing.template has<std::unique_ptr<PartsNode>>() && depth != 0){
		thing = std::make_unique<SubchunkOctree>(depth-1,*thing.template get<std::unique_ptr<PartsNode>>());//split
		thing.template get<std::unique_ptr<SubchunkOctree>>()->updateAll(loadedClients);
	}
	thing.visit([&,this](auto& athing) {
		athing->fillCell(what,x,y,z,depth-1,*this);
	});
	updateI();
}
template <typename WorldStuff>
std::string World<WorldStuff>::Chunk::tostring(){
	std::string a;
	thing.visit([&a](auto& thing) {
		a=thing->tostring();
	});
	return a;
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::syncSendEdges(){
	ByteArray attrarr;
	attrarr.add(usedAttributes.size());
	for(uint32_t attrOffset : attributeCombinationsToSync){// sync new attribute combinations
		const sorted_vector<uint32_t>& attrC = std::find_if(attributeCombinationsFromSet.begin(),attributeCombinationsFromSet.end(),
			[&](const auto& that){return that.second.offset == attrOffset;}
		)->first;
		attrarr.add(attrOffset).add(attrC.size()).add(attrC.begin(),attrC.end());

		for(auto it=usedAttributes.begin()+attrOffset; it!=usedAttributes.begin()+attrOffset+world->attributeTypesCount; ++it){
			it->toByteArray(attrarr);
		}
	}
	attributeCombinationsToSync.clear();
	for(uint32_t i=0; i<neighbours.size(); i++){
		auto& theseNeigbours = neighbours[i];
		if(i != world->thisWId && theseNeigbours.any()){//printy("n "+std::to_string(i)+" "+std::to_string(theseNeigbours.to_ulong()));
			ByteArray arr;
			arr.add(thing.index());
			thing.visit([&](auto& athing) {
				athing->flattenEdges(arr, theseNeigbours.x);
			});
			externSyncSend(world,i,pos.x,pos.y,pos.z,syncTypes::edges,&*arr.begin(),&*arr.end(),&*attrarr.begin(),&*attrarr.end());
		}
	}
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::syncRecieve(uint32_t typecode, ByteArray& arr, ByteArray& arr2){
	switch(typecode){
		case syncTypes::edges:{
			usedAttributes.resize(arr2.read());
			while(!arr2.atEnd()){
				int32_t attrOffset = arr2.read();
				uint32_t size = arr2.read();
				//printy("srea "+std::to_string(attrOffset)+","+std::to_string(size));
				auto begin = arr2.skip(size);
				attributeCombinationsFromSet.insert(std::make_pair(sorted_vector<uint32_t>(begin,begin+size),attrOffset));
				
				auto start = usedAttributes.begin()+attrOffset;
				for(auto it=start; it!=start+world->attributeTypesCount; ++it){
					it->fromByteArray(arr2);
					//auto &i=*it;printy((i.used?std::string("t"):std::string("f"))+" "+std::to_string(i.bits)+" "+std::to_string(i.bitOffset)+" "+std::to_string(i.intOffset)+" idx "+std::to_string(arr2.atEnd()));
				}
			}
			int32_t depthminus = depth-1;
			size_t which = arr.read(); bool diff = which != thing.index(); if(diff) thing.fromIndex(which); thing.visit([&]<typename T>(std::unique_ptr<T>& thing){if(diff) thing.reset(new T(depthminus)); thing->unflattenEdges(arr,depthminus);});
			break;
		}
		case syncTypes::move:{
			std::unordered_map<int32_t,int32_t> offsetToRealOffset;
			//printy("siz "+std::to_string(arrAttrs.size()));//tempp
			while(!arr2.atEnd()){ //attrs
				uint32_t offset = arr2.read(), size = arr2.read();
				auto begin = arr2.skip(size);
				offsetToRealOffset[offset] = requireAttrs(sorted_vector<uint32_t>(begin, begin+size)).offset;
				//printy("ar "+std::to_string(offset)+" becomes "+std::to_string(offsetToRealOffset[offset])+" stuf "+std::to_string(size)+", "+sorted_vector<uint32_t>(begin, begin+size).tostring());
			}
			while(!arr.atEnd()){ //parts
				uint32_t x = arr.read();
				uint32_t y = arr.read();
				uint32_t z = arr.read();
				uint32_t size = arr.read();
				auto begin = arr.skip(size);
				uint32_t offset = arr.read();
				if(offsetToRealOffset.contains(offset)){//printy(std::to_string(offset)+" becomes "+std::to_string(offsetToRealOffset[offset]));
					offset = offsetToRealOffset[offset]; //convert temporary offset to real offset
				}
				//printy("srm "+std::to_string(x&255)+","+std::to_string(y&255)+","+std::to_string(z&255)+",l "+std::to_string(size)+", o "+std::to_string(offset)+",");
				addRaw(begin,begin+size,x,y,z, attributeCombinationsFromOffset[offset]);
			}
			break;
		}
	}
}
template <typename WorldStuff>
ByteArray World<WorldStuff>::Chunk::flattenClient(const Client* forClient){
	ByteArray arr;
	arr.add(thing.index());
	//arr.add(0);//changed later
	thing.visit([&](auto& athing) {
		athing->flattenClient(arr, forClient, false,*this);
	});
	return arr;
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::load(SubchunkNode what){
	thing = std::move(what);
	thing.visit([this](auto& athing) {
		athing->updateAll(loadedClients);
	});
	updateI();
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::addClient(Client* c){
	loadedClients.push_back(c);
	thing.visit([&,this](auto& athing) {
		athing->updateAll(std::vector<Client*>{c});
	});
	c->updates.insert(this);
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::removeClient(Client* c){
	loadedClients.erase(std::find(loadedClients.begin(),loadedClients.end(),c));
	//todo: this function remove all updates for client
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::tick(){
	uint32_t tickChance = std::numeric_limits<uint32_t>::max();
	for(Client* c : loadedClients){
		tickChance = std::min(tickChance, (uint32_t)round(std::max(log2(square((double)c->chunkPos.x-pos.x)+square((double)c->chunkPos.y-pos.y)+square((double)c->chunkPos.z-pos.z)+1)*0.5, (double)0)));
	}
	//if(active) printy(std::to_string(tickChance)+" "+std::to_string(((uint32_t)1<<tickChance)-1)+" "+std::to_string(pos.x)+" "+std::to_string(pos.y)+" "+std::to_string(pos.z));
	if(active && ((pos.x+pos.y+pos.z+(world->ticks<<world->depth))&(((uint32_t)1<<tickChance)-1)) == 0){
		tickVer = tickVer ? 0 : 1;// invert tick version
		uint32_t newAutoConvertMoveCount = 0;
		subchunkChanges thatChanges;
		thing.visit([&,this](auto& athing) {
			thatChanges.combine(athing->autoConvertTry(thing,depth-1,*this));
		});
		thing.visit([&,this](auto& athing) {
			thatChanges.combine(athing->iterateActive(depth-1,vec3u(0,0,0),newAutoConvertMoveCount,*this));
		});
		updateI(thatChanges);
		//printy("syncedges "+std::to_string(pos.x)+","+std::to_string(pos.y)+","+std::to_string(pos.z));
		//printy(tostring(),1);
	}
	//}else{
		//tickActiveCb(null_t(),ivec3(0,0,0),((uint32_t)1)<<depth, *thing.template .get<std::unique_ptr<PartsNode>>(), vec3i(0,0,0), depth-1);
	//}
}
subchunkChanges deepChangesReuse; uint32_t deepMoveCountReuse;
template <typename WorldStuff>
subchunkChanges World<WorldStuff>::Chunk::tickActiveCb(argsForMove theseArgsForMove, uint32_t& outNewAutoConvertMoveCount){
	deepChangesReuse = subchunkChanges();
	deepMoveCountReuse = 0;
	const static uint32_t activeAttr = World<WorldStuff>::commonAttrs::active;
	const static uint32_t tickVerAttr = World<WorldStuff>::commonAttrs::tickVer;
	//printy("beforechek "+std::to_string(theseArgsForMove.partsNode.size()));
	size_t i=theseArgsForMove.partsNode.size();
	while(i > 0){//loop backwards
		i-=theseArgsForMove.partsNode.getLenAt(i-1);
		//printy("chek "+std::to_string(theseArgsForMove.pos.x)+","+std::to_string(theseArgsForMove.pos.y)+","+std::to_string(theseArgsForMove.pos.z)+" tickver "+std::to_string(theseArgsForMove.partsNode.getAttr(i,tickVerAttr,*this)));
		if(bool(theseArgsForMove.partsNode.getAttr(i,activeAttr,*this)) && theseArgsForMove.partsNode.getAttr(i,tickVerAttr,*this) != tickVer){
			theseArgsForMove.partWhere = i;
			theseArgsForMove.partsNode.attr(i,tickVerAttr,*this) = tickVer;
			world->worldStuff.tickPart(theseArgsForMove,*this);
		}
	}
	outNewAutoConvertMoveCount += deepMoveCountReuse;
	return deepChangesReuse;
}
// if any updates happen to partsNode while moving, it should be correctly handled by iterateActive
// this stores updates to be done in iterateActive
template <typename WorldStuff>
void World<WorldStuff>::Chunk::partMove(argsForMove& theseArgsForMove, vec3i moveBy){
	if(moveBy.x == 0 && moveBy.y == 0 && moveBy.z == 0) return;
	//printy("move "+std::to_string(theseArgsForMove.pos.x)+","+std::to_string(theseArgsForMove.pos.y)+","+std::to_string(theseArgsForMove.pos.z)+" by "+std::to_string(moveBy.x)+","+std::to_string(moveBy.y)+","+std::to_string(moveBy.z)+" in c "+std::to_string(this->pos.x)+","+std::to_string(this->pos.y)+","+std::to_string(this->pos.z));
	uint32_t chunkSize = world->chunkSize;
	uint32_t partS = ((uint32_t)1)<<(theseArgsForMove.partsNodeDepth+1);// they may not have size of 1
	for(uint32_t ox=0;ox<partS;ox++){for(uint32_t oy=0;oy<partS;oy++){for(uint32_t oz=0;oz<partS;oz++){
		vec3i newPos = vec3i(theseArgsForMove.pos)+vec3i(ox,oy,oz)+moveBy;
		if(newPos.x<theseArgsForMove.containerPos.x || newPos.y<theseArgsForMove.containerPos.y || newPos.z<theseArgsForMove.containerPos.z || newPos.x>=theseArgsForMove.containerPos.x+theseArgsForMove.containerWidth || newPos.y>=theseArgsForMove.containerPos.y+theseArgsForMove.containerWidth || newPos.z>=theseArgsForMove.containerPos.z+theseArgsForMove.containerWidth){
			//went out of that one
			if(newPos.x<0 || newPos.y<0 || newPos.z<0 || newPos.x>=chunkSize || newPos.y>=chunkSize || newPos.z>=chunkSize){
				// went to different chunk
				auto thatChunkPos = vec3i((newPos.x>>this->depth)<<this->depth,(newPos.y>>this->depth)<<this->depth,(newPos.z>>this->depth)<<this->depth)+this->pos;
				if(!world->chunkExist(thatChunkPos)) return;
				Chunk* otherChunk = world->getChunk(thatChunkPos);
				auto begin = theseArgsForMove.partsNode.partBegin(theseArgsForMove.partWhere);
				uint32_t attrOffset = (*begin)>>8;
				attributeCombinationInformation attrC = otherChunk->requireAttrs(
					std::find_if(attributeCombinationsFromSet.begin(),attributeCombinationsFromSet.end(),
						[&](const auto& that){return that.second.offset == attrOffset;}
					)->first
				);
				otherChunk->addRaw(begin,theseArgsForMove.partsNode.partEnd(theseArgsForMove.partWhere),newPos.x,newPos.y,newPos.z, attrC);
				if(!otherChunk->owned){
					auto pbegin = theseArgsForMove.partsNode.partBegin(theseArgsForMove.partWhere), pend = theseArgsForMove.partsNode.partEnd(theseArgsForMove.partWhere);
					if(otherChunk->toMove.size() == 0) world->toMoveChunks.push_back(otherChunk);
					otherChunk->toMove.add((uint32_t)newPos.x).add((uint32_t)newPos.y).add((uint32_t)newPos.z).add(pend-pbegin).add(pbegin,pend).add(attrC.offset);
				}
			}else{ //same chunk
				addRaw(theseArgsForMove.partsNode.partBegin(theseArgsForMove.partWhere),theseArgsForMove.partsNode.partEnd(theseArgsForMove.partWhere),newPos.x,newPos.y,newPos.z,null2);
			}
		}else{// in same one, updates should be done correctly by iterateActive
			theseArgsForMove.containerNode.visit([&](auto& athing) {
				deepChangesReuse.combine(athing->addRaw(theseArgsForMove.partsNode.partBegin(theseArgsForMove.partWhere),theseArgsForMove.partsNode.partEnd(theseArgsForMove.partWhere),newPos.x,newPos.y,newPos.z,theseArgsForMove.containerDepth,null2,*this));
			});
		}
	}}}
	deepChangesReuse.combine(theseArgsForMove.partsNode.remove(theseArgsForMove.partWhere,theseArgsForMove.pos.x,theseArgsForMove.pos.y,theseArgsForMove.pos.z,theseArgsForMove.partsNodeDepth,*this));
	/*std::visit([&](auto& athing) {
		subchunkChanges a = athing.remove(partWhere,pos.x,pos.y,pos.z,partsNodeDepth+1);
		//calling container allows arrays to detect updates without checking everything
		deepChangesReuse.combine(a);
	},containerNode);*/
	/*if(deepChanges.any()){
		std::visit([&](auto& athing) {
			athing.update(pos.x,pos.y,pos.z,this->depth-1);
		},thing);
	}*/
	deepMoveCountReuse += MOVE_COUNT_MULT;
	if(!edgesUpdated){
		edgesUpdated = true;
		world->edgesUpdatedChunks.push_back(this);
	}
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::searchAroundNoBoundsCheck(vec3i where, uint32_t whereS, vec3i thisPos, std::function<void(PartsNode*, uint32_t,uint32_t,vec3i, Chunk&)> cb){
	thing.visit([&,this](auto& athing){
		athing->searchAround(where, whereS, thisPos, this->depth-1, cb, *this);
	});
}
template <typename WorldStuff>
void World<WorldStuff>::Chunk::searchAround(vec3i where, uint32_t whereS, std::function<void(PartsNode*, uint32_t,uint32_t,vec3i,Chunk&)> cb){
	searchAroundNoBoundsCheck(where,whereS,vec3i(0,0,0),cb);
	uint32_t cs = world->chunkSize;
	if(where.x<whereS){
		if(where.y<whereS){
			if(where.z<whereS){if(world->chunkExist(pos+vec3i(-cs,-cs,-cs)))world->getChunk(pos+vec3i(-cs,-cs,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,-cs,-cs), cb);}
			else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(-cs,-cs,cs)))world->getChunk(pos+vec3i(-cs,-cs,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,-cs,cs), cb);}
			if(world->chunkExist(pos+vec3i(-cs,-cs,0)))world->getChunk(pos+vec3i(-cs,-cs,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,-cs,0), cb);
		}else if(where.y>=cs-whereS){
			if(where.z<whereS){if(world->chunkExist(pos+vec3i(-cs,cs,-cs)))world->getChunk(pos+vec3i(-cs,cs,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,cs,-cs), cb);}
			else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(-cs,cs,cs)))world->getChunk(pos+vec3i(-cs,cs,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,cs,cs), cb);}
			if(world->chunkExist(pos+vec3i(-cs,cs,0)))world->getChunk(pos+vec3i(-cs,cs,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,cs,0), cb);
		}
		if(where.z<whereS){if(world->chunkExist(pos+vec3i(-cs,0,-cs)))world->getChunk(pos+vec3i(-cs,0,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,0,-cs), cb);}
		else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(-cs,0,cs)))world->getChunk(pos+vec3i(-cs,0,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,0,cs), cb);}
		if(world->chunkExist(pos+vec3i(-cs,0,0)))world->getChunk(pos+vec3i(-cs,0,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(-cs,0,0), cb);
	}else if(where.x>=cs-whereS){
		if(where.y<whereS){
			if(where.z<whereS){if(world->chunkExist(pos+vec3i(cs,-cs,-cs)))world->getChunk(pos+vec3i(cs,-cs,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,-cs,-cs), cb);}
			else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(cs,-cs,cs)))world->getChunk(pos+vec3i(cs,-cs,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,-cs,cs), cb);}
			if(world->chunkExist(pos+vec3i(cs,-cs,0)))world->getChunk(pos+vec3i(cs,-cs,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,-cs,0), cb);
		}else if(where.y>=cs-whereS){
			if(where.z<whereS){if(world->chunkExist(pos+vec3i(cs,cs,-cs)))world->getChunk(pos+vec3i(cs,cs,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,cs,-cs), cb);}
			else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(cs,cs,cs)))world->getChunk(pos+vec3i(cs,cs,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,cs,cs), cb);}
			if(world->chunkExist(pos+vec3i(cs,cs,0)))world->getChunk(pos+vec3i(cs,cs,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,cs,0), cb);
		}
		if(where.z<whereS){if(world->chunkExist(pos+vec3i(cs,0,-cs)))world->getChunk(pos+vec3i(cs,0,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,0,-cs), cb);}
		else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(cs,0,cs)))world->getChunk(pos+vec3i(cs,0,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,0,cs), cb);}
		if(world->chunkExist(pos+vec3i(cs,0,0)))world->getChunk(pos+vec3i(cs,0,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(cs,0,0), cb);
	}
	if(where.y<whereS){
		if(where.z<whereS){if(world->chunkExist(pos+vec3i(0,-cs,-cs)))world->getChunk(pos+vec3i(0,-cs,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,-cs,-cs), cb);}
		else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(0,-cs,cs)))world->getChunk(pos+vec3i(0,-cs,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,-cs,cs), cb);}
		if(world->chunkExist(pos+vec3i(0,-cs,0)))world->getChunk(pos+vec3i(0,-cs,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,-cs,0), cb);
	}else if(where.y>=cs-whereS){
		if(where.z<whereS){if(world->chunkExist(pos+vec3i(0,cs,-cs)))world->getChunk(pos+vec3i(0,cs,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,cs,-cs), cb);}
		else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(0,cs,cs)))world->getChunk(pos+vec3i(0,cs,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,cs,cs), cb);}
		if(world->chunkExist(pos+vec3i(0,cs,0)))world->getChunk(pos+vec3i(0,cs,0))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,cs,0), cb);
	}
	if(where.z<whereS){if(world->chunkExist(pos+vec3i(0,0,-cs)))world->getChunk(pos+vec3i(0,0,-cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,0,-cs), cb);}
	else if(where.z>=cs-whereS){if(world->chunkExist(pos+vec3i(0,0,cs)))world->getChunk(pos+vec3i(0,0,cs))->searchAroundNoBoundsCheck(where,whereS,vec3i(0,0,cs), cb);}
}

//-------------------------------
// Below is LFBD stuff

struct LFBDStuff{
	struct PartType{
		sorted_vector<uint32_t> attrs;
		bool solid;
		bool windBlow;
		bool color;
	};
	World<LFBDStuff>* world;
	std::vector<PartType> partTypes;
	vec3f wind;
	uint32_t windCount;
	LFBDStuff(World<LFBDStuff>* world):
	world(world),wind(1,0,0),windCount(0)
	{}
	template <typename WorldStuff=LFBDStuff>// WorldStuff should be LFBDStuff
	void initPartTypes(std::vector<PartType>& partTypesOther){
		partTypes = std::move(partTypesOther);
		for(auto& p : partTypes){
			p.attrs.insert(commonAttrs::id);
			if(p.windBlow){
				p.attrs.insert({World<WorldStuff>::commonAttrs::active,World<WorldStuff>::commonAttrs::tickVer,commonAttrs::fpos,commonAttrs::offset,commonAttrs::windBlowAmount});
			}
			if(p.color){
				p.attrs.insert(commonAttrs::color);
			}
		}
	}
	struct commonAttrs{
		static constexpr uint32_t id = 2;
		static constexpr uint32_t color = 3;
		static constexpr uint32_t fpos = 4;// represents coordinates between voxels
		static constexpr uint32_t offset = 5;// offsets represented as number of voxels
		static constexpr uint32_t windBlowAmount = 6;
	};
	template <typename WorldStuff=LFBDStuff>// WorldStuff should be LFBDStuff
	constexpr auto static hereAttrs(auto attrGen){
		return (attrGen
			.template add<commonAttrs::id>(typename World<WorldStuff>::AttributeFormat(16))
			.template add<commonAttrs::color>(typename World<WorldStuff>::AttributeFormat(3))
			.template add<commonAttrs::fpos>(typename World<WorldStuff>::AttributeFormat(8*3))
			.template add<commonAttrs::offset>(typename World<WorldStuff>::AttributeFormat(4*3))
			.template add<commonAttrs::windBlowAmount>(typename World<WorldStuff>::AttributeFormat(3))
		);
	}
	void beforeTick(){
		windCount++;
		if(windCount>=20){
			windCount=0;
			auto temp=wind.z;
			wind.z=-wind.x;
			wind.x=temp;
		}
	}
	void tick(){
		/*while(!chunkGenQueue.empty() && world->canDoSlowStuffNext()){
			auto& thatOne = chunkGenQueue.front();
			//printy("resuming");
			thatOne.ch.resume();
			if(thatOne.returned()){
				//printy("its done");
				chunkGenQueue.pop();
			}
		}*/
	}
	template <typename WorldStuff=LFBDStuff>// WorldStuff should be LFBDStuff
	void tickPart(World<WorldStuff>::argsForMove& theseArgsForMove, World<WorldStuff>::Chunk& chunk){
		uint32_t partS = ((uint32_t)1)<<(theseArgsForMove.partsNodeDepth+1);
		const auto id = theseArgsForMove.partsNode.getAttr(theseArgsForMove.partWhere,commonAttrs::id,chunk);
		const uint32_t partWhere = theseArgsForMove.partWhere;
		const auto windBlowAmount = theseArgsForMove.partsNode.getAttr(partWhere,commonAttrs::windBlowAmount,chunk)*32;
		if(windBlowAmount){
			auto aoffset = theseArgsForMove.partsNode.attr(partWhere,commonAttrs::offset,chunk);
			auto afpos = theseArgsForMove.partsNode.attr(partWhere,commonAttrs::fpos,chunk);
			vec3<int64_t> fpos = vecUnpack<8>(afpos);
			auto offset = vecUnpack<4,true>(aoffset);
			fpos += wind*windBlowAmount;
			fpos -= (offset*256+fpos)*0.1;//elastic
			//printy("wb "+std::to_string(x)+","+std::to_string(y)+","+std::to_string(z)+", wba "+std::to_string(windBlowAmount));
			//if(square(signedNBitNum(offsetX,4)*256+x)+square(signedNBitNum(offsetY,4)*256+y)+square(signedNBitNum(offsetZ,4)*256+z) < square(windBlowAmount*32)){
			afpos = vecPack<8>(fpos);
			vec3i moveBy = vec3i(sar(fpos.x,8),sar(fpos.y,8),sar(fpos.z,8));
			//printy(std::to_string(mx)+","+std::to_string(my)+","+std::to_string(mz)+",");
			if(moveBy.notZero()){
				aoffset = vecPack<4>(offset+moveBy);
				chunk.partMove(theseArgsForMove,moveBy);
			}
		}
		/*bool mov=true;
		chunk.searchAround(theseArgsForMove.pos,partS,[&](World<WorldStuff>::PartsNode* colPartsNode, uint32_t colPartsNodeWhere, uint32_t colPartS, vec3i colPos, World<WorldStuff>::Chunk& chunk){
			//printy("col "+std::to_string(colPos.x)+","+std::to_string(colPos.y)+","+std::to_string(colPos.z)+","+std::to_string(colPartS));
			if(partTypes[colPartsNode->getAttr(colPartsNodeWhere,idAttr,chunk)].solid && colPos.x<theseArgsForMove.pos.x+partS && colPos.x+colPartS>theseArgsForMove.pos.x && colPos.y<theseArgsForMove.pos.y-1+partS && colPos.y+colPartS>theseArgsForMove.pos.y-1 && colPos.z<theseArgsForMove.pos.z+partS && colPos.z+colPartS>theseArgsForMove.pos.z)mov=false;
		});
		if(mov)chunk.partMove(theseArgsForMove,vec3i(0,-1,0));*/
	}
	template <typename WorldStuff=LFBDStuff>// WorldStuff should be LFBDStuff
	uint32_t flattenClient(World<WorldStuff>::PartsNode& partsNode, World<WorldStuff>::Chunk& chunk){
		if(partsNode.empty()) {
			return 0xffffffff; //this means empty
		}
		const static auto& attrId = commonAttrs::id;
		const static auto& attrColor = commonAttrs::color;
		auto where = partsNode.size(); where -= partsNode.getLenAt(where-1);
		//if((where)>20){printy(std::to_string(where)+" "+std::to_string((unsigned long long)(void**)&partsNode)+" "+std::to_string(partsNode.parts.get<World<LFBDStuff>::PartsNode::inStructT>()[0])+" "+std::to_string(partsNode.parts.get<World<LFBDStuff>::PartsNode::inStructT>()[1])+" "+std::to_string(partsNode.parts.get<World<LFBDStuff>::PartsNode::inStructT>()[2])+" ");throw std::runtime_error("");}
		return( //rearrange attributes to always be in same order
			partsNode.getAttr(where,attrId,chunk) |
			(partsNode.getAttr(where,attrColor,chunk)<<16)
		);
		//printy(std::to_string(getAttr(0,attrId)));
	}
	// useful for generating terrain
	class VolumeTerrain;
	coroutine worldTerrainLoad(uint32_t* arr, vec3i pos);
};
class LFBDStuff::VolumeTerrain{
	std::unique_ptr<uint32_t[]> arr;
	int32_t depth;
	public:
		World<LFBDStuff>::Chunk& chunk;
		VolumeTerrain(int32_t depth, uint32_t* arr, World<LFBDStuff>::Chunk& chunk):arr(arr),depth(depth),chunk(chunk){}

		template <typename DstT>
		auto convIterateChunks(std::function<void(convChunk<LFBDStuff>)> cb, int32_t depth,uint32_t ox=0,uint32_t oy=0,uint32_t oz=0){
			//const typename World<LFBDStuff>::attributeCombinationInformation attrsSolid = chunk.requireAttrs(chunk.world->worldStuff.commonAttrCombs.solid);
			//const typename World<LFBDStuff>::attributeCombinationInformation attrsWindBlow = chunk.requireAttrs(chunk.world->worldStuff.commonAttrCombs.windBlow);
			const auto& partTypes = chunk.world->worldStuff.partTypes;
			const uint32_t idMask = chunk.world->attributeTypes[commonAttrs::id].rightMask;
			auto& airAttrs = partTypes[0].attrs;
			return arrayToChunksAsync<uint32_t>(arr,depth, [=,this](uint32_t x,uint32_t y,uint32_t z,int32_t depth, uint32_t data){
				auto cell = World<LFBDStuff>::PartsNode();
				uint32_t partId = data&idMask;
				//if(partId>5)printy("something wrong "+std::to_string(data));
				auto& partType = partTypes[partId];
				if(partType.windBlow){//printy("it active "+std::to_string(x)+","+std::to_string(y)+","+std::to_string(z)+","+std::to_string(depth)+","+std::to_string(data));
					cell.add(airAttrs, 0,0,0,depth,[&](World<LFBDStuff>::PartsNode* vec, uint32_t where){},chunk);//add air
				}
				cell.add(partType.attrs, 0,0,0,depth,[&](World<LFBDStuff>::PartsNode* vec, uint32_t where){
					vec->attr(where,commonAttrs::id,chunk) = partId;
					if(partType.windBlow){
						vec->attr(where,World<LFBDStuff>::commonAttrs::active,chunk) = 1;
						vec->attr(where,commonAttrs::windBlowAmount,chunk) = data>>29;
					}
					if(partType.color){
						vec->attr(where,commonAttrs::color,chunk) = data>>16;
					}
				},chunk);
				cb(convChunk<LFBDStuff>{.x=x+ox,.y=y+oy,.z=z+oz,.depth=depth,.data=&cell});
			},chunk.world);
		}
};
coroutine LFBDStuff::worldTerrainLoad(uint32_t* arr, vec3i pos){
	//printy("terrain recieved");
	World<LFBDStuff>::Chunk* chunk = world->getChunk(pos);
	auto* arrc = new VolumeTerrain(world->depth-1,arr,*chunk);
	auto stuff = volumeConvert<LFBDStuff,World<LFBDStuff>::SubchunkOctree>(*arrc, world->depth-1, true);
	//chunkGenQueue.push(stuff.ret);
	co_await stuff.ret;
	//printy("terrain loaded");
	chunk->load(std::unique_ptr<World<LFBDStuff>::SubchunkOctree>(stuff.dst));
	delete arrc;
}

/*template<typename T>
size_t getFullMemUsage(const std::vector<T>& vec)
{
  size_t size_of_vector_struct = sizeof(std::vector<T>);
  size_t size_of_single_element = sizeof(T);
  return size_of_vector_struct + size_of_single_element * vec.capacity();
}*/

extern "C"{
	EXPORT("allocString")
	char* allocString(uint32_t len){
		char* str = new char[len+1];
		str[len] = (char)NULL;
		return str;
	}
	/*
	EXPORT
	std::vector<std::pair<std::string,World<LFBDStuff>::AttributeFormat>>* attrArrCreate(){
		return new std::vector<std::pair<std::string,World<LFBDStuff>::AttributeFormat>>;
	}
	EXPORT
	void attrArrAdd(std::vector<std::pair<std::string,World<LFBDStuff>::AttributeFormat>>* arr, char* name, uint32_t bits){
		arr->emplace_back(std::string(name),World<LFBDStuff>::AttributeFormat(bits));
		delete[] name;
	}
	*/
	EXPORT("partTypesArrCreate")
	std::vector<LFBDStuff::PartType>* partTypesArrCreate(){
		return new std::vector<LFBDStuff::PartType>;
	}
	EXPORT("partTypesArrAdd")
	void partTypesArrAdd(std::vector<LFBDStuff::PartType>* arr, bool solid,bool windBlow,bool color){
		arr->emplace_back(sorted_vector<uint32_t>(),solid,windBlow,color);
	}
	EXPORT("worldNew")
	//std::vector<std::pair<std::string,World<LFBDStuff>::AttributeFormat>>* attrs
	World<LFBDStuff>* worldNew(uint32_t depth,uint32_t workerCount,uint32_t thisWId, std::vector<LFBDStuff::PartType>* partTypes){
		World<LFBDStuff>* worldptr = new World<LFBDStuff>(depth,workerCount,thisWId);
		worldptr->worldStuff.initPartTypes(*partTypes);
		//delete attrs;
		delete partTypes;
		return worldptr;
		/*for(auto i:*attrs){
			printy(i.first+","+std::to_string(i.second.bits));
		}
		printy("active at "+std::to_string(worldptr->commonAttrs::active));
		printy("id at "+std::to_string(worldptr->commonAttrs::id));*/
	}
	EXPORT("worldDelete")
	void worldDelete(World<LFBDStuff>* world){
		delete world;
	}
	EXPORT("worldChunkNew")
	void worldChunkNew(World<LFBDStuff>* world, int32_t x,int32_t y,int32_t z, uint32_t ownerId){
		world->chunkNew(vec3i(x,y,z),ownerId);
	}
	EXPORT("worldChunkDelete")
	void worldChunkDelete(World<LFBDStuff>* world, int32_t x,int32_t y,int32_t z){
		world->chunkDelete(vec3i(x,y,z));
	}
	EXPORT("worldTerrainAlloc")
	uint32_t* worldTerrainAlloc(World<LFBDStuff>* world){
		return new uint32_t[((uint32_t)1)<<((world->depth-1+1)*3)];
	}
	EXPORT("worldTerrainLoad")
	void worldTerrainLoad(World<LFBDStuff>* world, uint32_t* arr, int32_t x,int32_t y,int32_t z){
		world->worldStuff.worldTerrainLoad(arr,vec3i(x,y,z));
		//printy(world->getChunk(vec3i(x,y,z))->tostring(),1);
	}
	EXPORT("clientNew")
	World<LFBDStuff>::Client* clientNew(){
		return new World<LFBDStuff>::Client;
	}
	EXPORT("clientDelete")
	void clientDelete(World<LFBDStuff>::Client* c){
		delete c;
	}
	EXPORT("chunkAddClient")
	void chunkAddClient(World<LFBDStuff>* world, int32_t x,int32_t y,int32_t z, World<LFBDStuff>::Client* c){
		world->getChunk(vec3i(x,y,z))->addClient(c);
	}
	EXPORT("chunkRemoveClient")
	void chunkRemoveClient(World<LFBDStuff>* world, int32_t x,int32_t y,int32_t z, World<LFBDStuff>::Client* c){
		world->getChunk(vec3i(x,y,z))->removeClient(c);
	}
	EXPORT("clientSetChunkPos")
	void clientSetChunkPos(World<LFBDStuff>::Client* c, int32_t x,int32_t y,int32_t z){
		c->chunkPos.set(x,y,z);
	}
	EXPORT("worldTick")
	void worldTick(World<LFBDStuff>* world, long tickEndTime){
		world->tick(tickEndTime);
	}
	IMPORT("clientSendChunkUpdatesData") void clientSendChunkUpdatesData(World<LFBDStuff>* world,World<LFBDStuff>::Client* c,uint32_t* begin, uint32_t* end, int32_t x,int32_t y,int32_t z);
	EXPORT("clientSendChunkUpdates")
	void clientSendChunkUpdates(World<LFBDStuff>* world,World<LFBDStuff>::Client* c){
		for(auto i : c->updates){
			ByteArray arr = i->flattenClient(c);
			clientSendChunkUpdatesData(world,c, &*arr.begin(),&*arr.end(), i->pos.x, i->pos.y, i->pos.z);
		}
		c->updates.clear();
	}
	EXPORT("byteArrayAlloc")
	ByteArray* byteArrayAlloc(size_t size){
		return new ByteArray(size);
	}
	EXPORT("byteArrayData")
	uint32_t* byteArrayData(ByteArray* a){
		return &*a->begin();
	}
	EXPORT("externSyncRecieve")
	void externSyncRecieve(World<LFBDStuff>* world, int32_t x,int32_t y,int32_t z, uint32_t typecode, ByteArray* arr,ByteArray* arr2){
		world->getChunk(vec3i(x,y,z))->syncRecieve(typecode,*arr,*arr2);
		delete arr;
		delete arr2;
	}
	/*EXPORT
	void externSyncRecieveEdges(World<LFBDStuff>* world,int32_t x,int32_t y,int32_t z, ByteArray* arr,ByteArray* attrarr){
		world->getChunk(vec3i(x,y,z))->syncRecieveEdges(*arr,*attrarr);
		delete arr;
		delete attrarr;
		//printy(world->getChunk(vec3i(x,y,z))->tostring());
		/-*thectx.chunk=world->getChunk(vec3i(x,y,z));
		printy("combines "+std::to_string(thectx.chunk->attributeCombinationsFromSet.size()));
		for(auto& i:thectx.chunk->usedAttributes){
			if(i.used)printy(std::to_string(i.bits)+" "+std::to_string(i.bitOffset)+" "+std::to_string(i.intOffset));
		}*-/
	}
	EXPORT
	void externSyncRecieveMove(World<LFBDStuff>* world,int32_t x,int32_t y,int32_t z, ByteArray* toMove,ByteArray* toMoveAttrs){
		world->getChunk(vec3i(x,y,z))->syncRecieveMove(*toMove,*toMoveAttrs);
		delete toMove;
		delete toMoveAttrs;
	}*/
/*EXPORT
void dostuff() {
	thectx.world = new World<LFBDStuff>(std::vector<std::pair<std::string,AttributeFormat>>{{"id",AttributeFormat(16)},{"active",AttributeFormat(1)}}, 3);
	Chunk o(thectx.world);
	printy(o.tostring(),1);
	o.add(std::vector<int32_t>{thectx.world->commonAttrs::id},5,5,5,[](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,12321);
	});
	//printy(std::to_string(o.gettest(10,10,10,3)->begin()->data));
	printy(o.tostring(),1);
	o.fillCell(0,5,5,5);
	printy(o.tostring(),1);
	
	o.add(std::vector<int32_t>{thectx.world->commonAttrs::id},1,0,2,[](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,12321);
	});
	printy("newprev"+o.tostring());
	auto e=o.syncSendEdges();
	printy(e.tostring());
	Chunk fo(thectx.world);
	fo.syncRecieveEdges(e);
	printy(fo.tostring(),1);
}
EXPORT
void dostuffar(){
	thectx.world = new World<LFBDStuff>(std::vector<std::pair<std::string,AttributeFormat>>{{"id",AttributeFormat(16)},{"active",AttributeFormat(1)}}, 2);
	Chunk o(thectx.world, std::make_unique<SubchunkArray>(1));
	for(int32_t x=0;x<2;++x){for(int32_t y=0;y<2;++y){for(int32_t z=0;z<2;++z){
	o.add(std::vector<int32_t>{thectx.world->commonAttrs::id},2+x,2+y,2+z,[](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,2356);
	});
	printy(std::to_string(x)+","+std::to_string(y)+","+std::to_string(z));
	}}}
	o.add(std::vector<int32_t>{thectx.world->commonAttrs::id},0,0,1,[](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,43434);
	});
	printy(o.tostring(),1);
	SubchunkArray& tha=*o.getSubchunk(.get<std::unique_ptr<SubchunkArray>>());
	auto aaa=volumeConvert<SubchunkOctree>(tha,1);
	printy("sss");
	printy(aaa.tostring(),1);
}
EXPORT
void testpart(){
	PartsNode we;
	printy(we.tostring(),1);
	we.add(std::vector<int32_t>{thectx.world->commonAttrs::id},0,0,1,3,[](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,9876);
	});
	printy(we.tostring(),1);
	we.add(std::vector<int32_t>{thectx.world->commonAttrs::id},0,12,1,3,[](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,9876);
	});
	printy(we.tostring(),1);
	we.remove(0);
	printy("rmv "+we.tostring());
	PartsNode othe;
	othe.add(std::vector<int32_t>{thectx.world->commonAttrs::id},0,12,1,3,[](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,9876);
	});
	othe.remove(0);
	printy("othe "+othe.tostring());
}
EXPORT
void domany(int32_t x){
	SubchunkOctree o(7);
	int32_t a=0;
	for(int32_t i=1;i<x;i++){
		o.add(std::vector<int32_t>{thectx.world->commonAttrs::id},i&255,0,0,7,[](PartsNode* vec, int32_t where){
			vec->setAttr(where,thectx.world->commonAttrs::id,12321);
		});
		o.fillCell(0,(i-1)&255,0,0,7);
		a+=o.isActive();
	}
	printy(std::to_string(a));
}
EXPORT
void testat(World<LFBDStuff>* world){
	world->chunkNew(vec3i(0,0,0),0);
	thectx.world=world;thectx.chunk=world->getChunk(vec3i(0,0,0));
	auto cell = PartsNode();
	cell.add(std::unordered_set<int32_t>{thectx.world->commonAttrs::id},0,0,0,0,[&](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,12345);
	});
	printy(cell.tostring());
	ByteArray ew;
	cell.flattenClient(ew,new Client,false);
	printy(ew.tostring());
	printy("combines "+std::to_string(thectx.chunk->attributeCombinationsFromSet.size()));
	for(auto& i:thectx.chunk->usedAttributes){
		if(i.used)printy(std::to_string(i.bits)+" "+std::to_string(i.bitOffset)+" "+std::to_string(i.intOffset));
	}

	cell.add(std::unordered_set<int32_t>{thectx.world->commonAttrs::active,thectx.world->commonAttrs::id},0,0,0,0,[&](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,12345);
	});
	const attributeCombinationInformation usedAttrs = thectx.chunk->requireAttrs(std::unordered_set<int32_t>{thectx.world->commonAttrs::id,thectx.world->commonAttrs::active});
	cell.add(usedAttrs,0,0,0,0,[&](PartsNode* vec, int32_t where){
		vec->setAttr(where,thectx.world->commonAttrs::id,12345);
		vec->setAttr(where,thectx.world->commonAttrs::active,5);
		printy("12345: "+std::to_string(vec->getAttr(where,thectx.world->commonAttrs::id)));
		printy("5: "+std::to_string(vec->getAttr(where,thectx.world->commonAttrs::active)));
	});
	printy(cell.tostring());
	printy("combines "+std::to_string(thectx.chunk->attributeCombinationsFromSet.size()));
	for(auto& i:thectx.chunk->usedAttributes){
		if(i.used)printy(std::to_string(i.bits)+" "+std::to_string(i.bitOffset)+" "+std::to_string(i.intOffset));
	}
}
EXPORT
void addd(World<LFBDStuff>*world){
	auto set=std::unordered_set<int32_t>{world->commonAttrs::id,world->commonAttrs::active};
	world->getChunk(vec3i(0,0,0))->add(set,2,3,1,[&](PartsNode* vec, int32_t where){
		vec->setAttr(where,world->commonAttrs::id,1232);
		vec->setAttr(where,world->commonAttrs::active,1);
	});
}*/
EXPORT("showal")
void showal(World<LFBDStuff>*w,int32_t x,int32_t y,int32_t z){
	for(auto &c:w->chunks){
		//if(c.second->pos.x==x&&c.second->pos.y==y&&c.second->pos.z==z){
			printy("c "+std::to_string(c.second->pos.x)+","+std::to_string(c.second->pos.y)+","+std::to_string(c.second->pos.z));
			printy(c.second->tostring(),1);
			auto *chunk=c.second.get();
			printy("combines "+std::to_string(chunk->attributeCombinationsFromSet.size()));
			for(auto& i:chunk->usedAttributes){
				if(i.used)printy(std::to_string(i.bits)+" "+std::to_string(i.bitOffset)+" "+std::to_string(i.intOffset));
			}
		//}
	}
}
/*EXPORT
void testac(World<LFBDStuff>*world){
	world->chunkNew(vec3i(0,0,0),0);
	auto chunk=world->getChunk(vec3i(0,0,0));
	auto cell = World<LFBDStuff>::PartsNode();
	cell.add(sorted_vector<uint32_t>{world->worldStuff.commonAttrs::id,world->worldStuff.commonAttrs::texture,world->commonAttrs::active},0,0,0,0,[&](World<LFBDStuff>::PartsNode* vec, uint32_t where){
		vec->attr(where,world->worldStuff.commonAttrs::id,*chunk)=12345;
		vec->attr(where,world->commonAttrs::active,*chunk)=1;
		auto a=vec->attr(where,world->worldStuff.commonAttrs::id,*chunk);
		auto t=vec->attr(where,world->worldStuff.commonAttrs::texture,*chunk);
		a+=a+21;
		t=a-21;
		printy(std::to_string((uint32_t)vec->attr(where,world->commonAttrs::active,*chunk)));
		printy(std::to_string((uint32_t)vec->attr(where,world->worldStuff.commonAttrs::id,*chunk)));
		printy(std::to_string((uint32_t)vec->attr(where,world->worldStuff.commonAttrs::texture,*chunk)));
	},*chunk);
	printy(cell.tostring());printy(std::to_string(cell.activeCount));
	cell.remove(0, 0,0,0,0,*chunk);
	printy(cell.tostring());printy(std::to_string(cell.activeCount));
	cell.add(sorted_vector<uint32_t>{world->worldStuff.commonAttrs::id},0,0,0,0,[&](World<LFBDStuff>::PartsNode* vec, uint32_t where){
		vec->attr(where,world->worldStuff.commonAttrs::id,*chunk)=65445;
	},*chunk);
	printy(cell.tostring());printy(std::to_string(cell.activeCount));
	cell.add(sorted_vector<uint32_t>{world->worldStuff.commonAttrs::id,world->commonAttrs::active},0,0,0,0,[&](World<LFBDStuff>::PartsNode* vec, uint32_t where){
		vec->attr(where,world->worldStuff.commonAttrs::id,*chunk)=20900;
		vec->attr(where,world->commonAttrs::active,*chunk)=1;
	},*chunk);
	printy(cell.tostring());printy(std::to_string(cell.activeCount));
}
EXPORT
void testti(int ax){
	auto a=getNow();
	for(int i=0;i<ax;i++)
	printy(std::to_string(getNow()-a));
}*/
/*EXPORT
int allocdslen(){return World<LFBDStuff>::SubchunkOctree::allocer.allocds.size();}
EXPORT
void testvecp(){
	vec3i x(12,-93, 125);
	auto e=vecPack<8>(x);
	printy(std::to_string(e));
	auto e2=vecUnpack<8,true>(e);
	printy(std::to_string(e2.x)+","+std::to_string(e2.y)+","+std::to_string(e2.z));
}*/
EXPORT("tester")void tester(){
throw std::runtime_error("helloo");
}
}