#include <stdlib.h>
#include <algorithm>

template <typename T, typename T2>
T rightShiftPad1(T n, T2 amount){
	return n >> amount | (~0) << (std::numeric_limits<T>::digits-amount);
}

//useful for ints
template <typename T>
T floor_div(T a, T b) {
	T d = a / b;
	return d * b == a ? d : d - ((a < 0) ^ (b < 0));
}
//adds sign to number with fewer bits
template <uint32_t bits>
int32_t signedNBitNum(uint32_t x){
	return x-((x&(((uint32_t)1)<<(bits-1)))<<1);
}
// use c++20 to make this function reliable
inline int32_t sar(int32_t val, unsigned int sh)
{
  uint32_t uval = static_cast<uint32_t>(val);
  uint32_t result = (uval >> sh) | -((uval & 0x80000000) >> sh);
  return static_cast<int32_t>(result);
}
template <typename T>
T square(T x){return x*x;}

template <typename T, size_t size>
struct myBitset{
	static_assert(size <= std::numeric_limits<T>::digits, "bitset: not enough bits in type");
	T x = 0;
	inline void set(size_t i, bool b){
		if(b) x |= (T)1<<i;
		else x &= ~((T)1<<i);
	}
	inline bool any(){return x;}
	inline myBitset& fill(){
		x = ~((T)0);
		return *this;
	}
	inline bool operator[](size_t i){
		return x&((T)1<<i);
	}
};

template <typename T>
struct vec3{
	T x; T y; T z;
	vec3(T x,T y,T z): x(x),y(y),z(z){}

	template <typename otherT>
	vec3(vec3<otherT> other): x(other.x),y(other.y),z(other.z){}

	bool operator==(const vec3<T>& other)const{
		return x==other.x && y==other.y && z==other.z;
	}
	vec3<T> operator+(const vec3<T>& other)const{
		return vec3<T>(x+other.x,y+other.y,z+other.z);
	}
	vec3<T> operator-(const vec3<T>& other)const{
		return vec3<T>(x-other.x,y-other.y,z-other.z);
	}
	template <typename otherNum>
	vec3<T> operator*(const otherNum& other)const{
		return vec3<T>(x*other,y*other,z*other);
	}
	template <typename otherNum>
	vec3<T>& operator*=(const otherNum& other){
		x *= other;
		y *= other;
		z *= other;
		return *this;
	}
	template <typename otherNum>
	vec3<T>& operator-=(const vec3<otherNum>& other){
		x -= other.x;
		y -= other.y;
		z -= other.z;
		return *this;
	}
	template <typename otherNum>
	vec3<T>& operator+=(const vec3<otherNum>& other){
		x += other.x;
		y += other.y;
		z += other.z;
		return *this;
	}
	bool notZero(){
		return x || y || z;
	}
	void set(T nx,T ny,T nz){
		x=nx;y=ny;z=nz;
	}
};
template <typename T>
struct std::hash<vec3<T>>
{
  std::size_t operator()(const vec3<T>& k) const{
		return ((std::hash<T>()(k.x) ^ (std::hash<T>()(k.y) << 1)) >> 1) ^ (std::hash<T>()(k.z) << 1);
	}
};
typedef vec3<int32_t> vec3i;
typedef vec3<uint32_t> vec3u;
typedef vec3<double> vec3f;
struct null_t{};
null_t null2;

template <uint32_t bits, bool signedd=false>
auto vecUnpack(uint32_t x){
	static const auto mask = ((uint32_t)1<<bits)-1;
	if constexpr(signedd) return vec3i(signedNBitNum<bits>(x>>bits>>bits&mask),signedNBitNum<bits>(x>>bits&mask),signedNBitNum<bits>(x&mask));
	else return vec3u(x>>bits>>bits&mask,x>>bits&mask,x&mask);
}
template <uint32_t bits, typename vecElem>
uint32_t vecPack(vec3<vecElem> v){
	static const auto mask = ((uint32_t)1<<bits)-1;
	return (uint32_t(v.x)&mask)<<bits<<bits | (uint32_t(v.y)&mask)<<bits | uint32_t(v.z)&mask;
}

//from https://lafstern.org/matt/col1.pdf and changed
template <class T, class Compare = std::less<T> >
struct sorted_vector {
	std::vector<T> V;
	Compare cmp;
	typedef typename std::vector<T>::iterator iterator;
	typedef typename std::vector<T>::const_iterator const_iterator;
	iterator begin() { return V.begin(); }
	iterator end() { return V.end(); }
	const_iterator begin() const { return V.begin(); }
	const_iterator end() const { return V.end(); }
	
	sorted_vector(const Compare& c = Compare())
	: V(), cmp(c) {}
	template <class InputIterator>
	sorted_vector(InputIterator first, InputIterator last, const Compare& c = Compare())
	: V(first, last), cmp(c)
	{
		std::sort(begin(), end(), cmp);
	}
	sorted_vector(std::initializer_list<T> il, const Compare& c = Compare())
	: V(il), cmp(c) {
		std::sort(begin(), end(), cmp);
	}
	
	iterator insert(const T& t) {
	iterator i = std::lower_bound(begin(), end(), t, cmp);
	if (i == end() || cmp(t, *i))
	V.insert(i, t);
	return i;
	}
	const_iterator find(const T& t) const {
	const_iterator i = std::lower_bound(begin(), end(), t, cmp);
	return i == end() || cmp(t, *i) ? end() : i;
	}
	bool operator == (const sorted_vector<T>& d) const {
   	return V == d.V;
	}
	auto size()const{return V.size();}
	void insert(const std::initializer_list<T> il){
		for(const T& i : il){
			insert(i);
		}
	}
	std::string tostring()const{
		return std::accumulate(V.begin()+1, V.end(), std::to_string(V[0]),
		[](const std::string& a, uint32_t b){
					return a + ',' + std::to_string(b);
		});
	}
};
template <typename T>
struct std::hash<sorted_vector<T>>{
	size_t operator()(const sorted_vector<T> s)const{
		size_t x = 0;
		for(const T& i : s){
			x ^= std::hash<T>{}(i);
		}
		return x;
	}
};

/*//from https://stackoverflow.com/questions/6166337/does-c-support-compile-time-counters
struct ceCounter{
	template<typename ver, auto Id>
	struct counter {
		using tag = counter;

		struct generator {
				friend consteval auto is_defined(tag)
				{ return true; }
		};
		friend consteval auto is_defined(tag);

		template<typename Tag = tag<ver>, auto = is_defined(Tag<ver>{})>
		static consteval auto exists(auto)
		{ return true; }

		static consteval auto exists(...)
		{ return generator(), false; }
	};

	template<typename ver, auto Id = int{}, typename = decltype([]{})>
	consteval static auto next() {
			if constexpr (not counter<ver, Id>::exists(Id)) return Id;
			else return next<ver, Id + 1>();
	}
};
static_assert(ceCounter::next<ceCounter>() == 0 && ceCounter::next<ceCounter>() == 1 && ceCounter::next<ceCounter>() == 2 && ceCounter::next<ceCounter>() == 3, "constexprCounter is a counter");*/