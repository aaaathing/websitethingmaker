/*
To run:
node uploadMK.js
*/
let fs=require("fs").promises
;(async function(){
	console.log("Reading...")
	let str = await fs.readFile("public/minekhan/_mksrc.html", { encoding: 'utf8' })
	let str2 = await fs.readFile("public/minekhan/_mksrc-world.js", { encoding: 'utf8' })
	let minify = (await import("minify")).minify
	console.log("Minifying...")
	let whereInsert = str.indexOf("//INSERT-SERVER-CODE-HERE")
	let content = await minify.html(str.substring(0,whereInsert)+str2+str.substring(whereInsert))//,{html:{minifyJS:{compress:{keep_classnames:true}}}} //complicated because i had to look through a lot of package's code
	console.log("Saving")
	await fs.writeFile("public/minekhan/index.html", content)
})()