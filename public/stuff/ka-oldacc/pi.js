// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 17, 2020
angleMode = "radians";

function linesplit(xp,yp,radius,lines){
    for(var i=0;i<lines;i++){
        var theta = (2 * PI / lines) * i;
        
        var x = radius * cos(theta);
        var y = radius * sin(theta);
        line(0+xp, 0+yp, x+xp, y+yp);
    }
}
var linesn=1;
var speed=0.01;

draw= function() {
    linesn+=speed;
    if(linesn>200||linesn<1){
        speed=-speed;
    }
    fill(255, 255, 255,1);
    rect(0,0,width,height);
    linesplit(200,200,200,linesn);
    
    _clearLogs();
    println("\t\t\tPI:");
    println("Javascript says:   "+Math.PI);
    println("Google says:       "+3.14159265359);
    println("There are "+ceil(linesn)+" lines here. The lines are "+(speed>0?"increasing":"decreasing")+".");
};
