// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Mar 1, 2021
var externals;
var ctx = externals.context;
var canvas = externals.canvas;
function RotatedImage(img,x,y,w,h,r,rotateCenterX,rotateCenterY){
  ctx.save();
  if(rotateCenterX && rotateCenterY){ctx.translate(rotateCenterX,rotateCenterY);}
  ctx.rotate(r / 360 * Math.PI);
  image(img,x,y,w,h);
  ctx.restore();
}
function mod(n, l){
  var t = n/l;
  var a = t-Math.floor(t);
  var r = a*l;
  return r;
}


draw = function(){
  background(0);
  RotatedImage(getImage("avatars/avatar-team"), -width/2,-width/2,undefined,undefined,mod(frameCount,720),width/2,height/2);
  _clearLogs();
  println(mod(frameCount,720));
};