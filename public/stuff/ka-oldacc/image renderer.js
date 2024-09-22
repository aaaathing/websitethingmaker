// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 18, 2020
var cube=function(){
var g=createGraphics(width,height,P3D);
g.background(194, 194, 194);
g.translate(width/2,height/2);
g.rotateX(45);
g.rotateY(50);
g.strokeWeight(5);
g.box(200);
g.lights();
return g;
};
frameRate(1000);
var resolution=3;
var images=cube();



var id;

imageMode(CENTER);
image(images, width/2, height/2, width, height);
// Store the data in a big array, with each pixel represented by four numbers
id = toImageData(0, 0, width, height);
// Clear the background so the image is a mystery
background(255, 255, 255);

var sx=0;var sy=0;


draw = function() { 
    if (!id.data) {
        return;
    }
    sx+=resolution;
    if(sx>width){
        sx=0;
        sy+=resolution;
    }
    if(sy>height){
        sy=0;
        fill(255, 0, 0);
        rect(0,0,10,width);
    }
    
    
    var x = sx;
    var y = sy;
    // Get data from the image array for given pixel location
    var offset = x*4 + y*width*4;
    var pix =  color(id.data[offset], id.data[offset+1], id.data[offset+2], id.data[offset+3]);
    // Draw circle at that point
    noStroke();
    fill(pix);
    rect(x, y, resolution, resolution);
    stroke(0, 0, 0);
    fill(255, 0, 0);
    rect(0,y,10,resolution);
};
