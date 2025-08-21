#include <stdlib.h>
#include <cxxabi.h>

__attribute__((import_module("env"), import_name("_throw"))) void _throw(void *thrown_object);

extern "C" void * __cxa_allocate_exception(size_t thrown_size){
	return ((char*)operator new(thrown_size+80))+80;
}
extern "C" void __cxa_throw(void *thrown_object, std::type_info *tinfo, void (_LIBCXXABI_DTOR_FUNC *dest)(void *)){
	_throw(thrown_object);
	__builtin_unreachable();
}

// replace it
//extern "C" int __main_void(void){return 0;}

#define EXPORT(name) __attribute__((export_name(name)))
#define IMPORT(name) __attribute__((import_module("env"), import_name(name)))