//jshint esnext:true
//change these
const gsize = 64;//grid size
const opf = 1;//operations per frame
const maxCarry = 1;
const landslideThreshold = 0.02;
let showWater = false;
frameRate(10);
//don't change below

const newThing = Object.constructor("thing","x","return new window[thing](x)");

scale(400/gsize);
noStroke();
smooth();
noiseSeed(undefined);

mouseClicked = function(){
    showWater = !showWater;
};

let heightmaps = newThing("Float32Array",gsize*gsize);
let nextHeightmaps = newThing("Float32Array",gsize*gsize);
let wetness = newThing("Uint16Array",gsize*gsize);
for(let x=0; x<gsize; x++){
    for(let z=0; z<gsize; z++){
        heightmaps[z*gsize+x] = map(noise(x*0.05,z*0.05),0.25,0.65,0,1);
        fill(heightmaps[z*gsize+x]*255);
        rect(x,z,1,1);
    }
}
nextHeightmaps.set(heightmaps);
function getHeight(x,z){
    return x>=0 && x<gsize && z>=0 && z<gsize && heightmaps[z*gsize+x];
}
function getNewHeightClamped(x,z){
    return nextHeightmaps[constrain(z,0,gsize-1)*gsize+constrain(x,0,gsize-1)];
}
function lowerHeight(x,z,a){
    if(x>=0 && x<gsize && z>=0 && z<gsize){nextHeightmaps[z*gsize+x] -= a;}
}
function addWet(x,z,a){
    if(x>=0 && x<gsize && z>=0 && z<gsize){
        wetness[z*gsize+x]+=a;
    }
}
function getWet(x,z){
    return x>=0 && x<gsize && z>=0 && z<gsize && wetness[z*gsize+x];
}
let drops = [];//format: x, z, amount carrying, iterations, downvel
draw= function() {
    if(!drops.length){
        background(255, 0, 0);
        let neighbours, thisheight;
        for(let x=0; x<gsize; x++){//copy newheightmaps to heightmaps and blur
            for(let z=0; z<gsize; z++){
                neighbours = (getNewHeightClamped(x+1,z)+getNewHeightClamped(x-1,z)+getNewHeightClamped(x,z+1)+getNewHeightClamped(x,z-1))/4;
                thisheight = nextHeightmaps[z*gsize+x];
                /*heightmaps[z*gsize+x] = (
                        nextHeightmaps[z*gsize+x]*2+
                        getNewHeightClamped(x+1,z)+getNewHeightClamped(x-1,z)+getNewHeightClamped(x,z+1)+getNewHeightClamped(x,z-1)+
                        getNewHeightClamped(x+1,z+1)+getNewHeightClamped(x+1,z-1)+getNewHeightClamped(x-1,z-1)+getNewHeightClamped(x-1,z+1)
                    )/6;*/
                if(neighbours>thisheight+landslideThreshold){
                    heightmaps[z*gsize+x] = (thisheight+(neighbours-landslideThreshold)*2)/3;
                }else if(neighbours<thisheight-landslideThreshold){
                    heightmaps[z*gsize+x] = (thisheight+(neighbours+landslideThreshold)*2)/3;
                }
                drops.push(x,z,0,0,0);
            }
        }
        nextHeightmaps.set(heightmaps);
        for(let x=0; x<gsize; x++){
            for(let z=0; z<gsize; z++){
                fill(max(heightmaps[z*gsize+x]*255,0));
                rect(x,z,1,1);
                fill(
                    lerpColor(color(255),
                        lerpColor(color(0,0,255),color(0),max(wetness[z*gsize+x]/100-1,0)),
                    min(wetness[z*gsize+x]/100,1))
                );
                //rect(x+0.3,z+0.3,0.4,0.4);
                if(showWater){rect(x+0,z+0,1,1);}
            }
        }
        wetness.fill(0);
    }
    fill(5, 255, 101);
    rect(0,0,(gsize*gsize-drops.length)/gsize,0.1);
    for(let k=0; k<opf; k++){
        for(let d=0; d<drops.length; d+=5){
            let x = drops[d], z = drops[d+1];
            let prevHeight = getHeight(x,z);
            let nx, nz, thisheight, minHeight = prevHeight;
            let nrx, nrz, minRiverHeight = prevHeight;
            let carrying = drops[d+2], downvel = drops[d+4];
            let iteration = drops[d+3];
            let thisWet = getWet(x,z);
            thisheight = getHeight(x+1,z);
            if(thisheight<minHeight){nx = 1; nz = 0; minHeight = thisheight;}
            if(thisheight<=minRiverHeight && getWet(x+1,z)>=thisWet){nrx = 1; nrz = 0; minRiverHeight = thisheight;}
            thisheight = getHeight(x-1,z);
            if(thisheight<minHeight){nx = -1; nz = 0; minHeight = thisheight;}
            if(thisheight<=minRiverHeight && getWet(x-1,z)>=thisWet){nrx = -1; nrz = 0; minRiverHeight = thisheight;}
            thisheight = getHeight(x,z+1);
            if(thisheight<minHeight){nx = 0; nz = 1; minHeight = thisheight;}
            if(thisheight<=minRiverHeight && getWet(x,z+1)>=thisWet){nrx = 0; nrz = 1; minRiverHeight = thisheight;}
            thisheight = getHeight(x,z-1);
            if(thisheight<minHeight){nx = 0; nz = -1; minHeight = thisheight;}
            if(thisheight<=minRiverHeight && getWet(x,z-1)>=thisWet){nrx = 0; nrz = -1; minRiverHeight = thisheight;}
            if(minHeight === prevHeight){//stuck, drop stuff
                lowerHeight(x,z,carrying*-0.25);
                drops.splice(d,5);d-=5;continue;
            }
            if(minRiverHeight === prevHeight){
                x += nx; z += nz;
            }else{
                x += nrx; z += nrz;
                minHeight = minRiverHeight;
            }
            if(x<0||x>=gsize||z<0||z>=gsize){drops.splice(d,5);d-=5;continue;}
            drops[d] = x; drops[d+1] = z;
            let change = prevHeight-minHeight;
            prevHeight = minHeight;
            let effectiveness = 1-max(iteration/4-12,0);
            addWet(x,z,effectiveness*16);
            downvel *= 0.5;
            downvel += change;
            if(downvel > 0.1){//remove stuff
                let carryAmount = min(maxCarry-carrying/*amount of space left*/, change)*0.5;
                carrying += carryAmount;
                lowerHeight(x-nx,z-nz,carryAmount*effectiveness);
            }else{//add stuff
                lowerHeight(x,z,carrying*-0.25*effectiveness);
                carrying *= 0.75;
            }
            drops[d+2] = carrying;
            drops[d+4] = downvel;
            drops[d+3]++;
            if(drops[d+3]>16){drops.splice(d,5);d-=5;continue;}
        }
        for(let x=0; x<gsize; x++){
            for(let z=0; z<gsize; z++){
                //prevent too much eroding
                nextHeightmaps[z*gsize+x] = max(nextHeightmaps[z*gsize+x], heightmaps[z*gsize+x]-0.1);
            }
        }
        heightmaps.set(nextHeightmaps);
    }
};
