// Sep 2, 2023
/*
The brighter areas are higher.
Rivers are generated first, then height is controlled by rivers.

Based on: https://www.planetminecraft.com/blog/realistic-terrain-generation-concept-start-with-water/
*/

//jshint esnext: true
noiseDetail(2,0.6);
noiseSeed(undefined);random();

const seed = random(100000000);

//hash code from: https://www.khanacademy.org/computer-programming/xxhash/5158351984476160
var seedHash;
var hash = (function() {
    var seed = (Math.random() * 2100000000) | 0;
	var PRIME32_2 = 1883677709;
	var PRIME32_3 = 2034071983;
	var PRIME32_4 = 668265263;
	var PRIME32_5 = 374761393;
	
	seedHash = function(s) {
	    seed = s | 0;
	};
	
	return function(x, y, z) {
	    var h32 = 0;
		
		h32 = (seed + PRIME32_5) | 0;
		h32 += 8;
		
		//If you need more or fewer inputs, just copy/paste these 2 lines and change the variable name
		h32 += Math.imul(x, PRIME32_3);
		h32 = Math.imul((h32 << 17) | (h32 >> (32 - 17)), PRIME32_4);
		
		h32 += Math.imul(y, PRIME32_3);
		h32 = Math.imul((h32 << 17) | (h32 >> (32 - 17)), PRIME32_4);
		
		h32 += Math.imul(z, PRIME32_3);
		h32 = Math.imul((h32 << 17) | (h32 >> (32 - 17)), PRIME32_4);
		
		h32 ^= h32 >> 15;
		h32 *= PRIME32_2;
		h32 ^= h32 >> 13;
		h32 *= PRIME32_3;
		h32 ^= h32 >> 16;
		
		return h32 / 2147483647;
	};
})();

//below function from https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment  and modified
function lineToPointSq(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq !== 0){ //in case of 0 length line
      param = dot / len_sq;
  }

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  lineToPointSq.xx = xx;
  lineToPointSq.yy = yy;
  return dx * dx + dy * dy;
}

function getHeightmap(cx,cz,heightmaps,rcx,rcz,scale){
    let grid = [];
    for(let x=0; x<16; x++){
        for(let z=0; z<16; z++){
            grid[x*16+z] = noise((x+rcx*16)*scale*0.05,(rcz*16+z)*scale*0.05)*2-1;
        }
    }
    heightmaps[(cx+2)*5+(cz+2)] = grid;
}
function getHeight(x,z,heightmaps){
    let chunk = heightmaps[((x>>4)+2)*5+((z>>4)+2)];
    if(!chunk){return;}
    return chunk[(x&15)*16+(z&15)];
}
/*Chunk format: 5 by 5 grid

`````
`|||`
`|m|`
`|||`
`````

`  only heightmaps
|  heightmaps + generate rivers
m  heightmaps + generate rivers + include neighbour chunk rivers
*/
function generateBorders(borders,cx,cz,heightmaps){
    for(let x=0; x<16; x++){
        for(let z=0; z<16; z++){
            if(getHeight(cx*16+x,cz*16+z,heightmaps)<0 && (
                getHeight(cx*16+x+1,cz*16+z,heightmaps)>0 ||
                getHeight(cx*16+x-1,cz*16+z,heightmaps)>0 ||
                getHeight(cx*16+x,cz*16+z+1,heightmaps)>0 ||
                getHeight(cx*16+x,cz*16+z-1,heightmaps)>0
            )){
                borders.push(cx*16+x,cz*16+z);
            }
        }
    }
}
function generateBaseRivers(borders,cx,cz,rcx,rcz,rivers,heightmaps){
    for(let i=0; i<16; i++){
        let x = floor(hash(rcx,rcz,i*2)*16);
        let z = floor(hash(rcx,rcz,i*2+1)*16);
        if(getHeight(cx*16+x,cz*16+z,heightmaps)<0){continue;}
        let clx, clz, closest = Infinity;
        for(let j=0; j<borders.length; j+=2){
            let d = pow(cx*16+x - borders[j],2)+pow(cz*16+z - borders[j+1],2);
            if(d<closest){
                closest = d;
                clx = borders[j];
                clz = borders[j+1];
            }
        }
        if(closest < 16*16){
            rivers.push(cx*16+x,cz*16+z,clx,clz,1);
        }
    }
}
function generateSubRivers(cx,cz,rcx,rcz,scale,rivers,prevRivers,heightmaps){
    for(let i=0; i<16*scale; i++){
        let x = floor(hash(rcx,rcz,i*2)*16);
        let z = floor(hash(rcx,rcz,i*2+1)*16);
        if(getHeight(cx*16+x,cz*16+z,heightmaps)<0){continue;}
        let clx, clz, closest = Infinity;
        for(let j=0; j<prevRivers.length; j+=5){
            let d = lineToPointSq(cx*16+x,cz*16+z,prevRivers[j],prevRivers[j+1],prevRivers[j+2],prevRivers[j+3]);
            if(d<closest){
                closest = d;
                clx = lineToPointSq.xx;
                clz = lineToPointSq.yy;
            }
        }
        if(closest < 16*16){
            rivers.push(cx*16+x,cz*16+z,clx,clz,1);
        }
    }
}

function lerp(t, a, b) {
    return a + t * (b - a);
}
/*function smoothenHeight(f){
    //A basic cubic spline
	const der0 = 2.5;
	const der1 = 0;
	const val0 = 0;
	const val1 = 1;
	const f8 = der0 * (1 - 0) - (val1 - val0);
	const f9 = -der1 * (1 - 0) + (val1 - val0);
	const f10 = lerp(f, val0, val1) + f * (1.0 - f) * lerp(f, f8, f9);
	return f10;
}*/
function getFinalHeight(x,z,rivers,riverSizeIndexes){
    let ret = 0, Min = 1, minDist = 1, prevDist = 1;
    let riverHeight = 0;
    let i = 0;
    for(let si=0; si<riverSizeIndexes.length; si++){
        Min = 1;
        minDist = 1;
        for(let j=0; j<riverSizeIndexes[si]; j+=5){//.here
            let d = lineToPointSq(x,z,rivers[i],rivers[i+1],rivers[i+2],rivers[i+3]);
            Min = min(d/100/rivers[i+4],Min);
            minDist = min(minDist,d/100);
            
            let riverAddHeight = rivers[i+4];//Amount above the base of river
            if(d<riverAddHeight){
                riverHeight = max(riverHeight,ret/2+riverAddHeight);
            }
            i+=5;
        }
        ret += Min*prevDist;
        prevDist *= minDist;
    }
    getFinalHeight.riverHeight = riverHeight;
    return ret/2;
}
//One chunk is 1 unit
function generateChunk(x,z){seedHash(seed);
    //Create a heightmap for the rivers to flow down
    let heightmaps = [];
    for(let cx=-2; cx<=2; cx++){
        for(let cz=-2; cz<=2; cz++){
            getHeightmap(cx,cz,heightmaps,round(x)+cx,round(z)+cz,1);
        }
    }
    //Detect borders so that the rivers do not need to check every tile
    let borders = [];
    for(let cx=-1; cx<=1; cx++){
        for(let cz=-1; cz<=1; cz++){
            generateBorders(borders,cx,cz,heightmaps);
        }
    }
    //Generate biggest rivers
    let rivers = [], prevRivers = [];
    for(let cx=-1; cx<=1; cx++){
        for(let cz=-1; cz<=1; cz++){
            generateBaseRivers(borders,cx,cz,round(x)+cx,round(z)+cz,rivers,heightmaps);
        }
    }
    let riverSizeIndexes = [];
    riverSizeIndexes.push(rivers.length);
    let Scale = 1, prevScale;
    heightmaps.length = 0;
    for(let zoom=0; zoom<2; zoom++){
        //Zoom in and generate smaller rivers connecting to the previous rivers
        for(let i=0;i<rivers.length;i++){prevRivers.push(rivers[i]);}
        rivers.length = 0;
        prevScale = Scale;
        let scaleBy = 0.25;
        Scale *= scaleBy;
        seedHash(hash(0,0,0)*2147483647);
        let offsetX = (round(x/prevScale)*prevScale - round(x/Scale)*Scale)/prevScale;
        let offsetZ = (round(z/prevScale)*prevScale - round(z/Scale)*Scale)/prevScale;
        for(let i=0; i<prevRivers.length; i+=5){
            prevRivers[i] = (prevRivers[i]+offsetX*16)/scaleBy;
            prevRivers[i+1] = (prevRivers[i+1]+offsetZ*16)/scaleBy;
            prevRivers[i+2] = (prevRivers[i+2]+offsetX*16)/scaleBy;
            prevRivers[i+3] = (prevRivers[i+3]+offsetZ*16)/scaleBy;
            prevRivers[i+4] /= scaleBy;
        }
        for(let cx=-1; cx<=1; cx++){
            for(let cz=-1; cz<=1; cz++){
                getHeightmap(cx,cz,heightmaps,(round(x/Scale)+cx),(round(z/Scale)+cz),Scale);
            }
        }
        for(let cx=-1; cx<=1; cx++){
            for(let cz=-1; cz<=1; cz++){
                generateSubRivers(cx,cz,round(x/Scale)+cx,round(z/Scale)+cz,Scale,rivers,prevRivers,heightmaps);
            }
        }
        riverSizeIndexes.push(rivers.length);
    }
    for(let i=0;i<rivers.length;i++){prevRivers.push(rivers[i]);}
    
    //for(let i=0; i<borders.length;i+=2){rect(borders[i]*5+100,borders[i+1]*5+100,5,5);}
    
    noStroke();
    for(let bx=-0;bx<16;bx++){
        for(let bz=-0;bz<16;bz++){
            if(getHeight(bx,bz,heightmaps)<0){
                fill(0, 166, 255);
            }else{
                let finalHeight = getFinalHeight(bx,bz,prevRivers,riverSizeIndexes);
                if(getFinalHeight.riverHeight > finalHeight){
                    fill(0, 0, (finalHeight*0.5+0.5)*255);
                }else{
                    fill(0, (finalHeight*0.5+0.5)*255, 38);
                }
            }
            rect((bx+(x-4)/Scale*16)*5,(bz+(z-4)/Scale*16)*5,5,5);
        }
    }
    //*
    for(let i=0; i<prevRivers.length;i+=5){
        stroke(prevRivers[i+4]*80,0,200,50);
        strokeWeight(prevRivers[i+4]*2);
        line((prevRivers[i]+(x-4)/Scale*16)*5,(prevRivers[i+1]+(z-4)/Scale*16)*5,(prevRivers[i+2]+(x-4)/Scale*16)*5,(prevRivers[i+3]+(z-4)/Scale*16)*5);
    }//*/
    
}
//*

for(let x=0; x<0.25; x+=0.0625){
    for(let z=0; z<0.25; z+=0.0625){
        generateChunk(x+4,z+4);
    }
}/*/
for(let x=0; x<1; x+=0.25){
    for(let z=0; z<1; z+=0.25){
        generateChunk(x,z);
    }
}
//*/