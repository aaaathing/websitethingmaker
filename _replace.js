(async function(){
const fs=require("fs")
let str=fs.readFileSync("public/minekhan/_mksrc10test-world.js","utf-8")

let d= await fetch("https://github.com/PrismarineJS/minecraft-assets/raw/refs/heads/master/data/1.21.1/texture_content.json").then(r=>r.json())
let dmap={};for(let i of d)dmap[i.name]=1

//let replaced={}
let start=str.indexOf('const blockData')
let end=str.indexOf('const BLOCK_COUNT')
str=str.slice(0,start)+str.slice(start,end).replace(/\{\s*name: *"(.*?)"/g, ($1,s)=>{
	let ns = s.replace(/[A-Z]/g, l=>"_"+l.toLowerCase())
	if(ns===s)return $1
	if(!dmap[ns] || s.match(/[^a-zA-Z_]/)){console.log(s)
		return $1
	}
	//replaced[s]=ns
	return $1+","+($1.includes("\n")?"\n\t\t":" ")+"nameMcd:\""+ns+"\""
})+str.slice(end)

/*for(let i in replaced){
	str=str.replace(new RegExp("\\b"+i+"\\b","g"), replaced[i])
}*/

fs.writeFileSync("public/minekhan/_mksrc10test-world.js",str)

/*str=fs.readFileSync("public/minekhan/_mksrc10test.html","utf-8")
for(let i in replaced){
	str=str.replace(new RegExp("\\b"+i+"\\b","g"), replaced[i])
}
fs.writeFileSync("public/minekhan/_mksrc10test.html",str)*/

})()