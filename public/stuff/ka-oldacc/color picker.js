// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 2, 2020
frameRate(60);


//DeKhan function from
//https://www.khanacademy.org/computer-programming/dekhan-the-code/5149916573286400
var DeKhan = (function() {
    /* Regular expressions derived from Element118 delag() function. */
    var plusPlusExp = new RegExp("__env__\\.KAInfiniteLoopCount\\+\\+;\\n", "g");
    var ifClauseExp = new RegExp("\\n\\s*if \\(__env__\\.KAInfiniteLoopCount > 1000\\) {[\\s]+__env__\\.KAInfiniteLoopProtect\\('[^']*'\\);[^}]+}", "g");
    var newExp = new RegExp("__env__\\.PJSCodeInjector\\.applyInstance\\((\\S+), '\\S+'\\)", "g");
    var envExp = new RegExp("__env__\\.", "g");
    var noBreakSpace = "\u00a0";  /* primenumbers7532@gmail.com */
    var lineBreak = String.fromCharCode(10);  /* Larry Serflaten for IE Windows */
    var spaceExp = new RegExp(" ", "g");
    var newlineExp = new RegExp("\\n", "g");
    var wasFrameCount = frameCount;
    frameCount = function() {
        frameCount = wasFrameCount;
        return this;
    };
    var globals = frameCount();
    var F = Object.constructor;  /* Javascript Function (capital F) constructor */
    var metIpseMecum = (0 || arguments).callee;
    
    /* Given source code, return a function in the global scope. */
    var conjureFunctionFrom = function (source) {
        /* Copied from Element118, clarence99chew@gmail.com, delag() function. */
        return F('return (function(__env__) {return ' + source + ';});')()(globals);
    };
    
    return {
        /* Return a function like f without any loop detection. */
        loopDetect: function(f) {
            var source = f.toString();
            source = source.replace(plusPlusExp, "");
            source = source.replace(ifClauseExp, "");
            return conjureFunctionFrom(source);
        },
        
        /* Return a function like f where the caller supplies the filter. */
        applyRegExp: function(f, rExp, replacement) {
            var source = f.toString();
            source = source.replace(rExp, replacement);
            return conjureFunctionFrom(source);
        },
        
        /* Return a function like f that uses the keyword "new" again. */
        renew: function(f) {
            return this.applyRegExp(f, newExp, "new $1");
        },
        
        /*
         * Print completely deKhanified function f source out via println.
         * All arguments are optional.
         */
        print: function(f, prefix, suffix) {
            f = f || metIpseMecum;
            prefix = prefix || "";
            suffix = suffix || "";
            f = this.loopDetect(f);
            f = this.renew(f);
            var source = f.toString();
            source = source.replace(envExp, "");
            source = prefix + source + suffix;
            this.printText(source);
        },
        
        /* Print source line(s) out via println. */
        printText: function(source) {
            source = source || " "; /* blank line if nothing else... */
            source = source.replace(spaceExp, noBreakSpace);
            source = source.replace(newlineExp, lineBreak);
            println(source);
        },
    };
})();  /* Library */

var colmap = DeKhan.loopDetect(function(hue){
    var a,b;
    
    for(a=0;a<255;a++){
        for(b=0;b<255;b++){
            stroke(hue, a, b);
            point(a,254-b);
        }
    }
});
var huemap = DeKhan.loopDetect(function(){
    var a;
    for(a=0;a<255;a++){
        stroke(255-a, 255, 255);
        line(255, a, 275, a);
    }
});
var cords={
    x:0,
    y:0,
    hue:0
};
var  drawall = function(hue){
    background(0, 0, 255);
    colmap(hue);
    huemap();
    
    stroke(0, 0, 0);
    noFill();
    ellipse(cords.x,cords.y,10,10);
    stroke(0, 0, 255);
    ellipse(cords.x,cords.y,11,11);
    
    stroke(0,0,0);
    rect(254,255-(hue)-5,20,10);
    stroke(0, 0, 255);
    rect(253,255-(hue)-6,22,12);
    
    fill(0, 0, 0);
    text("It is: hsb("+cords.hue +", "+ cords.x+", "+ (255-cords.y)+")",100,300);
    
    fill(cords.hue, cords.x, (255-cords.y));
    ellipse(100,350,30,30);
};


colorMode(HSB);
drawall(0);
draw = function() {
    if(mouseIsPressed){
        if(mouseX<255&&mouseY<255){
            cords={
                x:mouseX,
                y:mouseY,
                hue:cords.hue
            };
        }
        if(mouseX>255&&mouseX<275){
            cords.hue=255-mouseY;
            if(cords.hue<0){cords.hue=0;}
            if(cords.hue>255){cords.hue=255;}
        }
        drawall(cords.hue);
    }
};