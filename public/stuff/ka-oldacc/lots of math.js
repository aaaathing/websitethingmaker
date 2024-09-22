// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 9, 2020
var mathtype="round";
/*Types of math functions for this variable: 
trig, mod, round


*/
var x=0;
var y=0;
var xsin=0;
var ycos=0;

var deg=0;
rectMode(CENTER);

function roundby(n,by){
    return round(n/by)*by;
}

function trig(d) {
    
    
    x=(sin(d)*50)+200;
    y=(cos(d)*50)+200;
    xsin=sin(d);
    ycos=cos(d);
    
    
    fill(255, 255, 255,0);
    
    ellipse(200,200,100,100);
    ellipse(x,y,10,10);
    line(x,y,x,20);
    line(x,y,20,y);
    line(200,200,x,y);
    
    fill(0, 0, 0);
    text("sin("+d+") = "+xsin,x,20);
    text("cos("+d+") = "+ycos,20,y);
}

function mod(a,b){
    return floor(((a/b)-floor(a/b))*b);
}

draw= function() {
    background(255, 255, 255);
    
    deg+=1;
    if(deg>359){
        deg=0;
    }
    if(mathtype==="trig"){
        text(deg,180,200);
        trig(deg);
    }if(mathtype==="mod"){
        text("13 mod 10",200,180);
        text(mod(13,10),200,200);
    }if(mathtype==="round"){
        text("Round 10 by 3",200,180);
        text(roundby(10,3),200,200);
    }
};