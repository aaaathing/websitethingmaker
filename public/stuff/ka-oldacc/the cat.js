// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 8, 2020
var scene=1;

var cat=function(x,y,legs){
  
  //legs
  strokeWeight(40);
  var leg1 = sin( legs)*30;
  var leg2 = sin(-legs)*30;
  stroke(130, 119, 85);
  line(-80+x, 30+y, -80+x + leg1, 65+y);
  line(60+x,  30+y,  60+x + leg1, 65+y);
  
  stroke(189, 171, 117);
  line(-70+x, 30+y, -70+x + leg2, 65+y);
  line(70+x,  30+y,  70+x + leg2, 65+y);
  
  //body and head
  noStroke();
  fill(255, 231, 158);
  ellipse(0+x, 0+y, 200, 80);
  ellipse(100+x, -30+y, 80, 80);
  
  //eyes
  strokeWeight(10);
  stroke(0, 0, 0);
  point(90+x, -50+y);
  point(120+x, -50+y);
};


var legy=0;
draw= function(){
    background(255, 255, 255);
    if(scene===1){
        legy+=5;
        if(legy>360){legy-=360;}
        cat(200,200, legy);
    }
};

