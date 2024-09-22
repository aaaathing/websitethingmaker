// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 17, 2020
var g=createGraphics(width, height, P3D);
var cube = function(x,y,z){
  g.pushMatrix();
  g.translate(x, y, z);
  g.box(100);
  g.popMatrix();
};
var cubes=[
  [1,2,0],
  [2,2,0],
  [3,2,0]
];
var player={
    x:200,
    y:200,
    z:400,
    rotx:0,
    roty:0
};
var keys={};

mouseMoved=function(){
  player.roty=mouseX*2;
  player.rotx=mouseY*2;
};
keyPressed=function(){
  keys[keyCode]=true;
};
keyReleased=function(){
  keys[keyCode]=false;
};

draw=function(){
  var sinX=sin(player.rotx);
  var cosX=cos(player.rotx);
  var sinY=sin(player.roty);
  var cosY=cos(player.roty);

  g.background(255, 255, 255);
  g.fill(255, 0, 0);
  
  //this doesn't really work...
  if(keys[87]){player.x-=sinY*10;player.z-=cosY*10;}
  if(keys[83]){player.x+=sinY*10;player.z+=cosY*10;}
  
  
  g.camera(player.x, player.y, player.z, /**/player.x - player.roty, player.y - player.rotx, -100,/**/ 0.0, 1.0, 0.0);
  
  for(var i=0; i<cubes.length; i++){
    cube(cubes[i][0]*100, cubes[i][1]*100, cubes[i][2]*100);
  }
  
  image(g,0,0);
};