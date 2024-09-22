// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 17, 2020
// it was not finished
var player={
x:0,
y:0,
scrollx:0,
scrolly:0,
level:0
};
var levels=[
  [
    [0,0,200,50],[400,100,200,200],[0,250,400,350]
  ]
];
var keys=keys||{};

keyPressed=function(e){
  keys[keyCode] = true;  
};
keyReleased=function(e){
  keys[keyCode] = false;
};

rectMode(CENTER);

draw = function() {
    if(keys[39]){player.x++;}
    if(keys[37]){player.x--;}
    if(keys[40]){player.y++;}
    if(keys[38]){player.y--;}
    player.scrollx=player.x-200;
    player.scrolly=player.y-200;
    
    background(0, 0, 0);
    
    strokeWeight(1);
    fill(255, 255, 255);
    rect(player.x-player.scrollx,  player.y-player.scrolly,  20, 20);
    text(keyCode,100,200);
    
    
    strokeWeight(5);
    stroke(255, 255, 255);
    for(var i=0;i<levels[player.level].length;i++){
        var linen=levels[player.level][i];
        var x1=linen[0], y1=linen[1], x2=linen[2], y2=linen[3];
        var sx=player.scrollx, sy=player.scrolly;
        line(x1-sx,  y1-sy,  x2-sx,  y2-sy);
    }
};