// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Feb 19, 2021
background(173, 118, 35);
strokeWeight(1.25);
fill(255);
ellipse(200, 200, 350, 350); // plate
ellipse(200, 200, 300, 300);
var plate = get(0,0,400,400);

var buttonSize = 100;
draw = function(){
  cursor("auto");
  
  background(255);
  
  image(plate,0,0);
  var btnColor = [255,0,0];
  if(mouseX>150 && mouseY>150 && mouseX<250 && mouseY<250){
    btnColor = [220, 0, 0];
    cursor("pointer");
    
    buttonSize += (120 - buttonSize) / 4;
  }else{
    buttonSize += (100 - buttonSize) / 4;
  }
  rectMode(CENTER);
  fill(255,0,150);
  rect(200,200,buttonSize, buttonSize);
  fill(btnColor[0], btnColor[1], btnColor[2]);
  rect(200,200,100,100);
  fill(255);
  textSize(18);
  textAlign(CENTER);
  text("Click me", 200,200);
};


var win = function(){return this;}();
var doc = win[["document"]];

/*jshint multistr: true*/
var style = doc[["createElement"]]("style");
style.innerHTML = "\
  #myLinkToMyProject{\
    background:white;\
    position:absolute;\
    top:0;\
    left:0;\
    display:inline-block;\
    color:white;\
    padding:20px;\
    background:red;\
    text-decoration:none;\
    font-size:18px;\
    border:2px solid black;\
  }\
  #myLinkToMyProject:hover{\
    background:rgb(220,0,0);\
  }\
  #myLinkToMyProject::before{\
    background:yellow;\
    position:absolute;\
    top:0;\
    left:0;\
  }\
  ";
doc.head.appendChild(style);

mouseClicked = function(){
  if(mouseX>150 && mouseY>150 && mouseX<250 && mouseY<250){
    if(doc[["getElementById"]]("myLinkToMyProject")){
      
    }else{
      var link = doc[["createElement"]]("a");
      link.href = "https://www.khanacademy.org/computer-programming/buttons-arent-useful-here/5169829929238528";
      link.innerHTML = "click here!";
      link.id = "myLinkToMyProject";
      doc.body.appendChild(link);
    }
  }
};