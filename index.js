const db=require("./db.js")
  function wait(){return new Promise(r=>setTimeout(r,1000))}
;(async function(){
  await db.set("hello",{hello:12321,a:"rrrrrr"})
  await db.get("hello").then(console.log)
  await db.set("hello",{hello:12321,a:"rrrrrr2",23:12})
  await db.delete("hello")
  await wait(3000)
  await db.get("hello").then(console.log)
})()