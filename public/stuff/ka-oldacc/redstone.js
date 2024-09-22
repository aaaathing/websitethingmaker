// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 29, 2020
var externals;
var stuff=[];
var blockdata=[];
var realData={
  air:{
    signalStrength:0,
    signalLock:true
  },
  rs:{
    signalStrength:0,
    signalLock:false
  },
  toch:{
    signalStrength:16,
    signalLock:true
  }
};

var generator={
  blockW:25,
  blockH:25,
  
  blockXCount:16,
  blockYCount:12,
  
  block:"rs"
};

var currentBlock="rs";

var renderBlock;//predefine

function BlockButton(x,y,w,h){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  
  this.color = [255,255,255];
  
  this.mouseDown = false;
  
  this.block = "air";
  this.onclick=function(){
    currentBlock = this.block;
  };
  this.collide = function(){
    return mouseX > this.x &&
           mouseX < this.x+this.w &&
           mouseY > this.y &&
           mouseY < this.y+this.h;
  };
  this.draw = function(){
    if((!this.mouseDown)&&mouseIsPressed){
      this.mouseDown = true;
    }
    if(this.mouseDown&&(!mouseIsPressed)){
      this.mouseDown = false;
      if(this.collide()){
        this.onclick();
      }
    }
    
    fill(this.color[0], this.color[1], this.color[2]);
    if(this.collide()){
      fill(this.color[0]*0.9, this.color[1]*0.9, this.color[2]*0.9);
    }
    rect(this.x, this.y, this.w, this.h);
    renderBlock(this.block, realData[this.block], this.x/generator.blockW, this.y/generator.blockH);
  };
}
var blockBtns = [];
var i = -1;
for(var btn in realData){
  i++;
  blockBtns.push(new BlockButton((generator.blockW+10)*i, 320, generator.blockW, generator.blockH));
  blockBtns[i].block = btn;
}
var renderBtns = function(){
  for(i=0; i<blockBtns.length; i++){
    blockBtns[i].draw();
  }
};


var Generate=function(){
  var x,y;
  stuff=[];
  blockdata=[];
  for(y=0; y<generator.blockYCount;y++){
    var row=[];
    var datrow=[];
    for(x=0;x<generator.blockXCount; x++){
      row.push(generator.block);
      datrow.push(Object.assign({}, realData[generator.block]));
    }
    stuff.push(row);
    blockdata.push(datrow);
  }
};

renderBlock = function(block,bdata,x,y){
  var W=generator.blockW;
  var H=generator.blockH;
  
  if(block==="air"){
    fill(255, 255, 255, 0);
  }
  if(block==="rs"){
    var shade = bdata.signalStrength * 13 + 150;
    if(bdata.signalStrength===0){
      shade=120;
    }
    fill(shade, shade-255, shade-255);
  }
  if(block==="toch"){
    fill(255,255,0);
    rectMode(CENTER);
    rect(x*W + (W/2), y*H + (H/2),W/3,H/3);
    fill(0, 0, 0, 0);
  }
  rectMode(CORNER);
  rect(x*W, y*H, W,H);
  
  fill(0,0,0);
  textAlign(LEFT, TOP);
  text(bdata.signalStrength,x*W,y*H);
};
var render=function(){
    for(var y=0; y<stuff.length; y++){
        var row=stuff[y];
        var drow=blockdata[y];
        for(var x=0; x<row.length; x++){
            var thing=row[x];
            renderBlock(thing,drow[x],x,y);
        }
    }
};
var getBlock = function(x,y){
  var block = stuff[y];
  if(block && block[x]){
    return {
        block:block[x],
        data:blockdata[y][x]
    };
  }
};
var calc=function(){
  if(mouseIsPressed){
    var blockX = Math.floor(mouseX/generator.blockW);
    var blockY = Math.floor(mouseY/generator.blockH);
    
    var blockR = stuff[blockY];
    var dataR = blockdata[blockY];
    if(blockR && dataR){
      if(blockR[blockX] && dataR[blockX]){
        blockR[blockX] = currentBlock;
        dataR[blockX] = Object.assign({}, realData[currentBlock]);
      }
    }
  }
  
  for(var y=0; y<stuff.length; y++){
    var row=stuff[y];
    var drow=blockdata[y];
    for(var x=0; x<row.length; x++){
      var type=row[x];
      var data=drow[x];
      
      var rt = getBlock(x+1, y);
      var lf = getBlock(x-1, y);
      var up = getBlock(x, y-1);
      var dn = getBlock(x, y+1);
      
      var bestStrength = Math.max(
        rt ? rt.data.signalStrength : 0,
        lf ? lf.data.signalStrength : 0,
        up ? up.data.signalStrength : 0,
        dn ? dn.data.signalStrength : 0
      );
      
      if(type === "rs"){
        data.signalStrength = (bestStrength < 1) ? 0 : bestStrength - 1;
      }
    }
  }
};

Generate();
draw= function() {
    background(255, 255, 255);
    
    
    calc();
    render();
    
    renderBtns();
};