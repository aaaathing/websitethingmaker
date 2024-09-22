//jshint esnext: true
const trunkThick=1.5;
const trunkHeight=16;
const branchPerBranch=3;
const branchAngle=PI/4;
const branchDistMultiply = 0.9;
const branchThickMultiply = 0.8;
const angleNoise = 0.1;


angleMode='radians';
scale(400/50);
translate(0,50);
scale(1,-1);
noStroke();
function setBlock(x,y,c){
    fill(c);
    rect(x,y,1,1);
}
//https://www.geeksforgeeks.org/bresenhams-algorithm-for-3-d-line-drawing/
function line3D(x2, y2, z2, x1, y1, z1, array){
	x1 = round(x1);
	y1 = round(y1);
	z1 = round(z1);
	x2 = round(x2);
	y2 = round(y2);
	z2 = round(z2);
	array.push(x1, y1, z1);
	let dx = abs(x2 - x1);
	let dy = abs(y2 - y1);
	let dz = abs(z2 - z1);
	let xs;
	let ys;
	let zs;
	if (x2 > x1) {
		xs = 1;
	} else {
		xs = -1;
	}
	if (y2 > y1) {
		ys = 1;
	} else {
		ys = -1;
	}
	if (z2 > z1) {
		zs = 1;
	} else {
		zs = -1;
	}

	// Driving axis is X-axis"
	if (dx >= dy && dx >= dz) {
		let p1 = 2 * dy - dx;
		let p2 = 2 * dz - dx;
		while (x1 !== x2) {
			x1 += xs;
			if (p1 >= 0) {
				y1 += ys;
				p1 -= 2 * dx;
			}
			if (p2 >= 0) {
				z1 += zs;
				p2 -= 2 * dx;
			}
			p1 += 2 * dy;
			p2 += 2 * dz;
			array.push(x1, y1, z1);
		}

		// Driving axis is Y-axis"
	} else if (dy >= dx && dy >= dz) {
		let p1 = 2 * dx - dy;
		let p2 = 2 * dz - dy;
		while (y1 !== y2) {
			y1 += ys;
			if (p1 >= 0) {
				x1 += xs;
				p1 -= 2 * dy;
			}
			if (p2 >= 0) {
				z1 += zs;
				p2 -= 2 * dy;
			}
			p1 += 2 * dx;
			p2 += 2 * dz;
			array.push(x1, y1, z1);
		}

		// Driving axis is Z-axis"
	} else {
		let p1 = 2 * dy - dz;
		let p2 = 2 * dx - dz;
		while (z1 !== z2) {
			z1 += zs;
			if (p1 >= 0) {
				y1 += ys;
				p1 -= 2 * dz;
			}
			if (p2 >= 0) {
				x1 += xs;
				p2 -= 2 * dz;
			}
			p1 += 2 * dy;
			p2 += 2 * dx;
			array.push(x1, y1, z1);
		}
	}
}
let branches = [25,0,25,trunkHeight, trunkThick],array=[];
let i=0;
draw= function() {
    const x1=branches[i],y1=branches[i+1],x2=branches[i+2],y2=branches[i+3];
    const bthick=branches[i+4];
    if(bthick>=0.5){
        array.length=0;
        line3D(x2,y2,0,x1,y1,0,array);
        for(let j=0;j<array.length;j+=3){
            setBlock(array[j],array[j+1],color(148, 96, 0));
        }
    }
    const d=dist(x1,y1,x2,y2);
    const o=1/branchPerBranch;
    if(bthick>0.4){
        const a=atan2(x2-x1,y2-y1);
        for(let k=0;k<1;k+=o){
            const bx=lerp(min(k+o,1),x1,x2),by=lerp(min(k+o,1),y1,y2);
            //println(bx+','+by+","+k);
            const bd=d*branchDistMultiply*(1-k);
            const ba=a+(
                (round(random())*2-1)*branchAngle+
                (random()*2-1)*angleNoise
            )*(bd/trunkHeight);
            const ex=sin(ba)*bd, ey=cos(ba)*bd;
            //println(ex+","+ey+','+ba);
            branches.push(bx,by,bx+ex,by+ey,bthick*branchThickMultiply*(1-k));
        }
    }else{
        const ax=(y2-y1)/d, ay=(x1-x2)/d;
        for(let k=0;k<1;k+=o){
            const lx=lerp(min(k+o,1),x1,x2),ly=lerp(min(k+o,1),y1,y2);
            setBlock(round(lx+ax), round(ly+ay), color(0, 196, 65));
            setBlock(round(lx-ax), round(ly-ay), color(0, 148, 47));
        }
    }
    i+=5;
    if(i===branches.length){
        noLoop();
    }
};
setBlock(0,1,color(255, 0, 0));
random();
function lerp(t, a, b) {
	return a + t * (b - a);
}