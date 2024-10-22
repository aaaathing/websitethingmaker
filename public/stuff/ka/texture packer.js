// Nov 25, 2023
/*
This program puts many rectangles together tightly which can be used for texture atlas.
*/
//jshint esnext:true
let gridsize = 100;
let textures = [];
for(let i=0;i<100;i++){
    if(random()>0.98){
        textures.push([round(random(16,32)),round(random(16,32)),0,0]);
    }else{
        let s=pow(2,round(random(1,4)));
        textures.push([s,s,0,0]);
    }
}
textures.sort(function(a,b){return b[1]-a[1];});
const newThing = Object.constructor("thing","x","return new window[thing](x)");
let grid = newThing("Uint16Array",gridsize*gridsize);
noStroke();
fill(255);
rect(0,0,400,400);//background doesn't work for some reason
scale(400/gridsize);
for(let texi=0;texi<textures.length;texi++){
    let tex=textures[texi];
    let x=0, y=0;
    findSpaceLoop:while(y+tex[1]<=gridsize){
        if(x+tex[0]>gridsize){
            x=0;
            y++;
        }
        if(grid[x+y*gridsize]){
            let othertex = textures[grid[x+y*gridsize]-1];
            x=othertex[2]+othertex[0];//skip to end of other texture
        }else{
            for(let tx=tex[0]-1;tx>=0;tx--){
                for(let ty=0;ty<tex[1];ty++){
                    if(grid[(x+tx)+(y+ty)*gridsize]){
                        x+=tx+1;//no space, skip to end of this section
                        continue findSpaceLoop;
                    }
                }
            }
            for(let tx=0;tx<tex[0];tx++){
                for(let ty=0;ty<tex[1];ty++){
                    grid[(x+tx)+(y+ty)*gridsize] = texi+1;
                }
            }
            break findSpaceLoop;
        }
    }
    if(y+tex[1]>gridsize){throw {message:"cannot fit"};}
    tex[2]=x;tex[3]=y;
    fill(random(255),random(255),random(255));
    rect(x,y,tex[0],tex[1]);
    //println(x+","+y);
}
