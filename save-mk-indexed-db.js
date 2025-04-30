const fs=require("fs")
let id = 0

require('express-ws')(app)
const express=require("express")
const router = express.Router()

router.ws("/open-indexed-db", function(ws,req){
	let msgI = 0, zipPath
	ws.on('message', async msg => {
		msgI++
		if(msgI === 1){
			zipPath = msg
			return
		}
		try{
		let dir = require("os").tmpdir()+"/open-indexed-db-"+(id++)+"/"
		try{
			await fs.promises.mkdir(dir)
		}catch{
			await fs.promises.rm(dir,{recursive:true})
			await fs.promises.mkdir(dir)
		}
		const zip = new (require("jszip"))()
		await zip.loadAsync(msg)
		let promises = []
		zip.folder(zipPath).forEach((path, file) => {
			promises.push(new Promise(resolve => {
				file.nodeStream().pipe(fs.createWriteStream(dir+path)).on("finish", resolve)
			}))
		});
		await Promise.all(promises)
		const { Level } = require('level')
		const db = new Level(dir, {comparator:"idb_cmp1"})
		await db.open()
		for await (const [key, value] of db.iterator()) {
	    ws.send(key)
			ws.send(value)
	  }
		await db.close()
		await fs.promises.rm(dir,{recursive:true})
		ws.close()
		}catch(e){
			console.log(e)
			ws.close()
		}
	})
})

app.use(router)