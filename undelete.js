let db=require("./db.js")
let readline=require("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function question(str){
	return new Promise(resolve => rl.question(str, resolve))
}
;(async function(){

	let sk = await question('search prefix: ')
	const [files] = await db.bucket.getFiles({prefix:sk, softDeleted:true})
	let i=0
	for(let f of files){
		const {softDeleteTime,name,generation} = f.metadata
		console.log(i+++",", name,", deleted time",softDeleteTime,", generation",generation)
	}

	while(true){
	let f = files[await question("which one: ")]
	f = await f.restore({generation:f.metadata.generation})
	console.log(f)
	}

})()