// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Jan 6, 2021
/*
An attempt of making a window manager. It was called an OS because i did not know what OS really meant

Password is "chicky"

Once you log in, you can click on one of the icons on screen. 
You find out by yourself what it does.
*/

var scene="start";
var backImgs = [
    getImage("animals/birds_rainbow-lorakeets"),
    getImage("animals/cat"),
    getImage("animals/dog_sleeping-puppy"),
    getImage("animals/horse"),
    getImage("animals/komodo-dragon"),
    getImage("animals/rabbit"),
    getImage("animals/shark"),
    getImage("animals/snake_green-tree-boa"),
    getImage("landscapes/beach-waves-at-sunset"),
    getImage("landscapes/beach-sunset"),
    getImage("landscapes/beach-with-palm-trees"),
    getImage("landscapes/clouds-from-plane"),
    getImage("landscapes/fields-of-wine"),
    getImage("landscapes/lava"),
    getImage("landscapes/mountain_matterhorn"),
    getImage("landscapes/mountains-in-hawaii"),
    getImage("food/bananas"),
    getImage("food/berries"),
    getImage("food/cake"),
    getImage("food/croissant"),
    getImage("food/fruits"),
    getImage("food/grapes"),
    getImage("food/strawberries"),
    getImage("food/tomatoes"),
    getImage("animals/cheetah"),
    getImage("animals/butterfly"),
    getImage("animals/butterfly_monarch"),
    getImage("animals/crocodiles"),
    getImage("animals/dogs_collies"),
    getImage("animals/fox"),
    getImage("animals/horse"),
    getImage("animals/penguins"),
    getImage("animals/retriever"),
    getImage("animals/spider"),
    getImage("landscapes/beach-at-dusk"),
    getImage("landscapes/beach-in-hawaii"),
    getImage("landscapes/beach"),
    getImage("landscapes/crop-circle"),
    getImage("landscapes/fields-of-grain"),
    getImage("landscapes/lake"),
    getImage("landscapes/lotus-garden"),
    getImage("landscapes/mountains-sunset"),
    getImage("landscapes/sand-dunes"),
    getImage("landscapes/waterfall_niagara-falls")
];
var backImg = backImgs[floor(random(1,backImgs.length))];

var time={};
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


var padZero = function(num) {
    var numDigits = 2;
	var n = abs(num);
	var zeros = max(0, numDigits - floor(n).toString().length );
	var zeroString = pow(10, zeros).toString().substr(1);
	return zeroString + n;
};
var calculateWeekday = function(){
    var mcode = 0;
    var ycode = 0;
    
    var m = time.mo;
    var y = time.ye;
    var d = time.da;
    
    //JANUARY MCODE
    if (m === 1 && floor(y/4) < y/4){
        mcode = 6;    
    }
   
    else if (m === 1 && floor(y/4) === y/4){
        mcode = 5;
    }
    if (m === 1 && floor(y/100) === y/100){
    mcode = 6;    
    }
    if (m === 1 && floor(y/400) === y/400){
    mcode = 5;    
    }    
    //FEBRUARY MCODE
    else if (m === 2 && floor(y/4) < y/4){
        mcode = 2;
    }
    
    else if (m === 2 && floor(y/4) === y/4){
        mcode = 1; 
    }
    if (m === 2 && floor(y/100) === y/100){
    mcode = 2;    
    }
    if (m === 2 && floor(y/400) === y/400){
    mcode = 1;    
    }     
    //REST OF MONTHS
    else if (m === 3){
        mcode = 2;
    }
    else if (m === 4){
    mcode = 5;
    }
    else if (m === 5){
        mcode = 0;
    }
    else if (m === 6){
        mcode = 3;
    }
    else if (m === 7){
        mcode = 5;
    }
    else if (m === 8){
    mcode = 1;
    }
    else if (m === 9){
        mcode = 4;
    }    
    else if (m === 10){
        mcode = 6;
    }    
    else if (m === 11){
        mcode = 2;
    }    
    else if (m === 12){
        mcode = 4;
    }
    //RANDOM YCODE STUFF
    var y3 = floor(y/1000) * 1000;
    var y5 = y - y3;
    var y4 = floor(y5/100)*100;
    var y2 = y3 + floor(y/100);
    ycode = y - y2; 
    if (y > 1899 && y < 2000){
        ycode = y - 1900;    
    
    }
    if(y < 2100 && y > 1999){
        ycode = y - 2000;
    }
    
   
    
       
    var yadd = floor(ycode/4);
   

      
    ycode += yadd;
    if (y > 1799 && y < 1900){
    ycode +=3;    
    
    }    
    if (y > 1899 && y < 2000){
        ycode++ ;
    }    
    if (y > 1699 && y < 1800){
        ycode+=5;    
    
    }     
    if (y === 2000 || y === 1600  || y  === 1200 || y === 2400 || y === 2800 ){
        ycode = 0; 
    }                         
    if (y === 1900 || y === 1500 || y  === 1100 || y === 2300 || y === 2700 ){
        ycode = 1; 
    }     
    //THE CODE STUFF   
    var code = ycode + d + mcode;
    code %=7;
      

    

    //WRITING THE DAYS 
    if (code === 0){                    
        return "Sunday";
    }
    if (code === 1){
        return "Monday";
    }    
    if (code === 2){
        return "Tuesday";
    }    
    if (code === 3){
        return "Wednesday";
    }     
        if (code === 4){
        return "Thursday";
    }
        if (code === 5){
        return "Friday";
    }
        if (code === 6){
        return "Saturday";
    }
};
var updateTime = function(){
    time = {ye: year(), mo: month(), moy: months[month()-1], da: day(), dow: weekdays[0], ho: hour(), mi: minute(), se: second(), AmPm: "AM"};
    time.dow = calculateWeekday();
    if(time.ho >= 12){
        time.AmPm = "PM";
    }
    if(time.ho === 0){
        time.ho = 12;
    }
    if(time.ho > 12){
        time.ho -= 12;
    }
    time.mi = padZero(time.mi);
};

image(backImg, 0, 0, 800, 400);
filter(BLUR, 8);
var BlurBackImg = get(0, 0, 800, 400);

var removeLastChar=function(string,n){
    var newstr="";
    for(var i=0;i<string.length-n;i++){
        newstr=newstr+string[i]+"";
    }
    return newstr;
};
var shadowText = function(t,x,y){
  fill(0, 0, 0);
  text(t,x-2,y);
  text(t,x+2,y);
  text(t,x,y-2);
  text(t,x,y+2);
  
  fill(255, 255, 255);
  text(t,x,y);
};

var icons={
  windows:function(x, y, size) {
    pushMatrix();
        translate(x-10, y);
        scale(size);
        
        fill(255, 255, 255);
        noStroke();
        
        beginShape();
        vertex(28, 43);
        vertex(112, 30);
        vertex(112, 110);
        vertex(29, 109);
        vertex(28, 41);
        endShape();
        
        beginShape();
        vertex(232, 12);
        vertex(232, 109);
        vertex(122, 109);
        vertex(122, 28);
        endShape();
        
        beginShape();
        vertex(28, 118);
        vertex(113, 119);
        vertex(113, 198);
        vertex(28, 186);
        vertex(28, 118);
        endShape();
        
        beginShape();
        vertex(123, 120);
        vertex(232, 120);
        vertex(231, 214);
        vertex(123, 200);
        vertex(122, 123);
        endShape();
    popMatrix();
},
  fileExplorer:function(x, y, s){
    rectMode(CORNER);
    pushMatrix();
        translate(-59, -84);
        translate(x, y);
        scale(s);
        
        noStroke();
        fill(-141979);
        rect(59, 107, 280, 199, 22);
        
        fill(-3044864);
        rect(59, 84, 118, 47, 17);
        triangle(172, 87, 173, 127, 196, 106);
        
        fill(-13003300);
        rect(105, 201, 189, 46, 157);
        rect(105, 224, 48, 93);
        rect(245, 224, 48, 93);
    popMatrix();
},
  chrome:function(x, y, s){
    noStroke();
    fill(242, 56, 65);
    arc(x, y, s, s, -150, -30);
    fill(240, 200, 39);
    arc(x, y, s, s, -30, 90);
    fill(38, 191, 69);
    arc(x, y, s, s, 90, 210);
    triangle(x + s/4.3, y + s/11, x, y + s/2, x, y);
    fill(242, 65, 71);
    triangle(x - s/4.4, y + s/10, x - s/2.31, y - s/3.9, x, y);
    fill(235, 187, 30);
    triangle(x, y - s/4, x + s/2.31, y - s/3.9, x, y);
    fill(15, 12, 15, 20);
    triangle(x + s/4.4, y + s/10, x, y + s/2, x + s/7, y);
    triangle(x - s/4.4, y + s/9, x - s/2.31, y - s/3.9, x, y + s/7);
    fill(255, 255, 255);
    ellipse(x, y, s/2, s/2);
    fill(84, 144, 240);
    ellipse(x, y, s/2 - s/10, s/2 - s/10);
},
  calculater:function(x, y, s){
    pushMatrix();
        translate(x, y);
        scale(s);
        
        noStroke();
        fill(-7761770);
        rect(120, 82, 159, 221, 15);
        
        fill(0, 0, 0, 100);
        rect(140, 105, 124, 41, 4);
        fill(-11738884);
        rect(138, 102, 124, 41, 4);
        
        for(var x = 0; x < 3; x ++){
            for(var y = 0; y < 3; y ++){
                fill(0, 0, 0, 60);
                rect(142+x*42, 157+y*45, 36, 37, 1);
                fill(-3550760);
                rect(140+x*42, 155+y*45, 36, 37, 1);
            }
        }
        
        fill(-15449216);
        rect(224, 200, 37, 82, 2);
        
    popMatrix();
},
  notification:function(x, y){
    pushMatrix();
        translate(x-555, y-371);
        
        noStroke();
        fill(255, 255, 255);
        rect(555, 371, 25, 18);
        triangle(555, 379, 580, 379, 567, 395);
    popMatrix();
},
  paper:function(x,y){
    fill(235, 235, 235);
    stroke(0, 0, 0);
    strokeWeight(1);
    rectMode(CENTER);
    rect(x,y-20,50,60);
    line(x-20, y-30, x+20, y-30);
    line(x-20, y-20, x+20, y-20);
    line(x-20, y-10, x+20, y-10);
  },
  image:function(x,y){
    fill(201, 244, 255);
    stroke(0, 0, 0);
    strokeWeight(1);
    rectMode(CENTER);
    rect(x,y-20,50,60);
    
    fill(255, 255, 0);
    ellipse(x-10, y-40,10,10);
    
    fill(0, 150, 0);
    triangle(x-10,y+10,x+10,y-10,x+25,y+10);
    fill(0, 100, 0);
    triangle(x-20,y+10,x,y-10,x+10,y+10);
  },
  app:function(x,y){
    fill(235, 235, 235);
    stroke(0, 0, 0);
    strokeWeight(1);
    rectMode(CENTER);
    rect(x,y-20,70,60);
    fill(122, 220, 255);
    rect(x-20,y-20,25,50);
    fill(255, 255, 255);
    rect(x+15,y-20,30,50);
    
    line(x+5,y-50,x+25,y-50);
    line(x+5,y-40,x+25,y-40);
    line(x+5,y-30,x+25,y-30);
    line(x+5,y-20,x+25,y-20);
  }
};
var getIcon=function(name){
  var icon;
  if(name==="folder"){
    icon=icons.fileExplorer;
  }else if(name==="txt"){
    icon=icons.paper;
  }else if(name==="img"){
    icon=icons.image;
  }else if(name==="app"){
    icon=icons.app;
  }else{
    icon=icons.windows;
  }
  return icon;
};

var files=[
  {
    name:"MyText",
    type:"txt",
    content:"hello"
  },{
    name:"this text",
    type:"txt",
    content:"This is a text file!"
  },{
    name:"Lorem Ipsum",
    type:"txt",
    content:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    name:"The folder with text",
    type:"folder",
    files:[
      "MyText",
      "this text",
      "Lorem Ipsum"
    ]
  },
  
  {
    name:"Good day",
    type:"txt",
    content:"Good day, fellow!"
  },
  
  {
    name:"Some Folder",
    type:"folder",
    files:[
      "borg text",
      "Some Folder 2"
    ]
  },{
    name:"borg text",
    type:"txt",
    content:"text"
  },{
    name:"Some Folder 2",
    type:"folder",
    files:[
      "Some Folder 3"
    ]
  },{
    name:"secret \n(dont open)",
    type:"txt",
    content:"It wouldn't be a secret if \nI told you."
  },{
    name:"Some Folder 3",
    type:"folder",
    files:[
      "secret \n(dont open)"
    ]
  },
  
  {
    name:"Images",
    type:"folder",
    files:[
      "WinstonImg",
      "Oh Noes"
    ]
  },{
    name:"WinstonImg",
    type:"img",
    img:getImage("creatures/Winston")
  },{
    name:"Oh Noes",
    type:"img",
    img:getImage("creatures/OhNoes")
  },
  
  {
    name:"simple game",
    type:"app",
    vars:{score:0},
    init:function(vars){
      background(255,0,0);
    },
    draw:function(vars){
      if(mouseIsPressed){
        vars.score++;
      }
      textAlign(LEFT);
      fill(0);
      text("if(mouseIsPressed){\n  score++;\n}",200,150);
      if(vars.score > 1000){
        background(0,255,0);
        text("you win",200,150);
      }
      
      text("score: "+vars.score,200,250);
    }
  }
];
var desktop=[
  {
    path:"The folder with text",
    x:1,
    y:1
  },{
    path:"Good day",
    x:2,
    y:1
  },{
    path:"Some Folder",
    x:3,
    y:1
  },{
    path:"Images",
    x:1,
    y:3
  },{
    path:"simple game",
    x:3,
    y:3
  }
];
function getFile(name){
    var file;
    for(var i=0; i<files.length; i++){
        file = files[i];
        if(file.name === name){
            break;
        }
    }
    return file;
}

var currentWindow=[];

var sceneVars={
  toLogin:{
    trans:0
  },
  login:{
    password:"chicky",
    passBoxFocus:false,
    textCursorFlash:0,
    passText:"",
    wrongPass:false
  },
  desktopLoad:{
    wait:100
  }
};

var mousedn=false;

var sceneFuncs={
  start:function(){
    background(255, 255, 255);
    image(backImg,0,0,800,400);
    
    updateTime();
    
    fill(255, 255, 255);
    textSize(60);
    text(time.ho+":"+time.mi,30,320);
    textSize(40);
    text(time.dow + ", " + time.moy + " " + time.da, 30, 360);
    
    mouseClicked=function(){
      scene="toLogin";
    };
  },
  toLogin:function(vars){
    background(255, 255, 255);
    vars.trans+=2;
    if(vars.trans>5){
        vars.trans=5;
        scene="login";
    }
    image(backImg,0,0,800,400);
    filter(BLUR, vars.trans);
  },
  login:function(vars){
    image(BlurBackImg, 0, 0, 800,400);
    pushMatrix();
     translate(400,200);
     
     fill(255, 255, 255, 80);
     noStroke();
     ellipse(0,-100,150,150);
     strokeCap(SQUARE);
     stroke(255, 255, 255);
     strokeWeight(4);
     noFill();
     ellipse(0, -115, 45, 45);
     arc(0, -60, 60, 60, -180, 0);
     
     fill(255, 255, 255);
     textSize(40);
     text("User", -40,10);
     
     if(vars.wrongPass){
        fill(255, 255, 255);
        textSize(15);
        text("Wrong password", -58,30);
     }
     
     mouseClicked=function(){
        //println(mouseX+"   "+mouseY);
        
        if((mouseX>274)&&(mouseY>234)&&(mouseX<524)&&(mouseY<264)){
          vars.passBoxFocus=true;
        }else{
          vars.passBoxFocus=false;
          vars.textCursorFlash=0;
        }
        if((mouseX>524)&&(mouseY>234)&&(mouseX<555)&&(mouseY<264)){
            if(vars.passText===vars.password){
              scene="desktopLoad";
            }else{
              vars.wrongPass=true;
            }
        }
     };
     keyPressed=function(){
        //println(keyCode);
        if(vars.passBoxFocus){
          var theKey = String.fromCharCode(key);
          if(keyCode===8){
            vars.passText=removeLastChar(vars.passText,1);
          }else if(keyCode===16){
            
          }else if(keyCode===10){
            scene="desktopLoad";
          }else{
            vars.passText+=theKey;
          }
        }
     };
     
     if(vars.passBoxFocus){
        vars.textCursorFlash++;
        if(vars.textCursorFlash>80){
            vars.textCursorFlash=0;
        }
        if(vars.textCursorFlash<50){
            
        }
     }
     
     rectMode(CENTER);
     strokeWeight(2);
     fill(0, 0, 0, 80);
     stroke(255, 255, 255);
     if(vars.passBoxFocus){
        fill(255, 255, 255);
        stroke(97, 97, 97);
     }
     rect(0,50,250,30);
     
     
     fill(255, 255, 255);
     if(vars.passBoxFocus){
        fill(97, 97, 97);
     }
     textSize(15);
     if(vars.passText===""){
       text("Password", -115, 55);
     }
     
     if((vars.textCursorFlash<50)&&vars.passBoxFocus){
        text(vars.passText+"|", -115, 55);
     }else{
        text(vars.passText, -115, 55);
     }
     
     if((mouseX>274)&&(mouseY>234)&&(mouseX<524)&&(mouseY<264)){
        cursor("text");
     }
     
     rectMode(CENTER);
     strokeWeight(2);
     fill(0, 0, 0, 80);
     stroke(255, 255, 255);
     rect(140,50,30,30);
     
     stroke(255, 255, 255);
     line(130, 50, 148, 50);
     line(148, 50, 140, 40);
     line(148, 50, 140, 60);
    popMatrix();
  },
  desktopLoad:function(vars){
    background(0, 145, 255);
    
    textSize(50);
    fill(255, 255, 255);
    text("One moment...",200,100);
    
    vars.wait--;
    if(vars.wait<0){
        scene="desktop";
    }
    
    noFill();
    stroke(255, 255, 255);
    strokeWeight(20);
    pushMatrix();
      translate(400,200);
      rotate(vars.wait*4);
      arc(0, 0, 100, 100, -180, -90);
    popMatrix();
  },
  desktop:function(){
    background(255, 255, 255);
    imageMode(CORNER);
    image(backImg, 0, 0, 800, 400);
    
    rectMode(CORNER);
    
    keyPressed=function(){};
    mouseClicked=function(){
      mousedn=true;
    };
    
    var i;
    for(i=0; i<desktop.length; i++){
      var thing=desktop[i];
      var x = thing.x * 120;
      var y = thing.y * 120;
      
      var icon = getIcon(getFile(thing.path).type);
      icon(x, y, 0.3);
      
      textSize(15);
      textAlign(CENTER);
      shadowText(thing.path,x,y+30);
      
      if((mouseX>x-50)&&(mouseX<x+50)&&(mouseY>y-50)&&(mouseY<y+50)){
        if(mousedn && (currentWindow.length<1)){
          currentWindow.push({
            path:thing.path
          });
          mousedn=false;
        }
      }
    }
    
    if(currentWindow.length>0){
      var nowWindow=currentWindow[currentWindow.length-1];
      
      rectMode(CORNER);
      noStroke();
      fill(0, 0, 0, 90);
      rect(0,0,800,400);
      
      rectMode(CENTER);
      fill(219, 219, 219);
      rect(400,50,600,50);
      
      fill(0, 0, 0);
      textSize(20);
      textAlign(CENTER);
      text(nowWindow.path, 400, 45);
      
      stroke(0, 0, 0);
      strokeWeight(2);
      fill(255, 255, 255);
      rect(400,200,600,300);
      
      var theWin;
      var i;
      for(i=0; i<files.length; i++){
        var thing=files[i];
        if(thing.name===nowWindow.path){
          theWin=thing;
          break;
        }
      }
      
      if(theWin.type==="txt"){
        textSize(20);
        textAlign(LEFT);
        fill(0, 0, 0);
        text(theWin.content, 110, 80,580,300);
      }else if(theWin.type==="img"){
        imageMode(CENTER);
        image(theWin.img, 400,200, 600,300);
      }else if(theWin.type==="app"){
        if(!nowWindow.vars){
            nowWindow.vars = Object.assign({}, theWin.vars);
            theWin.init(nowWindow.vars);
        }
        theWin.draw(nowWindow.vars);
      }else if(theWin.type==="folder"){
        var i;
        var x=0,y=150;
        var thoseFiles=theWin.files;
        for(i=0; i<thoseFiles.length; i++){
          var thing=thoseFiles[i];
          for(var i2=0; i2<files.length; i2++){
            var IsFile=files[i2];
            if(IsFile.name===thing){
              thing=IsFile;
              break;
            }
          }
          
          x+=150;
          if(x>600){
            x=0;
            y+=150;
          }
          
          
          var icon = getIcon(thing.type);
          icon(x, y, 0.3);
          
          fill(0, 0, 0);
          textSize(15);
          textAlign(CENTER);
          text(thing.name, x,y+50);
          
          if((mouseX>x-50)&&(mouseX<x+50)&&(mouseY>y-50)&&(mouseY<y+50)){
            if(mousedn){
              currentWindow.push({
                path:thing.name
              });
              mousedn=false;
            }
          }
        }
      }
      
      //red dot to close window
      fill(255, 0, 0);
      if((mouseX>670)&&(mouseX<690)&&(mouseY>30)&&(mouseY<50)){
        fill(240, 0, 0);
        if(mousedn){
          currentWindow.pop(); 
          mousedn=false;
        }
      }
      ellipse(680, 40 ,20,20);
    }
    mousedn=false;
  }
};
draw = function() {
    cursor("auto");
    sceneFuncs[scene](sceneVars[scene]);
};


if(width !== 800){
    throw{
        message:"Your width is \""+width+"\" and it is wrong. Go add this to the url \"?width=800\""
    };
}