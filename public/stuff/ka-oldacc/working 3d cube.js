// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 10, 2020
var graphic=createGraphics(width,height,P3D);
graphic.translate(width/2,height/2,0);
graphic.angleMode="degrees";

function face(){
    graphic.beginShape();
    graphic.vertex(-100, -100, 0, 0,   0);
    graphic.vertex( 100, -100, 0, 400, 0);
    graphic.vertex( 100,  100, 0, 400, 400);
    graphic.vertex(-100,  100, 0, 0,   400);
    graphic.endShape(CLOSE);
}
function cube(){
    graphic.beginShape();
    graphic.vertex(-100, -100, 100, 0,   0);
    graphic.vertex( 100, -100, 100, 400, 0);
    graphic.vertex( 100,  100, 100, 400, 400);
    graphic.vertex(-100,  100, 100, 0,   400);
    graphic.endShape(CLOSE);
    
    graphic.beginShape();
    graphic.vertex(-100, -100, -100, 0,   0);
    graphic.vertex( 100, -100, -100, 400, 0);
    graphic.vertex( 100,  100, -100, 400, 400);
    graphic.vertex(-100,  100, -100, 0,   400);
    graphic.endShape(CLOSE);
    
    graphic.beginShape();
    graphic.vertex(-100, -100, 100, 0,   0);
    graphic.vertex(-100, -100, -100, 0,   0);
    graphic.vertex(-100, 100, -100, 0,   0);
    graphic.vertex(-100, 100, 100, 0,   0);
    graphic.endShape(CLOSE);
    
    graphic.beginShape();
    graphic.vertex(100, -100, 100, 0,   0);
    graphic.vertex(100, -100, -100, 0,   0);
    graphic.vertex(100, 100, -100, 0,   0);
    graphic.vertex(100, 100, 100, 0,   0);
    graphic.endShape(CLOSE);
    
    graphic.beginShape();
    graphic.vertex(-100,  100, 100, 0,   0);
    graphic.vertex(-100,  100, -100, 0,   0);
    graphic.vertex(100, 100, -100, 0,   0);
    graphic.vertex(100, 100, 100, 0,   0);
    graphic.endShape(CLOSE);
    
    graphic.beginShape();
    graphic.vertex(-100,  -100, 100, 0,   0);
    graphic.vertex(-100,  -100, -100, 0,   0);
    graphic.vertex(100, -100, -100, 0,   0);
    graphic.vertex(100, -100, 100, 0,   0);
    graphic.endShape(CLOSE);
}

//mouse
{
var rx=0;
var ry=0;
var doc,win;
(function(){var d="document";doc=this[d];win=this;}());
var canvas=doc.getElementsByTagName("canvas")[0];
canvas.onclick=function(){canvas.requestPointerLock();};
doc.addEventListener("mousemove",function(e){
  ry+=e.movementX/2;
  rx-=e.movementY/2;
});
}



doc.body.style.height="500px";

draw = function(){
    _clearLogs();
    println(rx+"   "+ry);
    
    graphic.background(232, 232, 232);
    
    
    graphic.fill(0, 255, 38);
    
    graphic.rotateX(rx);
    graphic.rotateY(ry);
    rx=0;ry=0;
    
    cube();
    
    
    background(255, 255, 255);
    image(graphic,0,0);
};
