async function serveIndex(req,res, dir,read,isDirectory){
	let path = decodeURIComponent(req.path)
	//let dir = list
	let index
	if(dir.includes("index.json")) index = await read("index.json")
	else index = {}
	res.write("<style>a>*{vertical-align:middle;}.item{display:inline-block;width:16px;height:16px;box-sizing:border-box;}.file{border:1px solid black;background:white;}.folder{background:linear-gradient(0,yellow,brown);}</style>")
	res.write("<h1>Index of "+sanitize(path)+"</h1><hr>")
	let list = []
	for(const dirent of dir){
		let folder = isDirectory(dirent)
		let ii = index[dirent.name]
		list.push({name:dirent.name, str: "<tr><td><a href='"+sanitize(dirent.name)+(folder?"/":"")+"'><div class='item "+(folder?"folder":"file")+"'></div> <span>"+sanitize(dirent.name)+"</span></a></td><td>"+(ii&&ii.created||"")+"</td><td>"+(ii&&ii.lastModified||"")+"</td></tr>" })
		if(!folder && dirent.name.toLowerCase().startsWith("readme")){
			res.write("<h2>"+sanitize(dirent.name)+"</h2>"+await read(dirent.name)+"<hr>")
		}
	}
	res.write("<table><thead><tr><th>Name</th><th>Created</th><th>Last modified</th></tr></thead><tbody>")
	list.sort((a,b) => (index[b.name]?Date.parse(index[b.name].created):Infinity) - (index[a.name]?Date.parse(index[a.name].created):Infinity) || 0)
	for(let i of list){
		res.write(i.str)
	}
	res.write("</tbody></table>")
	res.end()
}
module.exports.serveIndex = serveIndex


const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');
const fs=require("fs")
const path=require("path")

let service
	if(process.env["gdriveServiceacc"]){
	const auth = new GoogleAuth({
	  scopes: 'https://www.googleapis.com/auth/drive',
	  credentials:JSON.parse(process.env["gdriveServiceacc"])
	});
	service = google.drive({version: 'v3', auth});
}

module.exports.gdrivemw = function(folderId){
	const cache = new Map()
	return async function(req,res,next){
		if(!service) return res.send("no access")
		try{
		let cur = {id:folderId, mimeType:"application/vnd.google-apps.folder"}
		for(let p of req.url.split("/")){
			if(!p) continue
			let l = (await service.files.list({
				q:"parents='"+cur.id+"' and name="+JSON.stringify(decodeURIComponent(p)),
				fields:"files(id,mimeType,name,shortcutDetails)"
			}))
			if(!l.data.files.length) return next()
			cur = l.data.files[0]
			if(cur.shortcutDetails){
				cur.id = cur.shortcutDetails.targetId
				cur.mimeType = cur.shortcutDetails.targetMimeType
			}
			console.log(p,cur)
		}
		if(cur.mimeType === "application/vnd.google-apps.folder"){
			let l = (await service.files.list({
				q:"parents='"+cur.id+"'",
				fields:"files(id,mimeType,name,shortcutDetails)"
			}))

			serveIndex(req,res, l.data.files, async name => (await service.files.list({ q:"parents='"+cur.id+"' and name="+JSON.stringify(name) })).data, f => (f.shortcutDetails&&f.shortcutDetails.targetMimeType||f.mimeType) === "application/vnd.google-apps.folder")
		}else{
			const file = await service.files.get({
		    fileId: cur.id,
		    alt: 'media',
		  }, { responseType: "stream" });
			file.data.pipe(res)
		}
		}catch(e){console.error(e);res.status(500).send(e.message)}
	}
}