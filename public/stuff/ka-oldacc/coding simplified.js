// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 10, 2020
var x=0;var y=0;var deg=0;

function pointin(d){
    deg=d;
}
function rotate(d){
    deg+=d;
    if(deg>360){
        deg-=360;
    }
    if(deg<0){
        deg+=360;
    }
}
function movesteps(s){
    x+=(cos(deg))*s;
    y+=(sin(deg))*s;
}
function goto(xp,yp){
    x=xp;
    y=yp;
}
function displaycords(){
    noStroke();
    fill(0, 0, 0);
    rect(310,330,400,400);
    
    fill(255, 255, 255);
    text("x: "+round(x),320,350);
    text("y: "+round(y),320,370);
    text("degrees: "+deg,320,390);
}

draw= function() {
rotate(7);
goto(200,200);
movesteps(200);

strokeWeight(30);
stroke(x,deg,y);
line(200,200,x,y);

displaycords();
};
