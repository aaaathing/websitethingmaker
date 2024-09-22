// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 18, 2020
var g=createGraphics(width,height,P3D);
function cube(x,y,z){
    g.pushMatrix();
    g.translate(x,y,z);
    g.box(10);
    g.popMatrix();
}
var externals;
var cubes=[
  [0,0,0, color(0, 150, 20)],
  [1,0,0, color(0, 150, 20)],
  [-1,0,0, color(0, 150, 20)],
  
  [0,0,1, color(105, 84, 0)],
  [1,0,1, color(105, 84, 0)],
  [-1,0,1, color(105, 84, 0)],
  
  [0,0,-1, color(0, 150, 20)],
  [1,0,-1, color(0, 150, 20)],
  [-1,0,-1, color(105, 84, 0)],
  
  [0,0,2, color(0, 150, 20)],
  [1,0,2, color(0, 150, 20)],
  [-1,0,2, color(0, 150, 20)],
  
  //wall
  [0,-1,1, color(105, 84, 0)],
  [1,-1,1, color(105, 84, 0)],
  [-1,-1,1, color(105, 84, 0)],
  
  [0,-2,1, color(0, 150, 20)],
  [1,-2,1, color(0, 150, 20)],
  [-1,-2,1, color(0, 150, 20)],
  
  //bump
  [0,0,-2, color(105, 84, 0)],[0,-1,-2, color(0, 150, 20)],
  [-1,-1,-2, color(105, 84, 0)],[-1,0,-2, color(105, 84, 0)],[-1,-2,-2, color(0, 150, 20)],[-1,-1,-1, color(0, 150, 20)],
  [1,0,-2, color(0, 150, 20)],
];

draw = function() {
    g.background(255, 255, 255);
    g.fill(255, 0, 0);
    
    g.camera(sin(frameCount/6)*80, sin(frameCount/10)*20-50, cos(frameCount/6)*80, 0, 0, 0, 0, 1, 0);
    
    for(var i=0;i<cubes.length;i++){
        var theCube=cubes[i];
        g.fill(theCube[3]);
        cube(theCube[0]*10,theCube[1]*10,theCube[2]*10);
    }
    
    externals.context.drawImage(g.externals.canvas, 0, 0);
};