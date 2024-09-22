//jshint esnext: true
// original code from: https://minecraft.fandom.com/wiki/Nether_Portal_(block)#Texture_generation_prior_to_Java_Edition_13w02a_and_Bedrock_Edition_v0.15.0
//other programs: https://www.khanacademy.org/profile/kaid_30538885139931647243460/projects
scale(400/16);
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
const setup_portal_sprite = DeKhan.loopDetect(function(time, wide, tall, maxDir, scale) {
noStroke();
smooth();
  for (let x = 0; x < wide*scale; x++) {
    for (let y = 0; y < tall*scale; y++) {
      let n = 0.0;
      for (let dir = 0; dir < maxDir; dir++) {
        let spiral_x = (x - Math.floor(x/wide)*wide - dir * (wide / maxDir)) / wide * maxDir;
        let spiral_y = (y - Math.floor(y/tall)*tall - dir * (tall / maxDir)) / tall * maxDir;
        spiral_x += spiral_x < -1 ? 2 : (spiral_x >= 1 ? -2 : 0);
        spiral_y += spiral_y < -1 ? 2 : (spiral_y >= 1 ? -2 : 0);
        const mag = spiral_x * spiral_x + spiral_y * spiral_y;
        let out_spiral = Math.atan2(spiral_y, spiral_x);
        out_spiral += ((time * Math.PI * 2) - (mag * 10) + (dir * 2)) * (dir * 2 - 1);
        out_spiral = Math.sin(out_spiral) * 0.5 + 0.5;
        out_spiral /= mag + 1;
        n += out_spiral / 2;
      }
      n += Math.random() * 0.1;
      let r = n * n * 200 + 55;
      let g = n * n * n * n * 255;
      let b = n * 100 + 155;
      fill(r,g,b);
      rect(x/scale,y/scale,1/scale,1/scale);
    }
  }
});
let time=0,speed=0.01;
let s=1;
draw= function() {
    background(255);
    s+=Math.sin(time/4*Math.PI)*0.02;
    setup_portal_sprite(time,16,16,2,s);
    time+=speed;
};
