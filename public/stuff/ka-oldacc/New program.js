// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Sep 6, 2020
var level1 = new Array(
    "ll-l------------",
    "--l-------------",
    "lll-llllllllllll"
    );
var player={
x:0,
y:0,
touchinglevel:false
};    
var column;
var drawlevel=function(){
player.touchinglevel=false;
for(var i=0; i<3;i++){
column=level1[i];
for(var i2=0; i2<16;i2++){
if(column[i2]==="l"){
    fill(0, 255, 51);
    rect(i2*25, i*25,25,25);
    if(player.x>(i2*25)-17&&player.x<(i2*25)+17&&player.y>(i*25)-17&&player.y<(i*25)+17){
    player.touchinglevel=true;}

    
}
if(column[i2]==="-"){
    new fill(0, 21, 255);
    rect(i2*25, i*25,25,25);
}

}
}
};
var calculateplyr=function(){

};

draw= function() {
    background(0, 0, 0);
    drawlevel();
    fill(255, 0, 0);
    rect(player.x,player.y,10,10);
};




