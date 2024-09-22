// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Sep 4, 2020
var scrollx=0;
var scrollY=0;
var go=function(x,y){
image(getImage("creatures/OhNoes"),-15+x,120+y);
noStroke();

fill(222, 222, 222);
rect(121+x,967+y,264,144,20);


fill(222, 222, 222);
rect(129+x,104+y,260,140,20);
triangle(129+x,194+y,114+x,184+y,129+x,174+y);


fill(181, 181, 181);
rect(127+x,102+y,260,140,20);
triangle(127+x,192+y,112+x,182+y,127+x,172+y);


fill(112, 112, 112);
rect(125+x,100+y,260,140,20);
triangle(125+x,190+y,110+x,180+y,125+x,170+y);


fill(250, 250, 250);
rect(123+x,98+y,260,140,20);
triangle(123+x,188+y,108+x,178+y,123+x,168+y);


fill(0, 0, 0);
textSize(15);
text("Oh noes!",150+x,130+y);

textSize(12);
text("scrollX is not defined. Maybe you meant",150+x,150+y);
text("to type scrollx.",150+x,170+y);
fill(0, 0, 255);
textSize(14);

text("Show me where",150+x,220+y);
stroke(0, 0, 255);

strokeWeight(2);
line(150+x,222+y,250+x,222+y);
};


draw= function() {
 

if(scrollY<200){
    background(255, 255, 255);
    go(0,0);
    scrollY++;
}else if(scrollY<400){
    go(random(-200,200),random(-200,200));
    scrollY++;
}else if(scrollY<401){
    background(255, 255, 255);
    scrollY++;
}
else if(scrollY<600){
    scrollY++;
    scrollx++;
    if(scrollx>410){
        scrollx=-400;
    }
    
    go(scrollx,0);
}else{
    fill(0, 0, 0);
    text("don't edit the text!!! Oh noes won't be happy.",10,300);{
    
    throw{
        message:"\"I\" got stretched!!!"
    };}
}

   
};


