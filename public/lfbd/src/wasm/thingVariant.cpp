//TYPE_LIST & TYPENAME should be defined before
//NO_CONSTRUCT may be defined

#ifndef TYPE_LIST
#define TYPE_LIST(x)
#endif

struct TYPENAME{
	#define FUNC(T,Tname) typedef T typefor_##Tname;
	TYPE_LIST(FUNC)
	#undef FUNC
	enum indexType{
		#define FUNC(T,Tname) idfor_##Tname ,
		TYPE_LIST(FUNC)
		#undef FUNC
	} thisIndex;
	union unt{
		unt(){}
		~unt(){}
		#define FUNC(T,Tname) typefor_##Tname for_##Tname ;
		//unt(T&& x):for_##T(x){}
		TYPE_LIST(FUNC)
		#undef FUNC
		size_t inte;
	} un;

	template <typename T>
	inline void destruct(T& x){
		x.~T();
	}
	inline void destruct(){
		switch(thisIndex){
			#define FUNC(T,Tname) \
			case idfor_##Tname :\
				destruct(un.for_##Tname);\
				break;\
			
			TYPE_LIST(FUNC)
			#undef FUNC
		}
	}
	
	~TYPENAME(){ destruct(); }

	template <typename T>
	T& get() = delete;
	template <typename T>
	bool has() = delete;
	template <typename T>
	const T& get()const = delete;
	template <typename T>
	const bool has()const = delete;
	#define FUNC(T,Tname) \
	TYPENAME(typefor_##Tname&& x): thisIndex(idfor_##Tname) {\
		new(&un.for_##Tname) typefor_##Tname(std::move(x));\
	}\
	void operator=(typefor_##Tname&& x){\
		destruct();\
		thisIndex = idfor_##Tname;\
		new(&un.for_##Tname) typefor_##Tname(std::move(x));\
	}\
	template<>\
	typefor_##Tname& get<typefor_##Tname>(){\
		/*if(idfor_##Tname != thisIndex) throw std::runtime_error("bad access");*/\
		return un.for_##Tname;\
	}\
	template<>\
	bool has<typefor_##Tname>(){\
		return idfor_##Tname == thisIndex;\
	}\
	template<>\
	const typefor_##Tname& get<typefor_##Tname>()const{\
		/*if(idfor_##Tname != thisIndex) throw std::runtime_error("bad access");*/\
		return un.for_##Tname;\
	}\
	template<>\
	const bool has<typefor_##Tname>()const{\
		return idfor_##Tname == thisIndex;\
	}\

	TYPE_LIST(FUNC)
	#undef FUNC

	template <typename F>
	auto visit(F&& func){
		switch(thisIndex){
			#define FUNC(T,Tname) \
			case idfor_##Tname:\
				return func(un.for_##Tname);\
				break;\
			\

			TYPE_LIST(FUNC)
			#undef FUNC
		}
	}
	template <typename F>
	const auto visit(F&& func)const{
		switch(thisIndex){
			#define FUNC(T,Tname) \
			case idfor_##Tname:\
				return func(un.for_##Tname);\
				break;\
			\

			TYPE_LIST(FUNC)
			#undef FUNC
		}
	}
	#ifndef NO_CONSTRUCT
	template <typename it>
	void fromIndex(it i){
		destruct();
		thisIndex = static_cast<indexType>(i);
		switch(thisIndex){
			#define FUNC(T,Tname) \
			case idfor_##Tname:\
				un.for_##Tname = typefor_##Tname();\
				break;\
			\

			TYPE_LIST(FUNC)
			#undef FUNC
			default:
				throw std::runtime_error("invalid index in fromIndex");
		}
	}
	#endif
	void operator=(TYPENAME&& that){
		destruct();
		thisIndex = that.thisIndex;
		switch(thisIndex){
			#define FUNC(T,Tname) \
			case idfor_##Tname:\
				un.for_##Tname = std::move(that.un.for_##Tname);\
				break;\
			\

			TYPE_LIST(FUNC)
			#undef FUNC
		}
	}
	auto index(){return thisIndex;}
};

#undef TYPENAME
#undef TYPE_LIST
#undef NO_CONSTRUCT