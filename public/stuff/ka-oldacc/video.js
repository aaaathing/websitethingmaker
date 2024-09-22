// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 20, 2020
var video=[
    [
    "","",
    "               0000000000",
    "               0000000000",
    "               0oooooooo0",
    "               oooooooooo",
    "               oo ioov oo",
    "               oooo--oooo",
    "               ooo0oo0ooo",
    "               ooo0000ooo",
    "               oooooooooo"
    ],[
    "","","",
    "               0000000000",
    "               0000000000",
    "               0oooooooo0",
    "               oooooooooo",
    "               oo ioov oo",
    "               oooo--oooo",
    "               ooo0oo0ooo",
    "               ooo0000ooo",
    "               oooooooooo"
    ],[
    "","","",
    "               0000000000",
    "               0000000000",
    "               0oooooooo0",
    "               oooooooooo",
    "               oo ioov oo",
    "               oooo--oooo",
    "               oooooo0ooo",
    "               ooo0000ooo",
    "               oooooooooo"
    ],[
    "","","",
    "               0000000000     0000000000",
    "               0000000000     0000000000",
    "               0oooooooo0     0oooooooo0",
    "               oooooooooo     oooooooooo",
    "               oo ioov oo     oo ioov oo",
    "               oooo--oooo     oooo--oooo",
    "               oooooo0ooo     ooo0oo0ooo",
    "               ooo0000ooo     ooo0000ooo",
    "               oooooooooo     oooooooooo"
    ],[
    "","","",
    "0000000000     0000000000     0000000000",
    "0000000000     0000000000     0000000000",
    "0oooooooo0     0oooooooo0     0oooooooo0",
    "oooooooooo     oooooooooo     oooooooooo",
    "oo ioov oo     oo ioov oo     oo ioov oo",
    "oooo--oooo     oooo--oooo     oooo--oooo",
    "ooo0oo0ooo     oooooo0ooo     ooo0oo0ooo",
    "ooo0000ooo     ooo0000ooo     ooo0000ooo",
    "oooooooooo     oooooooooo     oooooooooo"
    ],[
    "","","",
    "0000000000     0000000000     0000000000",
    "0000000000     0000000000     0000000000",
    "0oooooooo0     0oooooooo0     0oooooooo0",
    "oooooooooo     oooooooooo     oooooooooo",
    "oo ioov oo     oo ioov oo     oo ioov oo",
    "oooo--oooo     oooo--oooo     oooo--oooo",
    "ooo0oo0ooo     oooooo0ooo     ooo0oo0ooo",
    "ooo0000ooo     ooo0000ooo     ooo0000ooo",
    "oooooooooo     oooooooooo     oooooooooo",
    "",
    "0   0   0 000000 000000 0",
    "0   0   0 0    0 0    0 0",
    "00 000 00 0    0 0    0 0",
    " 000 000  0    0 0    0 0",
    "  0   0   0    0 0    0  ",
    "  0   0   000000 000000 0"
    ],[
    "0000000000000",
    "00000 00 0  0"
    ]
];


var getcol=function(col){
if(col==="r"){
    return color(255, 0, 0);
}
if(col==="o"){
    return color(255, 183, 0);
}
if(col==="y"){
    return color(255, 255, 0);
}
if(col==="g"){
    return color(0, 255, 0);
}
if(col==="b"){
    return color(0, 0, 255);
}
if(col==="i"){
    return color(183, 0, 255);
}
if(col==="v"){
    return color(234, 0, 255);
}
if(col==="m"){
    return color(255, 0, 196);
}
if(col==="w"){
    return color(255, 255, 255);
}
if(col==="-"){
    return color(212, 113, 0);
}
if(col==="0"){
    return color(0, 0, 0);
}
if(col==="1"){
    return color(50, 50, 50);
}
if(col==="2"){
    return color(100,100,100);
}
if(col==="3"){
    return color(150, 150, 150);
}
if(col==="4"){
    return color(200, 200, 200);
}
if(col==="5"){
    return color(255, 255, 255);
}
};
var render=function(what,size){
noStroke();
var i,i2;
for(i=0;i<what.length;i++){
    var row=what[i];
    for(i2=0;i2<row.length;i2++){
        fill(getcol(row[i2]));
        rect(i2*size,i*size,size,size);
    }
}
};

frameRate(1);

var frame=-1;
draw = function() {
    frame++;
    if(frame>video.length-1){
        frame=video.length-1;
    }
    background(255, 255, 255);
    render(video[frame],10);
};
