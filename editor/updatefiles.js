const fs=require("fs")
function wasFolderChanged(path,time) {
  let stuff = fs.readdirSync(path)
  let maxTime = -Infinity
  for(let fname of stuff){
    if(fname.startsWith(".")) continue
    let stat = fs.statSync(path+"/"+fname)
    if(stat.isDirectory()){
      maxTime = Math.max(maxTime, wasFolderChanged(path+"/"+fname,time))
    }else{
      let ftime = new Date(stat.mtime).getTime()
      maxTime = Math.max(maxTime,ftime)
      if(ftime > time){
        fetch("https://thingmaker.replit.app/internal/updateFile/"+encodeURIComponent(path+"/"+fname)+"?pwd="+process.env.passKey)
      }
    }
  }
  return maxTime
}

let time = wasFolderChanged(".", +fs.readFileSync(__dirname+"/updatefilestime.txt",{encoding:"utf-8"}))
fs.writeFileSync(__dirname+"/updatefilestime.txt", time+"")
console.log("finish finding changed files")