var canvas = document.getElementById("pjs-cnv");

var width = innerWidth * 0.7
var height = innerHeight
var size = Math.min(width, height)

/*var prevImage = Image
Image = class extends prevImage{
  constructor(){
    super(...arguments)
    this.crossOrigin = ""
  }
}*/

function sketchProc(p) {
  window.p = p
  p.mouseDragged = mouseDragged
  var g = p.createGraphics(width, height, p.P3D)
  window.g = g
  g.pRotateX = g.rotateX
  g.pRotateY = g.rotateY
  g.pRotateZ = g.rotateZ
  g.rotateX = function(d){g.pRotateX(g.radians(d))}
  g.rotateY = function(d){g.pRotateY(g.radians(d))}
  g.rotateZ = function(d){g.pRotateZ(g.radians(d))}
  g.translate(width/2, height/2)
  var s = size/100
  g.scale(s,s,s)

  var drawAmount = 0
  p.draw = function(){
    drawAmount ++
    draw()
    if(drawAmount >= 2)p.noLoop()
  }
}

var processingInstance = new Processing(canvas, sketchProc);
processingInstance.size(width, height)

function mouseDragged(){
  rotY += p.mouseX - p.pmouseX
  rotX -= p.mouseY - p.pmouseY

  if(rotY > 360) rotY -= 360
  if(rotY < 0) rotY += 360
  if(rotX > 90) rotX = 90
  if(rotX < -90) rotX = -90

  draw()
}

var img
img = p.loadImage("/panorama.png",() => draw())

function gFuncAt(x,y,z,func, arg){
  g.translate(x,y,z)
  func.call(g, arg)
  g.translate(-x,-y,-z)
}

var rotX = 45+90
var rotY = 45
function draw(){
  g.rotateX(rotX)
  g.rotateY(rotY)
  g.background(255)

  if(img.loaded) g.texture(img)
  gFuncAt(0,0,0,g.box,50)

  g.rotateY(-rotY)
  g.rotateX(-rotX)
  p.externals.context.drawImage(g.externals.canvas, 0, 0)
}