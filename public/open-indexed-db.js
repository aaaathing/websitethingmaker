const fs=require("fs")
let id = 0
router.get("/open-indexed-db", async function(req,res){
	let dir = require("os").tmpdir()+"/open-indexed-db-"+(id++)+"/"
	const zip = new (require("jszip").JSZip)()
	console.log(zip)
	await zip.loadAsync(await getData(req))
	let promises = []
	zip.folder(req.query.path).forEach((path, file) => {
		promises.push(new Promise(resolve => {
			file.nodeStream().pipe(fs.createWriteStream(dir+path)).on("finish", resolve)
		}))
	});
	await Promise.all(promises)
	const { Level } = require('level')
	const db = new Level(dir)
	console.log(await db.list())
})
function getData(){
	return new Promise(resolve => {
		let body = []
		req.on('data', chunk => body.push(chunk));
		req.on('end', () => resolve(Buffer.concat(body)));
	})
}