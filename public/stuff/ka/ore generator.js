// Aug 1, 2023
//jshint esnext: true

/*
How it works:
First it generates random segments
Them it uses metaballs to connect them
*/
//This can be used to generate ores, and other things like azalea trees and amethyst geodes

//Change these:
const oreSegments = 4;//how many segments are there
const oreWeirdness = 1;//makes ore more interesting
const oreSize = 7;//borders of ore
const oreSegmentSize = 1.5;//size of each segment
//Don't change below

translate(200,200);
scale(400/40);
let balls=[],bx=0,by=0,bz=0;
let dx=Math.random()*2-1,dy=Math.random()*2-1,dz=Math.random()*2-1;
for(let i=0;i<oreSegments;i++){
    let d=Math.hypot(dx,dy,dz);
    dx /= d;
    dy /= d;
    dz /= d;
    balls.push(bx,by,bz);
    bx += dx*oreWeirdness;
    by += dy*oreWeirdness;
    bz += dz*oreWeirdness;
    if(bx>oreSize){
        bx = -oreSize;
    }
    if(bx<-oreSize){
        bx = oreSize;
    }
    if(by>oreSize){
        by = -oreSize;
    }
    if(by<-oreSize){
        by = oreSize;
    }
    if(bz>oreSize){
        bz = -oreSize;
    }
    if(bz<-oreSize){
        bz = oreSize;
    }
    dx=Math.random()*2-1;
    dy=Math.random()*2-1;
    dz=Math.random()*2-1;
}
noStroke();
background(255);
fill(200);
rect(-oreSize,-oreSize,oreSize*2,oreSize*2);
fill(0, 0, 0);
noStroke();
smooth();
for(let x=-40;x<40;x++){
    for(let y=-40;y<40;y++){
        let d=0;
        for(let i=0; i<balls.length; i+=3){
            d += 1/Math.hypot(balls[i]-x,balls[i+1]-y,balls[i+2]-0);
        }
        if(d>1/oreSegmentSize){
            rect(x+0.2,y+0.2,0.4,0.1);
            rect(x+0.3,y+0.5,0.5,0.1);
            rect(x+0.1,y+0.8,0.6,0.1);
        }
    }
}
