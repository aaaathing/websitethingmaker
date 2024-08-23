if(1){
  require("./editor/updatefiles.js")
  return
}


const db=require("./db.js")

;(async function(){
  
})()

/*function wait(x){return new Promise(r=>setTimeout(r,x))}
var unzipper = require('unzipper');
;(async function(){
  console.log((await db.list()).length)
})()*/
/*let i=0
db.getStream('users.zip')
.pipe(unzipper.Parse())
.on('entry', function (entry) {
  var fileName = entry.path;
  var type = entry.type; // 'Directory' or 'File'

  if (/\/$/.test(fileName)) {
    console.log('[DIR]', fileName, type);
    return;
  }
  //console.log(fileName)
  //process.exit()
  db.setStream(fileName,entry)
  i++
  if(!(i&64))console.log(i,fileName)
}).on("finish",console.log)*/