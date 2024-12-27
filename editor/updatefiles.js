const fs=require("fs")
async function wasFolderChanged(path,time) {
  let stuff = await fs.promises.readdir(path)
  let maxTime = -Infinity
  for(let fname of stuff){
    if(fname.startsWith(".") || fname === "node_modules") continue
    let stat = await fs.promises.stat(path+"/"+fname)
    if(stat.isDirectory()){
      maxTime = Math.max(maxTime, await wasFolderChanged(path+"/"+fname,time))
    }else{
      let ftime = new Date(stat.mtime).getTime()
      maxTime = Math.max(maxTime,ftime)
      if(ftime > time){
        let file = path+"/"+fname
        //if(file.startsWith("./")) file = file.replace("./","")
        console.log(file)
        let stuff = await fetch(
          "https://thingmaker.replit.app/internal/updateFile/"+(Buffer.from(file).toString("base64")/*.replace("\=+$","")*/)+"?pwd="+encodeURIComponent(process.env.passKey),
          {method:"POST", body: (await fs.promises.readFile(file))}
        )
        let str = await stuff.text()
        if(str !== "success"){
          throw new Error("fail "+str.slice(0,1000)+"|")
        }
      }
    }
  }
  return maxTime
}

;(async function(){
	let after = await fetch("https://thingmaker.replit.app/internal/getFile/"+(Buffer.from("editor/updatefilestime.txt").toString("base64"))+"?pwd="+encodeURIComponent(process.env.passKey)).then(r => r.text())
	console.log("after "+after.slice(0,1000)+"|")
  if(!after || isNaN(after)) return console.log("^ fail")
	let time = await wasFolderChanged(".", +after)
  await fs.promises.writeFile(__dirname+"/updatefilestime.txt", time+"")
  console.log("finish finding changed files")
})()