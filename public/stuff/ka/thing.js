var n=1234,x=0,pn=n;
strokeWeight(1);
var ysize=10,xsize=10;
frameRate(10);
background(255);
draw= function() {
    pn=n;
    if(floor(n/2)*2-n){
        n=n*3+1;
    }else{
        n/=2;
    }
    if(n*ysize>400){
        var pysize=ysize;
        ysize=400/n;
        var i=get(0,0,400,400);
        background(255);
        var changeh = ysize/pysize*400;
        image(i,0,400-changeh,400,changeh);
    }
    line((x-1)*xsize,399-pn*ysize,x*xsize,399-n*ysize);
    x++;
    if(x*xsize>400){
        var i=get(0,0,400,400);
        background(255);
        image(i,-xsize,0,400,400);
        x--;
    }
    fill(255);
    rect(0,370,100,30);
    fill(0);
    text(n,10,390);
};
