// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Oct 8, 2020
    var press=false;
    var tog=0;
var txtcenterx=function(x,y,w,h,txtsiz,txtl){
var btnmidx=x+(w/2);


return btnmidx-(txtsiz*txtl/3.5);

};

var Button=function(x,y,w,h,txt){

    fill(255, 255, 255);
    rect(x,y,w,h);
    
    if(mouseX>(x)&&mouseX<(x+w)&&mouseY>(y)&&mouseY<(y+h)){
    
    fill(255,0,255);
    rect(x,y,w,h);
    
    if(mouseIsPressed){
        return(true);
    }
    
    }else{
    
    fill(255, 0, 0);
    rect(x,y,w,h);
    }
    
    fill(255, 255, 255);
    textSize((w+h)/4);
    textFont(createFont("monospace"));
    text(txt, txtcenterx(x,y,w,h,(w+h)/4,txt.length), y+(h/1.5));
    

};


draw= function() {
    background(255, 255, 255);
    
    /**The buttons
    @wow it change clor*//*
    unfair! im green
    */
    
    {
    var button1 = Button(200,200,100,100,"hi");

    fill(0, 255, 0);
    if(button1){
        rect(300,100,30,30);
    }
    }/*button1*/

    
    {var button2 = Button(300,300,60,60,"d");
        if(press){
            if(!mouseIsPressed){
                press=false;
                
                    if(tog===1){
                        tog=0;
                    }else{
                        tog=1;
                    }
                
            }
        }else if(button2){
            if(mouseIsPressed){
                press=true;
            }
        }
        
    if(tog===1){
        fill(255, 0, 238);
        rect(200,200,20,20);
    }
    }/*button2*/
    
    if(Button(100,100,100,100,"?")){/*here is a simple way to render a button*/
        text("wow",100,100);}
};
