import {Transformer} from '@parcel/plugin';
import fs from "fs"
import path from "path"

export default new Transformer({
  async transform({asset}) {
    let code = await asset.getCode();

    asset.type = 'js';
    asset.setCode(code.replace(/fetch\(['"]([./\w]*\.wasm)['"]\)/g, (w,file) => `
(function(){
	const binaryWasmString = atob("${Buffer.from(fs.readFileSync(path.resolve(path.dirname(asset.filePath),file)),'binary').toString('base64')}")
	const buf = new Uint8Array(binaryWasmString.length)
	for (var i = 0; i < binaryWasmString.length; i++) buf[i] = binaryWasmString.charCodeAt(i);
	return new Promise(resolve => {
		const r = new Response(buf, { status: 200, headers: { "Content-Type": "application/wasm" } })
		resolve(r)
	})
})()
		`));

    return [asset];
  }
});