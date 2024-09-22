// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Mar 11, 2021
var level = [
  {
    x:-50,
    y:-20,
    z:0,
    w:100,
    h:20,
    l:100,
    color:color(240)
  },
  {
    x:50,
    y:-20,
    z:0,
    w:100,
    h:20,
    l:100,
    color:color(240)
  }
];
var cam = {
  x:0,
  y:0,
  z:0,
  rotX:0,
  rotY:0
};
var player = {
  xVel:0,
  yVel:0,
  zVel:0
};

var keys = {};
var keyCodes = {};
keyPressed = function(){
    keys[key] = true;
    keyCodes[keyCode] = true;
};
keyReleased = function(){
    keys[key] = false;
    keyCodes[keyCode] = false;
};

var g = createGraphics(width, height, P3D);
g.angleMode = "degrees";
angleMode = "degrees";
g.translate(width/2, height/2);
var externals;
var sinX = sin(cam.rotX), cosX = cos(cam.rotX), sinY = sin(cam.rotY), cosY = cos(cam.rotY);
function calcTrigVals(){
  sinX = sin(cam.rotX);
  cosX = cos(cam.rotX);
  sinY = sin(cam.rotY);
  cosY = cos(cam.rotY);
}
function renderBlocks(){
  g.stroke(0);
  g.strokeWeight(1);
  for(var i=0; i<level.length; i++){
    var plat = level[i];
    g.pushMatrix();
    g.fill(plat.color);
    g.translate(plat.x, plat.y, plat.z);
    g.scale(plat.w, plat.h, plat.l);
    g.box(1);
    g.popMatrix();
  }
}
function render(){
  g.background(255);
  g.camera(cam.x, cam.y, cam.z, cam.x+sinY, cam.y+sinX, cam.z+cosY+cosX, 0, 1, 0);
  renderBlocks();
}
function controls(){
  if(keys.w){
    cam.z -= sinY;
    cam.x -= cosY;
  }
  if(keys.s){
    cam.z += sinY;
    cam.x += cosY;
  }
  if(keyCodes[LEFT]){
    cam.rotY++;
  }
  if(keyCodes[RIGHT]){
    cam.rotY--;
  }
  if(keyCodes[UP]){
    cam.rotX--;
  }
  if(keyCodes[DOWN]){
    cam.rotX++;
  }
}

draw = function(){
  background(100);
  controls();
  calcTrigVals();
  render();
  externals.context.drawImage(g.externals.canvas, 0, 0);
};