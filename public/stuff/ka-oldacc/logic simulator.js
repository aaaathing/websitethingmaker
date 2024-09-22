// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Sep 22, 2020
//variables
var logic=null;
var allwires=[100,100,210,200];

//draw the logic gates
strokeWeight(3);
var not=function(inp,x,y){
if(inp===1){logic=0;}else{logic=1;}
fill(166, 220, 240);
line(x-40,y,x+40,y);
triangle(x-20,y+20,x-20,y-20,x+20,y);
ellipse(x+22,y,10,10);
fill(0, 0, 0);
text("not",x-15,y+3);
};
var and=function(in1,in2,x,y){
if (in1===1&&in2===1){logic=1;}else{logic=0;}
fill(166, 220, 240);
line(x-40,y-10,x-20,y-10);
line(x-40,y+10,x-20,y+10);
line(x-20,y,x+30,y);
rect(x-27,y-20,20,40);
arc(x-10,y,40,40,-90,90);
fill(0, 0, 0);
text("and",x-20,y+4);
};

//draw wires
var wire=function(x1,y1,x2,y2){
line(x1,y1,x1,y2);
line(x1,y2,x2,y2);
};
var drawwires=function(){
for(var i=1;i<(allwires.length/4)+1;i++){
    wire(allwires[(i*4)-4],allwires[(i*4)-3],allwires[(i*4)-2],allwires[(i*4)-1]);


}
};
//placing a wire



//test things
and(1,1,110,110);
not(0,200,200);
drawwires();

