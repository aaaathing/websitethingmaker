var input = document.getElementById("input")
var button = document.getElementById("button")
var num = document.getElementById("num")
var prog = document.getElementById("prog")
var output = document.getElementById("output")
var buttonStep = document.getElementById("button-step")
var numStep = document.getElementById("num-step")
var loadStep = document.getElementById("load-step")
var copyStep = document.getElementById("copy-step")
input.oninput = function(){
  numStep.style.display = "block"
}
num.oninput = function(e){
  if(parseInt(num.value) > languages.length) num.value = languages.length
  buttonStep.style.display = "block"
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function translateTo(text,lang){
  var res = await fetch("https://translate-service.scratch.mit.edu/translate?language="+lang+"&text="+encodeURIComponent(text)).then(r => r.json()).catch(e => {
    alert("Fetch Error!")
    console.log(e)
    return e
  })
  if(res.code) return res
  return res.result
}
var languages = ["am","ar","az","eu","bg","ca","zh-cn","zh-tw","hr","cs","da","nl","en","et","fi","fr","gl","de","el","he","hu","is","id","ga","it","ja","ko","lv","lt","mi","nb","fa","pl","pt","ro","ru","gd","sr","sk","sl","es","sv","th","tr","uk","vi","cy","zu"]
async function doIt(){
  loadStep.style.display = "block"
  button.disabled = true
  var text = input.value
  var numTimes = num.value
  var arr = languages.slice()
  for(var i=0; i<numTimes; i++){
    var rand = Math.floor(Math.random()*arr.length)
    var lang = arr[rand]
    arr.splice(rand,1)
    var text = await translateTo(text,lang)
    prog.innerHTML = ((i+1)/numTimes*100)+"%<br>Current text: "+text
    if(typeof text !== "string"){
      console.log(text)
      prog.innerHTML = "Error!"
      return
    }
    await sleep(200)
  }
  text = await translateTo(text,"en")
  if(typeof text !== "string"){
    console.log(text)
    prog.innerHTML = "Error!"
    return
  }
  output.innerHTML = text
  copyStep.style.display = "block"
  button.disabled = false
}