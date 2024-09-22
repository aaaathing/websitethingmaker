// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Jan 8, 2021
var
sizeVel=0,
targetSize=100,
MySize=0,
stretchy=0.9,
speedAndSize=4;
draw=function(){
    sizeVel+= (targetSize - MySize / speedAndSize);
    
    sizeVel*=stretchy;
    
    MySize+=sizeVel;
    
    background(255, 255, 255);
    fill(51, 0, 255);
    ellipse(200,200,MySize,MySize);
    
};