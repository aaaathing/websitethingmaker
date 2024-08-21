window.onbeforeunload=function(){return "save your stuff. if you saved then good"}

var container = document.getElementById("container");
var faceList = document.getElementById("faces")
var editFace = document.getElementById("editFace")
var result = document.getElementById("result")
var iconResult = document.getElementById("iconResult")
var iconScale = document.getElementById("iconScale")
var iconScaleText = document.getElementById("iconScaleText")

function preload(){
}

let c, g, size, northText, orientation
var shouldRender = true
function setup() {
  c = createCanvas(Math.round(innerWidth * 0.7), innerHeight)
  size = Math.min(width,height)
  noSmooth()
  g = createGraphics(width, height, WEBGL)
  g.angleMode(DEGREES)
  var s = size/100
  g.scale(s)
  g.noSmooth()

  northText = createGraphics(400,300);
  northText.fill(0);
  northText.textAlign(CENTER,CENTER);
  northText.textSize(50);
  northText.text('North', 200, 150);
  orientation = createGraphics(100,100)
  orientation.fill(0)
  orientation.textAlign(CENTER,CENTER)
  orientation.textSize(5)
  orientation.text("up",50,10)
}

//new p5(sketch, container);

var settings = {
  lines: true,
  text:true,
  selectFace:false
}

function impFaces(str){
  str = str.replace(/objectify\(([^)]*)\)/g, "[$1]")
  var arr = Object.constructor("return "+str)()

  var obj = {}
  obj.bottom = arr[0]
  obj.top = arr[1]
  obj.north = arr[2]
  obj.south = arr[3]
  obj.west = arr[5]
  obj.east = arr[4]
  faces = obj
  updateFaceLists()
  shouldRender = true
}
var faces = {/*
  bottom: [[0,  0,  0, 16, 16, 0, 0]],
  top: [[0, 16, 16, 16, 16, 0, 0]],
  north: [[16, 16, 16, 16, 16, 0, 0]],
  south: [[0, 16,  0, 16, 16, 0, 0]],
  east: [[16, 16,  0, 16, 16, 0, 0]],
  west: [[0, 16, 16, 16, 16, 0, 0]]//*/
/*
  bottom: [[0,  0,  0, 16, 16, 0, 0]],
  top: [[0, 8, 16, 16, 16, 0, 0]],
  north: [[16, 8, 16, 16, 8, 0, 0]],
  south: [[0, 8,  0, 16, 8, 0, 0]],
  east: [[16, 8,  0, 16, 8, 0, 0]],
  west: [[0, 8, 16, 16, 8, 0, 0]]//*/
//*
  bottom: [[0, 0,  0, 16, 16, 0, 0]],
  top: [[0, 8,  8, 16, 8, 0, 8],[0, 16,  16, 16, 8, 0, 0]],
  north: [[16, 16, 16, 16, 16, 0, 0]],
  south: [[0, 8,  0, 16, 8, 0, 0],[0, 16,  8, 16, 8, 0, 0]],
  east: [[16, 8, 0, 8, 8, 8, 0], [16, 16, 8, 8, 16, 0, 0]],
  west: [[0, 8, 8, 8, 8, 0, 0],[0, 16, 16, 8, 16, 8, 0]]//*/
}
impFaces(`[
				[objectify(6, 0, 6, 4, 4, 0, 1),objectify(10, 12, 7, 6, 2, 0, 2),objectify(10, 6, 7, 6, 2, 0, 2)], //bottom
				[objectify(6, 16, 10, 4, 4, 0, 1),objectify(10, 15, 9, 6, 2, 0, 2),objectify(10, 9, 9, 6, 2, 0, 2)], //top
				[objectify(10, 16, 10, 4, 16, 6, 0),objectify(16, 15, 9, 6, 3, 6, 0),objectify(16, 9, 9, 6, 3, 6, 0)], //north
				[objectify(6, 16, 6, 4, 16, 6, 0),objectify(10, 15, 7, 6, 3, 6, 0),objectify(10, 9, 7, 6, 3, 6, 0)], //south
				[objectify(10, 16, 6, 4, 16, 6, 0)], //east
				[objectify(6, 16, 10, 4, 16, 6, 0)]  //west
			]`)

function updateFaceList(n){
  var str=""
  faces[n].forEach((face, i) => {
    str+="<li id='"+n+"Face"+i+"' onmousemove='hoverFace(\""+n+"\","+i+")' onclick='selectFace(\""+n+"\","+i+",this)'>"
    str += "x:"+face[0]+" y:"+face[1]+" z:"+face[2]+" "
    str += face[3]+"&times;"+face[4]
    str+="</li>"
  })
  document.getElementById(n+"Faces").innerHTML = str
}
function updateFaceLists(){
  for(var i in faces){
    updateFaceList(i)
  }
}

var selectedFace = {
  dir: "",
  idx: 0,
  face:null,
  id:"",
  hoverDir: "",
  hoverIdx: 0
}
function hoverFace(dir, i){
  if(selectedFace.hoverDir !== dir || selectedFace.hoverIdx !== i){
    selectedFace.hoverDir = dir
    selectedFace.hoverIdx = i
    shouldRender = true
  }
}
faceList.onmouseleave = function(){
  selectedFace.hoverDir = ""
  shouldRender = true
}
editFace.style.display = "none"
function selectFace(dir, i, el){
  el = el || document.getElementById(dir+"Face"+i)
  selectedFace.id = el.id
  if(selectedFace.dir !== dir || selectedFace.idx !== i){
    selectedFace.dir = dir
    selectedFace.idx = i
    selectedFace.face = faces[dir][i]
    var s = document.querySelector("#faces .selected")
    if(s)s.classList.remove("selected")
    el.classList.add("selected")

    editFace.style.display = ""
    updateInputs()
    shouldRender = true
  }else{
    selectedFace.dir = ""
    el.classList.remove("selected")
    editFace.style.display = "none"
  }
}
function updateInputs(){
  document.getElementById("faceX").value = selectedFace.face[0]
  document.getElementById("faceY").value = selectedFace.face[1]
  document.getElementById("faceZ").value = selectedFace.face[2]
  document.getElementById("faceW").value = selectedFace.face[3]
  document.getElementById("faceH").value = selectedFace.face[4]
  document.getElementById("texX").value = selectedFace.face[5]
  document.getElementById("texY").value = selectedFace.face[6]
  document.getElementById("tex").value = selectedFace.face[12] || ""
}
function unselectFace(dir,i){
  selectedFace.dir = ""
  document.getElementById(dir+"Face"+i).classList.remove("selected")
  editFace.style.display = "none"
}

function newFace(){
  var dir = document.getElementById("newFaceDir").value
  faces[dir].push([
    0,0,0,10,10,0,0
  ])
  updateFaceLists()
  selectFace(dir, faces[dir].length-1)
  shouldRender = true
}
function editTheFace(i, value, text){
  selectedFace.face[i] = text ? value : parseFloat(value)
  updateFaceLists()
  document.getElementById(selectedFace.id).classList.add("selected")
  shouldRender = true
}
function deleteFace(){
  var dir = selectedFace.dir
  unselectFace(dir, selectedFace.idx)
  faces[dir].splice(selectedFace.idx, 1)
  updateFaceLists()
  shouldRender = true
}
function duplicateFace(){
  var dir = selectedFace.dir
  faces[dir].push([...selectedFace.face])
  updateFaceLists()
  selectFace(dir, faces[dir].length-1)
  shouldRender = true
}
function clearFaces(){
  if(selectedFace.dir)unselectFace(selectedFace.dir, selectedFace.idx)
  for(var i in faces){
    var arr = faces[i]
    arr.splice(0, arr.length)
  }
  updateFaceLists()
  shouldRender = true
}
function keyPressed(){
  if(!selectedFace.dir || document.activeElement.tagName.toLowerCase() === "input") return
  if(keyCode === LEFT_ARROW) editTheFace(0,selectedFace.face[0]+1)
  else if(keyCode === RIGHT_ARROW) editTheFace(0,selectedFace.face[0]-1)
  else if(keyCode === UP_ARROW) editTheFace(2,selectedFace.face[2]+1)
  else if(keyCode === DOWN_ARROW) editTheFace(2,selectedFace.face[2]-1)
  else if(keyCode === SHIFT) editTheFace(1,selectedFace.face[1]-1)
  else if(key === " ") editTheFace(1,selectedFace.face[1]+1)
  else return
  updateInputs()
}
function getShape(){
  var str="[\n"
  function getFaces(dir){
    var str2 = "["
    faces[dir].forEach(v => {
      str2 += "objectify("
      for(let j of v){
        if(typeof j === "string") str2 += '"'+j+'"'
        else if(typeof j === "undefined") str2 += "null"
        else str2 += j
        str2 += ","
      }
      str2 = str2.substring(0,str2.length-1)+"),"
    })
    if(faces[dir].length)str2 = str2.substring(0,str2.length-1)//remove trailing comma
    str2 += "],"
    str += "\t"+str2+"\n"
  }
  getFaces("bottom")
  getFaces("top")
  getFaces("north")
  getFaces("south")
  getFaces("east")
  getFaces("west")
  str = str.substring(0,str.length-2)//remove trailing comma and line break
  str += "\n" //readd line break
  str += "]"
  result.value = str
}
iconScale.oninput = function(){
  iconScaleText.innerHTML = this.value
}
function getIcon(){
  background(255)
  translate(width/2,height/2)
  scale(size/10)
  strokeWeight(1/(size/10))
  stroke(0)
  fill(127)
  rect(-1,-1,2,2)
  var ip = isometricProject
  var str = "[\n"
  var s = parseFloat(iconScale.value)
  function getFaces(dir){
    var str2 = ""
    var pos, fp
    faces[dir].forEach(v => {
      var x=(v[0]/16)*s, y=(v[1]/16-1)*s, z=(v[2]/16)*s, w=(v[3]/16)*s, h=(v[4]/16)*s, tx = v[5]/16, ty = v[6]/16, tw = (v[10] || v[3])/16, th = (v[11] || v[4])/16
      beginShape()
      if(dir === "top"){
        fill(255,255,0)
        str2 += (fp = pos = ip(x,y,z)).join(",")+","
        str2 += `${tx+tw},${ty},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x+w,y,z)).join(",")+","
        str2 += `${tx},${ty},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x+w,y,z-h)).join(",")+","
        str2 += `${tx},${ty+th},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x,y,z-h)).join(",")+","
        str2 += `${tx+tw},${ty+th},1, `
        vertex(pos[0],-pos[1])
      }else if(dir === "south"){
        fill(255,127,0)
        str2 += (fp = pos = ip(x,y,z)).join(",")+","
        str2 += `${tx+tw},${ty},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x+w,y,z)).join(",")+","
        str2 += `${tx},${ty},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x+w,y-h,z)).join(",")+","
        str2 += `${tx},${ty+th},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x,y-h,z)).join(",")+","
        str2 += `${tx+tw},${ty+th},1, `
        vertex(pos[0],-pos[1])
      }else{
        fill(255,0,0)
        str2 += (fp = pos = ip(x,y,z)).join(",")+","
        str2 += `${tx+tw},${ty},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x,y,z-w)).join(",")+","
        str2 += `${tx},${ty},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x,y-h,z-w)).join(",")+","
        str2 += `${tx},${ty+th},1, `
        vertex(pos[0],-pos[1])
        str2 += (pos = ip(x,y-h,z)).join(",")+","
        str2 += `${tx+tw},${ty+th},1, `
        vertex(pos[0],-pos[1])
      }
        vertex(fp[0],-fp[1])
      endShape()
    })
    str += "\t"+str2+"\n"
  }
  getFaces("top")
  getFaces("south")
  getFaces("west")
  str = str.substring(0,str.length-2)+"\n"//remove trailing comma
  str += "]"
  iconResult.value = str
  scale(1/(size/10))
  translate(-width/2,-height/2)
}

function fillIfSelected(dir, i){
  if(selectedFace.hoverDir === dir && selectedFace.hoverIdx === i){g.fill(140,140,255)}else if(selectedFace.dir === dir && selectedFace.idx === i){g.fill(255,0,0)}else g.fill(240)
}
function drawFaces(){
  g.strokeWeight(1)
  g.stroke(0)
  var i, face
  g.translate(-8,8,-8)
  for(i=0; i<faces.bottom.length; i++){
    face = faces.bottom[i]
    fillIfSelected("bottom",i)
    g.translate(face[0], -face[1], face[2])
    g.rotateX(90)
    g.rect(0,0, face[3],face[4])
    g.rotateX(-90)
    g.translate(-face[0], face[1], -face[2])
  }
  for(i=0; i<faces.top.length; i++){
    face = faces.top[i]
    fillIfSelected("top",i)
    g.translate(face[0], -face[1], face[2])
    g.rotateX(-90)
    g.rect(0,0, face[3],face[4])
    g.rotateX(90)
    g.translate(-face[0], face[1], -face[2])
  }
  for(i=0; i<faces.north.length; i++){
    face = faces.north[i]
    fillIfSelected("north",i)
    g.translate(face[0], -face[1], face[2])
    g.rotateY(180)
    g.rect(0,0, face[3],face[4])
    g.rotateY(-180)
    g.translate(-face[0], face[1], -face[2])
  }
  for(i=0; i<faces.south.length; i++){
    face = faces.south[i]
    fillIfSelected("south",i)
    g.translate(face[0], -face[1], face[2])
    g.rect(0,0, face[3],face[4])
    g.translate(-face[0], face[1], -face[2])
  }
  for(i=0; i<faces.east.length; i++){
    face = faces.east[i]
    fillIfSelected("east",i)
    g.translate(face[0], -face[1], face[2])
    g.rotateY(-90)
    g.rect(0,0, face[3],face[4])
    g.rotateY(90)
    g.translate(-face[0], face[1], -face[2])
  }
  for(i=0; i<faces.west.length; i++){
    face = faces.west[i]
    fillIfSelected("west",i)
    g.translate(face[0], -face[1], face[2])
    g.rotateY(90)
    g.rect(0,0, face[3],face[4])
    g.rotateY(-90)
    g.translate(-face[0], face[1], -face[2])
  }
  g.translate(8,-8,8)
}
function mouseDragged(){
  if(document.activeElement.tagName.toLowerCase() === "input") return
  rotY += mouseX - pmouseX
  rotX -= mouseY - pmouseY

  if(rotY > 360) rotY -= 360
  if(rotY < 0) rotY += 360
  if(rotX > 90) rotX = 90
  if(rotX < -90) rotX = -90

  shouldRender = true
}

var colorId
var faceObj = {}
function faceColorId(side, i){
  colorId ++
  g.fill(colorId)
  faceObj[colorId] = {side:side,i:i}
}
function mouseClicked(){
  if(settings.selectFace){
    //render all faces with color id (id represented in color)
    colorId = -1
    for(var f in faceObj) delete faceObj[f]
    var i, face
    g.clear()
    g.background(255,255,255)
    g.strokeWeight(0)
    g.rotateX(rotX)
    g.rotateY(rotY)
    g.translate(-8,8,-8)
    for(i=0; i<faces.bottom.length; i++){
      face = faces.bottom[i]
      faceColorId("bottom",i)
      g.translate(face[0], -face[1], face[2])
      g.rotateX(90)
      g.rect(0,0, face[3],face[4])
      g.rotateX(-90)
      g.translate(-face[0], face[1], -face[2])
    }
    for(i=0; i<faces.top.length; i++){
      face = faces.top[i]
      faceColorId("top",i)
      g.translate(face[0], -face[1], face[2])
      g.rotateX(-90)
      g.rect(0,0, face[3],face[4])
      g.rotateX(90)
      g.translate(-face[0], face[1], -face[2])
    }
    for(i=0; i<faces.north.length; i++){
      face = faces.north[i]
      faceColorId("north",i)
      g.translate(face[0], -face[1], face[2])
      g.rotateY(180)
      g.rect(0,0, face[3],face[4])
      g.rotateY(-180)
      g.translate(-face[0], face[1], -face[2])
    }
    for(i=0; i<faces.south.length; i++){
      face = faces.south[i]
      faceColorId("south",i)
      g.translate(face[0], -face[1], face[2])
      g.rect(0,0, face[3],face[4])
      g.translate(-face[0], face[1], -face[2])
    }
    for(i=0; i<faces.east.length; i++){
      face = faces.east[i]
      faceColorId("east",i)
      g.translate(face[0], -face[1], face[2])
      g.rotateY(-90)
      g.rect(0,0, face[3],face[4])
      g.rotateY(90)
      g.translate(-face[0], face[1], -face[2])
    }
    for(i=0; i<faces.west.length; i++){
      face = faces.west[i]
      faceColorId("west",i)
      g.translate(face[0], -face[1], face[2])
      g.rotateY(90)
      g.rect(0,0, face[3],face[4])
      g.rotateY(-90)
      g.translate(-face[0], face[1], -face[2])
    }
    g.translate(8,-8,8)
    g.rotateY(-rotY)
    g.rotateX(-rotX)
    if(colorId >= 255) { //the background is white so 255 won't work
      alert("You need 255 or less faces to select faces")
      return
    }
    var pix = g.get(mouseX,g.height-mouseY)
    var faceId = faceObj[pix[0]]
    if(!faceId) return
    selectFace(faceId.side,faceId.i)
  }
}

var rotX = -45
var rotY = 45
function draw(){
  if(!shouldRender) return
  shouldRender = false

  g.clear()
  g.background(255)
  g.rotateX(rotX)
  g.rotateY(rotY)

  if(settings.lines){
    g.noFill()
    g.stroke(255,0,0)
    g.strokeWeight(1)
    g.line(0,0,-50,0,0,50)
    g.line(0,-50,0,0,50,0)
    g.line(-50,0,0,50,0,0)
    g.stroke(0,0,255)
    g.box(16)
  }
  
  g.strokeWeight(4)
  drawFaces()

  if(settings.text){
    g.fill(0,0,0)
    g.noStroke()
    g.translate(0,0,50)
    g.rotateX(90)
    g.rotateZ(180)
    g.image(northText,-200,-150)
    g.rotateZ(-180)
    g.rotateX(-90)
    g.translate(0,0,-50)
  }

  g.rotateY(-rotY)
  g.rotateX(-rotX)
  //p.externals.context.drawImage(g.externals.canvas, 0, 0)
  image(g,0,0)
}

/*
//isometric porjection below is from https://stackoverflow.com/a/44850035
//it's also trimmed down by me
const P3 = (x = 0, y = 0, z = 0) => ({x,y,z});
const P2 = (x = 0, y = 0) => ({ x, y});
const D2R = (ang) => (ang-90) * (Math.PI/180 );
const Ang2Vec = (ang,len = 1) => P2(Math.cos(D2R(ang)) * len,Math.sin(D2R(ang)) * len);
const isometric = {
  xAxis : Ang2Vec(120) ,
  yAxis : Ang2Vec(-120) ,
  zAxis : Ang2Vec(0) ,
}

const axoProjMat = {
  xAxis : P2(1 , 0.5) ,
  yAxis :  P2(-1 , 0.5) ,
  zAxis :  P2(0 , -1) ,
  depth :  P3(0.5,0.5,1) , // projections have z as depth
  origin : P2(0,0), // (0,0) default 2D point
  setProjection(p){
    Object.keys(p).forEach(key => {
      this[key]=p[key];
    })
    if(!p.depth){
      this.depth = P3(
        this.xAxis.y,
        this.yAxis.y,
        -this.zAxis.y
      );
    }
  },
  project (p, retP = P3()) {
    p.x -= 8
    p.y -= 8
    p.z -= 8
    p.x /= 8
    p.y /= 8
    p.z /= 8
    retP.x = p.x * this.xAxis.x + p.y * this.yAxis.x + p.z * this.zAxis.x + this.origin.x;
    retP.y = p.x * this.xAxis.y + p.y * this.yAxis.y + p.z * this.zAxis.y + this.origin.y;
    retP.z = p.x * this.depth.x + p.y * this.depth.y + p.z * this.depth.z; 
    return [retP.x,retP.y,retP.z];
  }
}
axoProjMat.setProjection(isometric);*/

let side = Math.sqrt(3) / 2
function isometricProject(x,y,z){
  return [(x+-z)*side,(x+z)/2+y]
}