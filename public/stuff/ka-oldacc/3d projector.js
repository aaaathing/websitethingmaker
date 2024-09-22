// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Feb 2, 2021
//probably ported from something on scratch
angleMode="degrees";

var cam={
    x:0,
    y:0,
    z:0,
    
    rotX:0,
    rotY:0,
    
    sinX:0,
    cosX:0,
    
    sinY:0,
    cosY:0,
    
    viewFactor:300,
    nearPlane:10
};

function calcTrigValues(){
    cam.sinX = sin(cam.rotX);
    cam.cosX = cos(cam.rotX);
    
    cam.sinY = sin(cam.rotY);
    cam.cosY = cos(cam.rotY);
}

function zClipping(x1, y1, z1, x2, y2, z2){
    if((z1<cam.nearPlane)||(z2<cam.nearPlane)){
        var percent = (cam.nearPlane - z1)/(z2 - z1);
        if(z1 < cam.nearPlane){
            x1 += (x2 - x1) * percent;
            y1 += (y2 - y1) * percent;
            z1 = cam.nearPlane;
        }else if(z2 < cam.nearPlane){
            x2 = x1 + (x2 - x1) * percent;
            y2 = y1 + (y2 - y1) * percent;
            z2 = cam.nearPlane;
        }
    }
    
    return {
        x1: x1,
        y1: y1,
        z1: z1,
        x2: x2,
        y2: y2,
        z2: z2
    };
}

function line3D(x1,y1,z1, x2,y2,z2){
    x1 -= cam.x; y1 -= cam.y; z1 -= cam.z;
    x2 -= cam.x; y2 -= cam.y; z2 -= cam.z;
    x1 = (z1 * cam.sinY)+(x1 + cam.cosY); z1 = (z1 * cam.cosY)-(x1 * cam.sinY);
    x2 = (z2 * cam.sinY)+(x2 + cam.cosY); z2 = (z2 * cam.cosY)-(x2 * cam.sinY);
    y1 = (y1 * cam.cosX)-(z1 * cam.sinX); z1 = (y1 * cam.sinX)+(z1 * cam.cosX);
    y2 = (y2 * cam.cosX)-(z2 * cam.sinX); z2 = (y2 * cam.sinX)+(z2 * cam.cosX);
    
    var sx1 = cam.viewFactor * (x1/z1),  sy1 = cam.viewFactor * (y1/z1);
    var sx2 = cam.viewFactor * (x2/z2),  sy2 = cam.viewFactor * (y2/z2);
    
    if(!((z1<cam.nearPlane)&&(z2<cam.nearPlane)) ){
      var pos=zClipping(x1, y1, z1, x2, y2, z2);
      x1 = pos.x1; y1 = pos.y1; z1 = pos.z1;
      x2 = pos.x2; y2 = pos.y2; z2 = pos.z2;
      
      
      sx1 += width/2; sy1 += height/2;
      sx2 += width/2; sy2 += height/2;
      
      line(sx1, sy1, sx2, sy2);
    }
}


draw = function(){
  background(255,255,255);
  
  calcTrigValues();
  var z = 100;
  line3D(-10,-10,z, 10,-10,z);
  line3D(-10,10,z, -10,-10,z);
  line3D(10,10,z, 10,-10,z);
  line3D(-10,10,z, 10,10,z);
};