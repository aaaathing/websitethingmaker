var infoEl = document.getElementById("info"), info = "<h1>Available functions and variables</h1>"
for(let i of mathProps){
  info += i+": "+(typeof window[i])+"<br>"
}
infoEl.innerHTML = info
var chooseEl = document.getElementById("choose")
var options = {
  "octagon thingy":`var a = lerp(0.5,
abs(x)+abs(y),
max(abs(x),abs(y))
)
return a<1?\`rgb(\${(1-a)*255},\${a*255},0\`:false`,
  "red circle":`return (x*x+y*y)*255`,
  "rainbow circle":`var a=HSVtoRGB(x*x+y*y,1,1)
return (a.r<<16)|(a.g<<8)|a.b`,
  "kinda spiral":`return (x*x+y*y+x/y)*255`,
  "weird thing":`return 99999*(x-y*y)*((y+x-x*y)+x*x)`,
  "weird thing 2":`return 99999*(x*x-y*y)*(y*y*y+x*y)`,
  "noise":`var a = noise(x,y,x*y)*255
return "rgb("+a+","+a+","+a+")"`,
  "colorful thing":"return(x-y)*x*(x-y*y)*x-y*(x*y-x-y)",
  
  "Forbbiden":`//You know what lies ahead. It is not as complicated as it seems.
if(!window.qwerty){window.qwerty=document.createElement('video');qwerty.src=atob("aHR0cHM6Ly9pYTgwMTYwMi51cy5hcmNoaXZlLm9yZy8xMS9pdGVtcy9SaWNrX0FzdGxleV9OZXZlcl9Hb25uYV9HaXZlX1lvdV9VcC9SaWNrX0FzdGxleV9OZXZlcl9Hb25uYV9HaXZlX1lvdV9VcC5tcDQ=");qwerty.play()};
ctx.drawImage(qwerty,0,0,c.width,c.height)
return true
var e = x*123/E
e += sqrt(cbrt(e))
e *= log(y)`
}
var optionNames = []
for(var i in options){
  optionNames.push(i)
  var option = document.createElement("option")
  option.textContent = i
  option.value = i
  chooseEl.appendChild(option)
}
chooseEl.onchange = function(e){
  inp.value = options[chooseEl.value]
}

var inp = document.getElementById("input"), c = document.getElementById("c"), ctx = c.getContext("2d"), scaleInp = document.getElementById('scale')
inp.value = options[optionNames[0]]
var currentFrame = null
var func, x, y, scale
function startDraw(){
  try{
    func = Function("x","y",inp.value)
  }catch(e){
    return alert(e.message)
  }
  if(currentFrame !== null) cancelAnimationFrame(currentFrame)
  x = y = 0
  scale = parseFloat(scaleInp.value) || 1
  //ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = "#0004"
  ctx.fillRect(0, 0, c.width, c.height)
  draw()
}

onresize = function(){
  c.width = round(innerWidth*0.7)
  c.height = innerHeight
  c.style.width = c.width+"px"
  c.style.height = c.height+"px"
}
onresize()

function draw(){
  var start = performance.now()
  while(performance.now() - start < 5){
    x++
    if(x > c.width) x = 0, y++
    if(y > c.height) return
    try{
      var pix = func((x*2/c.width-1)*scale,(y*2/c.height-1)*scale)
    }catch(e){
      return alert(e.message)
    }
    if(pix === true) pix = "black"
    else if(typeof pix === "number"){
      pix = -Math.abs(pix)
      pix = `rgb(${(pix>>16)&255},${(pix>>8)&255},${pix&255})`
    }else if(!pix) pix = "white"
    ctx.fillStyle = pix
    ctx.fillRect(x,y,1,1)
  }
  currentFrame = requestAnimationFrame(draw)
}