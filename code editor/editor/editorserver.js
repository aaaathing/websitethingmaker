require('dotenv').config()
const fs = require("fs")
const express = require("express")
const app = express()
const router = express.Router()
const url = require('url');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
const actualDirname = (function(){let a=__dirname.split("/");a.pop();return a.join("/")})()
function Log(...stuff){
  fs.promises.appendFile(__dirname+"/editorlog.txt",stuff.join(" ")+"\r\n")
}
function getPostBuffer(req){
  return new Promise(function(resolve){
    let body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });
    req.on('end', () => {
      req.body = Buffer.concat(body)
      resolve(req.body)
    });
  })
}
function auth(req,res,next){//https://stackoverflow.com/questions/5951552/basic-http-authentication-in-node-js
  var header = req.headers.authorization || '';       // get the auth header
  res.header("WWW-Authenticate", 'Basic realm="website inside"')
  var token = header.split(/\s+/).pop() || '';        // and the encoded auth token
  var auth = Buffer.from(token, 'base64').toString(); // convert from base64
  var parts = auth.split(/:/);                        // split on colon
  var username = parts.shift();                       // username is first
  var password = parts.join(':');
  req.thePassword = password
  if(password === process.env.passKey) next()
  else res.status(401).sendFile(actualDirname+"/401.html")
}
async function getPostText(req){
  await getPostBuffer(req)
  req.body = req.body.toString()
  return req.body
}
async function getPostData(req){
  await getPostBuffer(req)
  req.body = JSON.parse(req.body.toString())
  return req.body
}
app.use((req,res,next) => {
  req.username = req.cookies ? req.cookies.sun : null
  next()
})
router.get("/editor/get/:file",auth, async(req,res) => {
  let file = actualDirname+(req.params.file ? "/"+req.params.file : "")
  if((await fs.promises.lstat(file)).isDirectory()){
    let files = await fs.promises.readdir(file,{withFileTypes: true})
    let folders = files.filter(item => item.isDirectory())
    files = files.filter(item => item.isFile())
    res.json({folder:true,files:files.map(item => item.name),folders:folders.map(item => item.name)})
  }else{
    res.json({
      content:changedEditorFiles[req.params.file] || (await fs.promises.readFile(file)).toString(),
      name:req.params.file,
      changed: req.params.file in changedEditorFiles
    })
  }
})
router.post('/editor/save/:file',auth,async(req,res) => {
  await getPostBuffer(req)
  req.body = req.body.toString()
  let file = actualDirname+(req.params.file ? "/"+req.params.file : "")
  changedEditorFiles[req.params.file] = req.body
  try{
    await fs.promises.access(file)
  }catch{
    sendEditorWs(JSON.stringify({type:"newFile",data:req.params.file}))//file doesn't exist before
  }
  await fs.promises.writeFile(file,req.body)
  res.send('success')
  sendEditorWs(JSON.stringify({type:"saved",currentPath:req.params.file}))
  Log("Editor: "+req.username+" saved file "+req.params.file)
})
router.get('/editor/newFile/:file',auth,async(req,res) => {
  let file = actualDirname+(req.params.file ? "/"+req.params.file : "")
  await fs.promises.writeFile(file,"")
  res.send('success')
  sendEditorWs(JSON.stringify({type:"newFile",data:req.params.file}))
  Log("Editor: "+req.username+" created new file "+req.params.file)
})
router.get('/editor/newFolder/:folder',auth,async(req,res) => {
  let folder = actualDirname+(req.params.folder ? "/"+req.params.folder : "")
  await fs.promises.mkdir(folder, { recursive: true });
  res.send('success')
  sendEditorWs(JSON.stringify({type:"newFolder",data:req.params.folder}))
  Log("Editor: "+req.username+" created new folder "+req.params.folder)
})
router.get('/editor/delete/:file',auth,async(req,res) => {
  let file = actualDirname+(req.params.file ? "/"+req.params.file : "")
  if((await fs.promises.lstat(file)).isDirectory()) await fs.promises.rmdir(file, { recursive: true })
  else await fs.promises.unlink(file)
  res.send('success')
  sendEditorWs(JSON.stringify({type:"delete",data:req.params.file}))
  Log("Editor: "+req.username+" deleted file "+req.params.file)
})
router.get('/editor/restart',auth,async(req,res) => {
  res.send('success')
  process.exit()
})
let icons = require("./icons/type.js")
const mime = require('mime-types')
router.get('/editor/icon/:icon',auth,async(req,res) => {
  res.sendFile(__dirname+"/icons/"+(icons[mime.lookup(req.params.icon)] || icons[req.params.icon] || icons.default))
})

const AdmZip = require('adm-zip');
router.get('/editor/zip',auth, async function(req, res) {
    var zip = new AdmZip();
    let files = await fs.promises.readdir(actualDirname,{withFileTypes: true})
    let folders = files.filter(item => item.isDirectory())
    files = files.filter(item => item.isFile())
    for(let i of files){
      if((!i.name.startsWith(".") || i.name === ".env") && i.name !== "core") zip.addLocalFile(actualDirname+"/"+i.name, "")
    }
    for(let i of folders){
      if(!i.name.startsWith('.') && i.name !== "node_modules") zip.addLocalFolder(actualDirname+"/"+i.name, i.name)
    }

    var zipFileContents = zip.toBuffer();
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="mywebsite.zip"`,
      'Content-Type': "application/zip",
    })
    return res.end(zipFileContents);
});
router.get("/editor",auth, (req,res) => res.sendFile(__dirname+"/index.html"))
router.get("/editor/files.js",auth, (req,res) => res.sendFile(__dirname+"/files.js"))
router.get("/editor/test", (req,res) => res.send("test"))
router.get("/editor/getauth",auth,(req,res)=>res.send(req.thePassword))
app.use(router)
const httpServer = app.listen(3055)

const WebSocketServer = require("websocket").server
const editorWs = new WebSocketServer({httpServer})
let editorConnections = []
editorWs.on("request",function(request){
  let urlData = url.parse(request.httpRequest.url,true)
  if(urlData.query.pwd !== process.env.passKey) return request.reject()
  const connection = request.accept(null, request.origin);
  editorConnections.push(connection)
  connection.on("message",function(message){
    let data = JSON.parse(message.utf8Data)
    for(let i of editorConnections) if(i !== connection) i.sendUTF(message.utf8Data)
    if(data.type === "pos"){
      connection.id = data.id
      connection.file = data.file
    }else if(data.type === "changes"){
      applyEditorChanges(data.file,data.data)
    }
  })
  connection.on("close",function(){
    let msg = JSON.stringify({type:"dc",id:connection.id})
    for(let i of editorConnections) if(i !== connection) i.sendUTF(msg)
    editorConnections.splice(editorConnections.indexOf(connection))
  })
})
function replaceRange(s, start, end, substitute) {
  return s.substring(0, start) + substitute + s.substring(end);
}
let changedEditorFiles = {}
async function applyEditorChanges(file,changes){
  if(!file) return
  if(!changedEditorFiles[file]) changedEditorFiles[file] = (await fs.promises.readFile(file)).toString()
  for(let c of changes){
    changedEditorFiles[file] = replaceRange(changedEditorFiles[file],c.rangeOffset,c.rangeOffset+c.rangeLength,c.text)
  }
}
let activeFiles = new Set()
setInterval(() => {
  activeFiles.clear()
  for(let i of editorConnections){
    activeFiles.add(i.file)
  }
  for(let i in changedEditorFiles){
    if(!activeFiles.has(i)) delete changedEditorFiles[i]
  }
},5000)
function sendEditorWs(data){
  for(let i of editorConnections) i.sendUTF(data)
}