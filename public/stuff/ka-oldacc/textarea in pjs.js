// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Jan 29, 2021
function textarea(value,x, y, w, h){
    this.value = value;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.xW = x+w;
    this.yH = y+h;
    
    this.focus = false;
    this.prevFocus = false;
    
    this.allow="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    this.mouseDown = false;//detect if mouse pressed
}
textarea.prototype.onKeyPress=function(){
    if(this.focus){
        var char = String.fromCharCode(key).toString();
        if(this.allow.indexOf(char)>0){
            this.value += char;
        }
    }
};
textarea.prototype.onClick=function(){
    this.prevFocus = this.focus;
    if((mouseX>this.x)&&(mouseX<this.xW)&&(mouseY>this.y)&&(mouseY<this.yH)){
        this.focus = true;
    }else{
        this.focus = false;
    }
};
textarea.prototype.draw = function(){
    if(mouseIsPressed && (!this.mouseDown)){
        this.mouseDown = true;
    }
    if((!mouseIsPressed) && this.mouseDown){
        this.mouseDown = false;
        this.onClick();
    }
    
    if((!this.prevFocus)&&this.focus){
        
    }
    
    
    strokeWeight(2);
    stroke(0, 0, 0);
    fill(255,255,255);
    rectMode(CORNER);
    rect(this.x, this.y, this.w, this.h);
    
    fill(0,0,0);
    textAlign(LEFT, CENTER);
    text(this.value, this.x, this.y, this.w, this.h);
};




var textbox = new textarea("Hi", 100,100,200,100);
keyPressed=function(){
    textbox.onKeyPress();
};
draw = function(){
    background(255,255,255);
    try{
      textbox.draw();
    }catch(e){
        noLoop();
        println(e);
    }
};