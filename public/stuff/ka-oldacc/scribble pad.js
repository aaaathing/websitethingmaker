// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 9, 2020
var scribbles=[];
function lines(){
    for(var i=2;i<scribbles.length;i+=2){
        line(scribbles[i-2],scribbles[i-1],scribbles[i],scribbles[i+1]);
    }
}

function addline(){
    if(!((mouseX===pmouseX)||(mouseY===pmouseY))){
        scribbles.push(mouseX);
        scribbles.push(mouseY);
        
        /*_clearLogs();
        println(scribbles);*/
    }
}

draw=function(){
background(255, 255, 255);
if(mouseIsPressed){
    addline();
}
lines();
};