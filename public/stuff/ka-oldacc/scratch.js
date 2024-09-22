// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Mar 2, 2021
var Button = function(x,y,w,h,label){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    
    this.borderColor = color(0);
    this.borderWidth = 2;
    this.borderRadius = undefined;
    this.fontColor = color(0);
    this.fontFamily = createFont("sans-serif");
    this.fontSize = 15;
    this.backgroundColor = color(200);
    
    this.onclick = null;
    this.mousePressed = false;
};
Button.prototype.collide = function(){
    return mouseX > this.x && 
           mouseX < this.x+this.w &&
           mouseY > this.y &&
           mouseY < this.y+this.h;
};
Button.prototype.draw = function(){
    if(mouseIsPressed !== this.mousePressed){
        if(mouseIsPressed && this.collide()){
            this.mousePressed = true;
        }
        if(!mouseIsPressed && this.mousePressed && this.collide()){
            if(typeof this.onclick === "function"){
                this.onclick();
            }
        }
        
        this.mousePressed = mouseIsPressed;
    }
    
    fill(this.backgroundColor);
    stroke(this.borderColor);
    strokeWeight(this.borderWidth);
    rect(this.x, this.y, this.w, this.h, this.borderRadius);
    
    fill(this.fontColor);
    textAlign(CENTER, CENTER);
    text(this.label, this.x+(this.w/2), this.y+(this.h/2));
};


var scratchblocks = [];

var blockColors = [
    {
        name:"motion",
        color:color(0,0,255),
        blocks:[
          "go to x: y:",
          "set x to",
          "set y to"
        ]
    }
];
function getBlockColor(name, dataType){
    var blockColor;
    var found = false;
    for(var i=0; i<blockColors.length; i++){
        blockColor = blockColors[i];
        if(blockColor.blocks.indexOf(name) > -1){
            found = true;
            break;
        }
    }
    
    if(found){
        if(dataType === "obj"){
            return blockColor;
        }else{
            return blockColor.color;
        }
    }else{
        if(dataType === "obj"){
            return{};
        }else{
            return color(255,0,0);
        }
    }
}
function renderBlock(x,y,name,inputs){
    var color = getBlockColor(name);
    
    fill(color);
    strokeWeight(0);
    textSize(15);
    rect(x,y, Math.max(textWidth(name)+20, 50), 40);
    
    fill(255);
    textAlign(LEFT, CENTER);
    text(name, x+10, y+20);
}

draw = function(){
    background(255);
    renderBlock(100,100,"set x to",[5]);
};
