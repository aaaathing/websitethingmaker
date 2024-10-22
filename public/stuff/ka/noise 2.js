// May 1, 2023
//noise that looks like bacteria

// jshint esnext: true
const noisesize=5;
const drawsize=4;
const amount=0.97;
const noiseshape=0;//0, 1, 2

const getDist = [
    function(x,x2,y,y2){
        return Math.sqrt((x2-x)*(x2-x)+(y2-y)*(y2-y));
    },
    function(x,x2,y,y2){
        return Math.max(Math.abs(x-x2),Math.abs(y-y2));
    },
    function(x,x2,y,y2){
        return Math.abs(x-x2)+Math.abs(y-y2);
    }
][noiseshape];


// implementation of xxHash
{
let seed = Math.random() * 2100000000 | 0;

const PRIME32_2 = 1883677709;
const PRIME32_3 = 2034071983;
const PRIME32_4 = 668265263;
const PRIME32_5 = 374761393;

const seedHash = function(s){
	seed = s | 0;
};

const hash = function(x, y){
	let h32 = 0;

	h32 = seed + PRIME32_5 | 0;
	h32 += 8;

	h32 += Math.imul(x, PRIME32_3);
	h32 = Math.imul(h32 << 17 | h32 >> 32 - 17, PRIME32_4);
	h32 += Math.imul(y, PRIME32_3);
	h32 = Math.imul(h32 << 17 | h32 >> 32 - 17, PRIME32_4);

	h32 ^= h32 >> 15;
	h32 *= PRIME32_2;
	h32 ^= h32 >> 13;
	h32 *= PRIME32_3;
	h32 ^= h32 >> 16;

	return h32 / 2147483647;
};
}

function noise2(x,y){
    let minDist=noisesize;
    for(let x2=Math.round(x-noisesize);x2<=Math.round(x+noisesize);x2++){
        for(let y2=Math.round(y-noisesize);y2<=Math.round(y+noisesize);y2++){
            if(hash(x2,y2)>amount){
                var dist=getDist(x,x2,y,y2);
                minDist=Math.min(minDist,dist);
            }
        }
    }
    return 1-Math.pow(1-(minDist/noisesize),2);
}
noStroke();

var x=-drawsize,y=0;
draw= function() {
    let start=Date.now();
    while(Date.now()-start<5){
        x+=drawsize;
        if(x>=400){
            x=0;
            y+=drawsize;
            if(y>=400){
                noLoop();
            }
        }
        var c=noise2(x/10,y/10)*255;
        fill(c,c,c);
        rect(x,y,drawsize,drawsize);
    }
};
