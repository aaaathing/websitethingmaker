//jshint esnext: true
background(255);
fill(0);
textSize(16);
textAlign(LEFT,TOP);
text('l-=',16,16);
random();

let rivers = get(0,4,48,48).imageData.data;
function getRiver(x,z,rivers){
    x+=16;z+=16;
    return rivers[(z*48+x)*4]/255;
}
let riverBlur = [];
let start;
let end;
let blurRad = 2;
let avg, count = pow((blurRad*2+1),2);
for(let bz=0; bz<16; bz++){
	if(start === undefined){
		//Fill in average for first time only, blur for (0,0)
		avg = 0;
		for(let x2=-blurRad; x2<=blurRad; x2++){
			for(let z2=-blurRad; z2<=blurRad; z2++){
				avg += getRiver(x2,z2,rivers) > 0.5 ? 255 : 0;
			}
		}
		riverBlur[0] = avg/count;
	}else{ //Moved down, remove top row and add bottom row
		for(let x2=end-blurRad; x2<=end+blurRad; x2++){
			avg -= getRiver(x2,bz-blurRad,rivers) > 0.5 ? 255 : 0;
			avg += getRiver(x2,bz+blurRad,rivers) > 0.5 ? 255 : 0;
		}
		riverBlur[bz*16+end] = avg/count;
	}
	if(start === 15 || start === undefined) {start = 0; end = 15;}
	else {start = 15; end = 0;}
	if(end){
		for(let bx=1; bx<=15; bx++){
			for(let z2=bz-blurRad; z2<=bz+blurRad; z2++){//Moved right, remove left and add right
				avg -= getRiver(bx-blurRad-1,z2,rivers) > 0.5 ? 255 : 0;
				avg += getRiver(bx+blurRad,z2,rivers) > 0.5 ? 255 : 0;
			}
			riverBlur[bz*16+bx] = avg/count;
		}
	}else{
		for(let bx=14; bx>=0; bx--){//Moved left, remove right and add left
			for(let z2=bz-blurRad; z2<=bz+blurRad; z2++){
				avg -= getRiver(bx+blurRad+1,z2,rivers) > 0.5 ? 255 : 0;
				avg += getRiver(bx-blurRad,z2,rivers) > 0.5 ? 255 : 0;
			}
			riverBlur[bz*16+bx] = avg/count;
		}
	}
}
loadPixels();
for(let x=0;x<16;x++){
    for(let z=0;z<16;z++){
        let pix = riverBlur[z*16+x];
        imageData.data[((z+100)*400+(x+10))*4] = pix;
        imageData.data[((z+100)*400+(x+10))*4+1] = pix;
        imageData.data[((z+100)*400+(x+10))*4+2] = pix;
    }
}
updatePixels();