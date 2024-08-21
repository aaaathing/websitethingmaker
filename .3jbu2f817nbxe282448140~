function whichValid(a,b){
  if(a || a===0 || a===false){
    return a
  }
  return b
}

var canvas = document.getElementById("c")
var ctx = canvas.getContext("2d")

var width, height
window.onresize = function(){
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx.imageSmoothingEnabled = false
  width = window.innerWidth
  height = window.innerHeight
}
onresize()
var mouseX=0, mouseY=0
window.onmousemove = function(e){
  mouseX = e.clientX
  mouseY = e.clientY
}
window.onclick = function(e){
  mouseX = e.clientX
  mouseY = e.clientY
  Button.click()
}

var init
var loaded = 0
var maxLoad = 0
function loadDone(){
  loaded ++
  if(loaded >= maxLoad){
    if(loaded > maxLoad) console.log("loaded > maxLoad")
    init()
    removeRaf()
    gameLoop()
  }
}
function newImg(url){
  maxLoad ++
  var img = new Image()
  img.src = url
  img.onload = loadDone
  return img
}
function newAudio(url){
  maxLoad ++
  var audio = new Audio()
  audio.src = url
  audio.onload = loadDone
  return audio
}

var imgCoords = {
  "dino":[1682,6,80,86],
  "dinoBlink":[1770,6,80,86],
  "dinoRun0":[1858,6,84,90],
  "dinoRun1":[1944,6,84,90],
  "dinoOops":[2034,6,80,90],
  "ground":[2,99,2401,40],
}
var resourceImg = newImg("offline-resources.png")

function drawThing(name, x,y,w,h){
  var coords = imgCoords[name]
  if(!coords) return
  w = w || coords[2]
  h = h || coords[3]
  ctx.drawImage(resourceImg, coords[0], coords[1], coords[2], coords[3], x,y,w,h)
}

var screen = ""
class Button{
  constructor(x,y,w,h,screen,onclick,label){
    this.x = x - (w/2)
    this.y = y - (h/2)
    this.w = w
    this.h = h
    this.px = x
    this.py = y
    this.screen = screen
    this.onclick = onclick
    this.label = label
  }
  click(){
    if(this.onclick) this.onclick()
  }
  collide(){
    return (
      mouseX > this.x &&
      mouseY > this.y &&
      mouseX < this.x+this.w &&
      mouseY < this.y+this.h
    )
  }
  draw(){
    ctx.fillStyle = this.collide() ? "#ccc" : "#aaa"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.fillRect(this.x,this.y,this.w,this.h)
    ctx.strokeRect(this.x,this.y,this.w,this.h)

    ctx.fillStyle="black"
    ctx.font="18px monospace"
    ctx.textAlign = "center"
    ctx.fillText(this.label,this.px, this.py+6)
  }
  static click(){
    for(var i=0; i<Button.all.length; i++){
      var btn = Button.all[i]
      if(btn.collide()){
        btn.click()
        break
      }
    }
  }
  static draw(){
    for(var i=0; i<Button.all.length; i++){
      var btn = Button.all[i]
      if(screen === btn.screen) btn.draw()
    }
  }
  static add(x,y,w,h,screen,onclick,label){
    Button.all.push(new Button(x,y,w,h,screen,onclick,label))
  }
}
Button.all = []

var drawScreens = {}
var previousScreen = ""
function changeScreen(s){
  previousScreen = screen
  screen = s
}

function gameLoop(){
  drawScreens[screen]()
  Button.draw()
  window.parent.raf = requestAnimationFrame(gameLoop)
}
function removeRaf(){
  if(window.parent.raf !== undefined){
    cancelAnimationFrame(window.parent.raf)
  }
}
function clear(){
  ctx.clearRect(0,0,canvas.width,canvas.height)
}
function fontSize(s){
  ctx.font = s+"px monospace"
}
var textAlign = function(a){ctx.textAlign = a}
var text = function(){ctx.fillText(...arguments)}

function round(n, toNearest){
  if(toNearest){
    return Math.round(n/toNearest)*toNearest
  }else return Math.round(n)
}
function ceil(n, toNearest){
  if(toNearest){
    return Math.ceil(n/toNearest)*toNearest
  }else return Math.ceil(n)
}