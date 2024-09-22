// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 9, 2020
/**
Hi, this is a pointer locker.
click the canvas to lock you mouse pointer. To exit, click Esc.
*/
var doc;
(function(){var d="document";doc=this[d];}());
var canvas=doc.getElementsByTagName("canvas")[0];
canvas.requestPointerLock=canvas.requestPointerLock||canvas.mozRequestPointerLock;

var locked=false;
var x,y=0;

canvas.onclick=function(){
    canvas.requestPointerLock();
    canvas.requestFullscreen();
};

doc.addEventListener("pointerlockchange",function(){
if(doc.pointerLockElement===canvas||doc.mozPointerLockElement===canvas){
    locked=true;
}else{
    locked=false;
}
});

doc.addEventListener("mousemove",function(e){
if(locked){
    x+=e.movementX;
    y+=e.movementY;
    if(x>canvas.width){x=canvas.width;}
    if(y>canvas.height){y=canvas.height;}
    if(x<0){x=0;}
    if(y<0){y=0;}
}else{
    x=e.clientX;
    y=e.clientY;
}
},false);

var pointImg=createGraphics(20,20,P2D);
pointImg.background(255, 255, 255);
pointImg.beginShape();
pointImg.vertex(0,0);
pointImg.vertex(10,10);
pointImg.vertex(5,10);
pointImg.vertex(8,15);
pointImg.vertex(4,15);
pointImg.vertex(2,10);
pointImg.vertex(0,11);
pointImg.vertex(0,0);
pointImg.endShape(); 



draw= function() {
    if(!mouseIsPressed){
        background(255, 255, 255);
    }
    fill(255, 0, 0);
    image(pointImg,x,y);
};
