// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 3, 2020
var sz = 30;
var speed=0;

draw = function() {
    background(242, 242, 242);
    rect(200-sz/2,sz/2+100,sz,200-sz);
    
    
    if(sz>10){
        speed-=0.5;
    }else{
        speed+=0.5;
    }
    sz+=speed;
};

mouseDragged = function() { 
    sz=(mouseX);
    speed=0;
};