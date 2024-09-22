// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Feb 24, 2021
String.prototype.splice = function(start, delCount, newSubStr) {return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));};
var TextBoxs = [];
mouseClicked = function(){
  for(var i=0; i<TextBoxs.length; i++){
    TextBoxs[i].mouseClicked();
  }
};
keyTyped = function(){
  for(var i=0; i<TextBoxs.length; i++){
    TextBoxs[i].keyTyped();
  }
};
keyPressed = function(){
  for(var i=0; i<TextBoxs.length; i++){
    TextBoxs[i].keyPressed();
  }
};
function TextBox(info){
  TextBoxs.push(this);
  
  info = info || {};
  
  this.x = info.x || 0;
  this.y = info.y || 0;
  this.w = info.width || 200;
  this.h = info.height || 20;
  
  this.borderWidth = info.borderWidth || 2;
  this.borderColor = info.borderColor || color(0);
  this.color = info.color || color(0);
  this.caretColor = info.caretColor || this.color;
  this.caretWidth = info.caretWidth || 2;
  this.backgroundColor = info.backgroundColor || color(255);
  this.fontFamily = info.fontFamily || createFont("sans-serif");
  
  this.textHeight = info.fontSize || 12;
  this.chars = info.numbersOnly ? "1234567890-=+" : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890`~!@#$%^&*()-=_+[]{}\\|;:'\",.<>/?";
  
  this.caretBlink = 0;
  this.text = info.text || "";
  this.hasFocus = info.hasFocus || false;
  this.caretIndex = 0;
  this.caretX = 0;
  this.caretY = 0;
  this.scrollX = 0;
}
TextBox.prototype.draw = function(){
  fill(this.backgroundColor);
  stroke(this.borderColor);
  strokeWeight(this.borderWidth);
  
  rect(this.x, this.y, this.w, this.getHeight());
  
  textFont(this.fontFamily);
  
  fill(this.color);
  textAlign(LEFT, CENTER);
  textSize(String(this.textHeight));
  text(this.text, this.x+this.borderWidth-this.scrollX, this.y+(this.getHeight()/2));
  
  this.caretBlink ++;
  if(this.caretBlink > 60){
    this.caretBlink = 0;
  }
  
  var caretX = textWidth(this.text.substring(0,this.caretIndex)) + this.borderWidth + this.x - this.scrollX;
  var caretY = this.y+this.getHeight()/2;
  if(this.hasFocus && this.caretBlink < 35){
    strokeWeight(this.caretWidth);
    stroke(this.caretColor);
    line(caretX, caretY-(this.textHeight/2), caretX, caretY+(this.textHeight/2));
  }
};
TextBox.prototype.keyTyped = function(){
  var char = String.fromCharCode(key);
  if((this.chars.indexOf(char)>-1)&&this.hasFocus){
    this.text = this.text.splice(this.caretIndex, 0, char);
    this.caretIndex++;
    this.updateCaretPos(1);
  }
  
  this.caretBlink = 0;
};
TextBox.prototype.keyPressed=function(){
  if(this.hasFocus){
    if(keyCode === 39){
      this.caretIndex++;
      this.updateCaretPos(1);
    }
    if(keyCode === 37){
      this.caretIndex--;
      this.updateCaretPos(-1);
    }
    if(keyCode === 8){
      this.text = this.text.splice(this.caretIndex-1,1,"");
      this.caretIndex--;
      this.updateCaretPos(-1);
      if(this.caretIndex<0){this.caretIndex=0;}
    }
    if(this.caretIndex<0){this.caretIndex=0;}
    if(this.caretIndex>this.text.length){this.caretIndex=this.text.length;}
    this.caretBlink=0;
    //println(parseInt(keyCode,10));
  }
};
TextBox.prototype.caretAtMouse = function(){
  textSize(String(this.textHeight));
  var s = this.text;
  var width = 0;
  var i = 0;
  var b = textWidth(s.substr(i, 1)) / 2;
  
  while (width + b < mouseX - this.x - this.borderWidth + this.scrollX && i < s.length) {
    i++;
    width = textWidth(s.substr(0, i));
    b = textWidth(s.substr(i, 1)) / 2;
  }
  return i;
};
TextBox.prototype.mouseClicked = function(){
  if(this.getHover()){
    this.hasFocus = true;
    this.caretIndex = this.caretAtMouse();
    this.caretBlink = 0;
  }else{
    this.hasFocus = false;
  }
};
TextBox.prototype.updateCaretPos = function(t){
  var caretX = (textWidth(this.text.substring(0,this.caretIndex)) + this.borderWidth) - this.scrollX;
  if(t === 1){
    if(caretX > this.w){
      this.scrollX = textWidth(this.text.substring(0,this.caretIndex)) + (-this.w) + this.borderWidth + this.caretWidth;
    }
  }if(t === -1){
    if(caretX < 0){
      this.scrollX = textWidth(this.text.substring(0,this.caretIndex));
    }
  }
};
TextBox.prototype.getHeight=function(){
  return Math.max(this.textHeight, this.h) + (this.borderWidth*2);
};
TextBox.prototype.getHover = function(){
  return mouseX > this.x           &&
         mouseX < this.x + this.w  &&
         mouseY > this.y           &&
         mouseY < this.y + this.getHeight();
};


var myBox = new TextBox({
    x:100,
    y:100,
    fontFamily:createFont("Courier New"),
    fontSize:20
});
draw = function(){
  background(255);
  myBox.draw();
};