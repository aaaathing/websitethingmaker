// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Feb 4, 2021
void(random());//enable the restart button

var win = function(){return this;}();
var doc = win["document".trim()];

var proc = function(){proc=this;};
proc();


var ctx = proc.externals.context;
var canvas = ctx.canvas;


var canv, gl;
if(canv){
    
}else{
    canv = doc["createElement".trim()]("canvas");
    var out = doc.getElementById('live-editor-output');
    out.children[0].append(canv);
    canv.id="glCanvas";
    canv.style.position="absolute";
    canv.width="100%";
    canv.height="100%";
    canv.style.zIndex="1";
    canv.style.top="0px";
    gl = canv.getContext("webgl");
}

gl.clearColor(0, 0, 0, 0.0);
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);