elements.swapper = {
  color:["#aaaaff","#8888ff"],
  behavior: [
    ["XX",         "SW%5",       "XX"],
    ["SW%5 AND M1","XX",         "SW%5 AND M1"],
    ["M1",         "SW%5 AND M1","M1"]
  ],
  category: "weird stuff",
}
elements.rainbow_ball = {
  color: ["#ff0000","#ff8800","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff"],
  tick: function(pixel) {
    if(!pixel.realx) pixel.realx = pixel.x
    if(!pixel.realy) pixel.realy = pixel.y
    pixel.vely += 0.6
    pixel.vely *= 0.9
    pixel.velx *= 0.9
    var newRealX = pixel.realx+pixel.velx
    var newRealY = pixel.realy+pixel.vely
    var newX = Math.round(newRealX)
    var newY = Math.round(newRealY)
    if(isEmpty(newX,newY) && !outOfBounds(newX,newY)){
      movePixel(pixel,newX,newY)
      pixel.realx = newRealX
      pixel.realy = newRealY
    }else{
      pixel.velx = -pixel.velx
      pixel.vely = -pixel.vely
    }
    
    var t = pixelTicks+pixel.x+pixel.y;
    var r = Math.floor(127*(1-Math.cos(t*Math.PI/90)));
    var g = Math.floor(127*(1-Math.cos(t*Math.PI/90+2*Math.PI/3)));
    var b = Math.floor(127*(1-Math.cos(t*Math.PI/90+4*Math.PI/3)));
    pixel.color = "rgb("+r+","+g+","+b+")";
  },
  properties:{
    velx:0,
    vely:0
  },
  category: "weird stuff",
}