
const fs=require("fs")

async function update(){
	let str=fs.readFileSync("public/minekhan/_mksrc10test-world.js","utf-8")
	let nbd=await fetch("https://github.com/PrismarineJS/minecraft-data/blob/master/data/pc/1.21.3/blocks.json").then(r=>r.json())
	let start=str.indexOf('const blockData')
	let end=str.indexOf('const BLOCK_COUNT')
	let between=str.slice(start,end)
	let bd=eval(between)
	let bid={}
	for(let i=0;i<bd.length;i++)bid[bd[i].nameMcd||bd[i].name]=i
	let prevBs={}//prev block states
	for(let nb of nbd){//new block
		let b=bd[bid[nb.name]] //block
		if(!b)continue
		let bs=JSON.stringify(b.blockStates)
		for(let s of nb.states){
			delete s.num_values;delete s.type
		}
		let nbs=JSON.stringify(nb.states)
		if(prevBs[nbs])nbs=prevBs[nbs]
		if(bs!==nbs){
			const re2line="(?:\n\t{2,}[^\n]*?)"
			if("blockStates" in b){
				str=str.replace(
					new RegExp(`(?<=\t\tname:\\s*?['"]${b.name}['"],(.|\\n)*?\\n\t\tblockStates:\\s*)[^\\n]*?(?=,?\\n)`),
					nbs
				)
			}else{
				str=str.replace(
					new RegExp(`(?<=\t\tname:\\s*?['"]${b.name}['"],${re2line}*?)(?=\n\t\\})`),
					nbs
				)
			}
		}
		prevBs[nbs]=b.name
	}
	str=str.slice(0,start)+between+str.slice(end)
}

async function addName(){
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

}