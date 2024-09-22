// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 14, 2020
var noiseScale=0.005;
var bumpy=159;

var mx=0;
draw = function() {
  background(0, 238, 255);
  strokeWeight(1);
  
  mx++;
  
  for(var x=0; x < width; x++) {
    var noiseVal = noise((mx+x)*noiseScale);
    
    stroke(0, 255, 17);
    line(x, 200+noiseVal*bumpy,x,height);
    stroke(107, 89, 0);
    line(x, 220+noiseVal*bumpy,x,height);
    stroke(115, 115, 115);
    line(x, 280+noiseVal*bumpy,x,height);
  }
  
  var noiseVal = noise((mx+200)*noiseScale);
  strokeWeight(10);
  stroke(255, 0, 0);
  point(200,200+noiseVal*bumpy);
};