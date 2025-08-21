WASI_SDK_PATH="$PWD/Downloads/wasi-sdk"
cd Documents/lfbd/wasm
if [ $# -eq 0 ]; then
	echo "type\n'or' for optimize & no function names \n'od' for optimize and function names\n"
	read
	OPTIONS="$REPLY"
else
	OPTIONS="$1"
fi
echo "running compile-it with option: $OPTIONS"
Thing="/opt/homebrew/opt/llvm/bin/clang++ --sysroot=$WASI_SDK_PATH/share/wasi-sysroot -resource-dir /Users/aaron/Downloads/wasi-sdk/lib/clang/18 --target=wasm32-wasi  -mexec-model=reactor -std=c++20 -fno-rtti -o theformats.wasm theformats.cpp -v "
if [[ "$OPTIONS" == "or" ]]; then
	$Thing -O3 -Wl,--lto-O3 -Wl,--strip-all -msimd128
elif [[ "$OPTIONS" == "od" ]]; then
	mv /opt/homebrew/opt/binaryen/bin/wasm-opt /opt/homebrew/opt/binaryen/bin/wasm-opt-temp # prevent running wasm-opt
	$Thing -O3 -Wl,--lto-O3 -fdebug-info-for-profiling
	mv /opt/homebrew/opt/binaryen/bin/wasm-opt-temp /opt/homebrew/opt/binaryen/bin/wasm-opt
fi


# -flto \ # Add metadata for link-time optimizations
# -Wl,--lto-O3 \ # Aggressive link-time optimizations
# -v # view invocation
# -mexec-model=reactor # no main function