const fs=require("fs")
async function wasFolderChanged(path,time) {
  let stuff = await fs.promises.readdir(path)
  let maxTime = -Infinity
  for(let fname of stuff){
    if(fname.startsWith(".")) continue
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
          throw new Error("fail "+str.slice(0,1000))
        }
      }
    }
  }
  return maxTime
}

;(async function(){
  let time = await wasFolderChanged(".", +await fs.promises.readFile(__dirname+"/updatefilestime.txt",{encoding:"utf-8"}))
  await fs.promises.writeFile(__dirname+"/updatefilestime.txt", time+"")
  console.log("finish finding changed files")
})()