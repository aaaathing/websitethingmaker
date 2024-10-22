// Feb 16, 2023
// jshint ignore: start
// ^^^^^^^^^^^^^^
// remove oh noes
var particles = 10000;
var test1,test2,results;
var test1Init, test1Time, test2Init, test2Time;
var performance = (function() { return this.performance; })();
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
    var metIpseMecum = (0 || arguments).callee;
    
    /* Given source code, return a function in the global scope. */
    var conjureFunctionFrom = function (source) {
        /* Copied from Element118 delag() function. */
        return Object.constructor('return (function(__env__) {return ' + source + ';});')()(globals);
    };
    
    return {
        /* Return a function like f without any loop detection. */
        loopDetect: function(f) {
            var source = f.toString();
            source = source.replace(plusPlusExp, "");
            source = source.replace(ifClauseExp, "");
            return conjureFunctionFrom(source);
        },
    };
})();
//test 1
test1 = DeKhan.loopDetect(function(){
    var start = performance.now();
    var stuff = [];
    for(var i=0;i<particles;i++){
        stuff.push({x:random(0,400),y:random(30,400)});
    }
    test1Init = performance.now()-start;
    var init = "Test 1 initialize time: "+test1Init;
    function sim(){
        for(var i=0; i<stuff.length; i++){
            var p = stuff[i];
            p.x+=random(-1,1);
            p.y+=random(-1,1);
            if(p.x<0){p.x=0}
            if(p.y<30){p.y=30}
            if(p.x>399){p.x=399}
            if(p.y>399){p.y=399}
            rect(p.x,p.y,1,1);
        }
    }
    var time = 0, times = 0;
    draw = function() {
        if(times>100){
            test1Time = time/times;
            test2();
        }
        textSize(12);
        background(255);
        fill(0);
        start = performance.now();
        sim();
        times++;
        time += performance.now()-start;
        fill(0, 0, 0);
        rect(0,0,400,30);
        fill(255);
        text(init+"\nAverage simulation time: "+(time/times),0,10);
    };
});
test1();
//test 2
test2 = DeKhan.loopDetect(function test2(){
    var start = performance.now();
    /*
    class particle{
        constructor(){
            this.x=random(0,400);
            this.y=random(30,400);
        }
        move(){
            this.x+=random(-1,1);
            this.y+=random(-1,1);
            if(this.x<0){this.x=0}
            if(this.y<30){this.y=30}
            if(this.x>399){this.x=399}
            if(this.y>399){this.y=399}
            rect(this.x,this.y,1,1);
        }
    }
    /*/function particle(){
        this.x=random(0,400);
        this.y=random(30,400);
    }
    particle.prototype.move=function(){
        this.x+=random(-1,1);
        this.y+=random(-1,1);
        if(this.x<0){this.x=0}
        if(this.y<30){this.y=30}
        if(this.x>399){this.x=399}
        if(this.y>399){this.y=399}
        rect(this.x,this.y,1,1);
    }//*/
    var stuff = [];
    for(var i=0;i<particles;i++){
        stuff.push(new particle());
    }
    test2Init = performance.now()-start;
    var init = "Test 2 initialize time: "+test2Init;
    function sim(){
        for(var i=0; i<stuff.length; i++){
            stuff[i].move();
        }
    }
    var time = 0, times = 0;
    draw = function() {
        if(times>100){
            test2Time = time/times;
            results();
        }
        textSize(12);
        background(255);
        fill(0);
        start = performance.now();
        sim();
        times++;
        time += performance.now()-start;
        fill(0, 0, 0);
        rect(0,0,400,30);
        fill(255);
        text(init+"\nAverage simulation time: "+(time/times),0,10);
    };
});
function results(){
    draw = function() {
        background(0, 0, 0);
        fill(255);
        textSize(12);
        text(
            "Test 1 initialize time: "+test1Init+"\n"+
            "Test 1 simulation time: "+test1Time+"\n"+
            "Test 2 initialize time: "+test2Init+"\n"+
            "Test 2 simulation time: "+test2Time,
            0,40
        );
        textSize(20);
        if(test2Init > test1Init){
            text("Initialization: Objects faster than classes",0,150);
        }else{
            text("Initialization: Classes faster than objects",0,150);
        }
        if(test2Time > test1Time){
            text("Simulation: Objects faster than classes",0,300);
        }else{
            text("Simulation: Classes faster than objects",0,300);
        }
    };
}
