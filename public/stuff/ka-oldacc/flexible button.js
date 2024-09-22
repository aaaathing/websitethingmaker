// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Jan 12, 2021
var Button = function(x,y,w,h,label){
  this.x=x;
  this.y=y;
  this.w=w;
  this.h=h;
  this.hover="none";
  this.label=label;
};
Button.prototype.draw=function(){
  fill(255, 255, 255);
  rect(this.x, this.y, this.w, this.h);
  
  fill(0, 0, 0);
  textAlign(CENTER,CENTER);
  textSize(min(this.w,this.h)/2);
  text(this.label, this.x, this.y, this.w, this.h);
};
Button.prototype.setHover=function(hover){
  this.hover = hover;
};

var myBtn = new Button(100,100,128,130,"hi");
myBtn.draw();