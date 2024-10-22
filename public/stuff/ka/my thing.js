// Dec 31, 2021
//spin-off of https://www.khanacademy.org/computer-programming/falling-sand-simulation/4788439432085504
//something i made


// right click to switch materials!

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
        /* Copied from Element118, delag() function. */
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
})();

var gridWidth = 50;
var gridHeight = 50;
var gridScale = 8;

// border left, right, top bottom
var bLeft = 0;
var bRight = gridWidth - 1;
var bTop = 0;
var bBottom = gridHeight - 1;

var grid = [];

var AIR = 0;
var SAND = 1;
var WATER = 2;
var WOOD = 3;
var FIRE = 4;
var SMOKE = 5;

var selectedMaterial = WATER;


var colors = [];

colors[AIR] = color(255);
colors[SAND] = color(214, 185, 112);
colors[WATER] = color(0, 0, 255);
colors[WOOD] = color(184, 110, 37);
colors[FIRE] = color(255, 130, 0);
colors[SMOKE] = color(40,40,255);

var densities = [];

densities[AIR] = 0; // 0 is air, smoke is lighter so negative
densities[SAND] = 2;
densities[WATER] = 1;
densities[WOOD] = -10;
densities[FIRE] = 0;
densities[SMOKE] = -1;

var flammibility = [];

flammibility[AIR] = 0;
flammibility[SAND] = 0;
flammibility[WATER] = 0.1;
flammibility[WOOD] = 0;
flammibility[FIRE] = 0; // fire can't be caught on fire
flammibility[SMOKE] = 0;

var initialTtl = [];

initialTtl[AIR] = -1;
initialTtl[SAND] = -1;
initialTtl[WATER] = -1;
initialTtl[WOOD] = -1;
initialTtl[FIRE] = 50;
initialTtl[SMOKE] = 500;

var materialNames = [];

materialNames[AIR] = "AIR";
materialNames[SAND] = "SAND";
materialNames[WATER] = "WATER";
materialNames[WOOD] = "WOOD";
materialNames[FIRE] = "FIRE";
materialNames[SMOKE] = "SMOKE";

var g="0300000000000000000000033333330333333333333300000033322222202000000000003333333055333333333333300000332222222222223000000003333330055333333333330000000333333322222333000000005505000055550000000000000000333333222233330000000000000000005100000000000000000333322222333322222222322100000533330000000000000033302222222333222222222211100000033333000000000003332222222223333222222221111110005333333300000000033322222222223333322222111111110000533333330000003332222222222223333333211111111110005553333333000033322222222222223333333311111111110000555533333300333222222222222222333333331111111110005555553333303332222222222222222223333333111111110000555555333033333222222222222222222333333331111110005555555330333333322222222222222222223333331111110000555555003333333332222222222222222223333333133110000555500033333333333333333332222222222233333333310050550000333553333333333333333222222222223333333330000000003330000003333333333333222222222223330333305000000033300000000000033333333222222222222200333300000000333000000000000000003322222222222222223333000000003330022222222222222222222222222222222333335000000033322222222222222222222222222222222233333300000000333222222222222222222222222222233333333355000000003332222222222222222222222333333333333335000000000033322222222222222222222233333333333335500000000000333222222222222222222333333333333333550000000000003332222222222222222233333303333333555000500000000033322222222222222223333300033333355500000000000000333222222222222223333300003333355550000050000000003332222222222223333330003333333555000055000000000033322222222222333333000333355555500000005000000000333222222222233333000033335555550000000000000000003332223222232230220203333555555000000000500000000033322233222222222222333355555500000000000000000000333222333322322222233305555550000000000050000000003332223333322322223330000555000000000005000000000033322233333322322333000000500000000000005000000000333222233333322233300000000000000000000500000000003332222233333323330000000000000000000000500000000033322222223333333300000000000000000000000000000000333222222223333333300000000000000000000054444444443332222222222222333000000000000000000005044444444433322222222222222222222000200000000000005444444444333222222222222222223332222222222222220005444444443332222222222222222333332222222232323232343434343433322222222222222223333322222224444445454444444444333222222222222222233333222222222222222224444444443332222222222222222223222222222444444544454444444403222222222222222222222222222222222222222444444444";
for(var i = 0; i < width * height; i++) {
    grid.push([
        parseInt(g[i],10) || AIR, // type
        0, 0, // xVel, yVel
        -1,   // time to live (-1 lives forever)
        false,// touched this time through
    ]);
}

var TYPE = 0;
var X_VEL = 1;
var Y_VEL = 2;
var TTL = 3;
var TOUCHED = 4;


var upLeft = function(x, y) {
    if(x <= 0 || y <= 0) {
        return;
    }
    
    return grid[(y - 1) * gridWidth + (x - 1)];
};

var up = function(x, y) {
    return grid[(y - 1) * gridWidth + x];
};

var upRight = function(x, y) {
    return grid[(y - 1) * gridWidth + (x + 1)];
};

var right = function(x, y) {
    return grid[(y) * gridWidth + (x + 1)];
};

var downRight = function(x, y) {
    return grid[(y + 1) * gridWidth + (x + 1)];
};

var down = function(x, y) {
    return grid[(y + 1) * gridWidth + (x)];
};

var downLeft = function(x, y) {
    return grid[(y + 1) * gridWidth + (x - 1)];
};

var left = function(x, y) {
    return grid[(y) * gridWidth + (x - 1)];
};

var at = function(x, y) {
    return grid[y * gridWidth + x];
};


var drawMaterial = function() {
    var x = constrain(floor(mouseX / gridScale), 1, gridWidth - 2);
    var y = constrain(floor(mouseY / gridScale), 1, gridHeight - 2);
    
    var i = y * gridWidth + x;
    
    at(x, y)[0] = selectedMaterial;
    down(x, y)[0] = selectedMaterial;
    up(x, y)[0] = selectedMaterial;
    right(x, y)[0] = selectedMaterial;
    left(x, y)[0] = selectedMaterial;
    
    at(x, y)[3] = initialTtl[selectedMaterial];
    down(x, y)[3] = initialTtl[selectedMaterial];
    up(x, y)[3] = initialTtl[selectedMaterial];
    right(x, y)[3] = initialTtl[selectedMaterial];
    left(x, y)[3] = initialTtl[selectedMaterial];
};

noStroke();
//frameRate(5);
draw = function() {
    /*_clearLogs();
    var f=function(v){return v[0];};
    println(grid.map(f).join(""));
    noLoop();//*/
    
    background(255);
    
    // draw smoke first
    for(var x = 0; x < gridWidth; x++) {
        for(var y = 0; y < gridHeight; y++) {
            var i = y * gridWidth + x;
            
            if(at(x, y)[0] === SMOKE) {
                fill(red(colors[grid[i][0]]), green(colors[grid[i][0]]), blue(colors[grid[i][0]]));
                rect(x * gridScale, y * gridScale, gridScale, gridScale);
            }
        }
    }
    
    //filter(BLUR, 7);
    
    for(var x = 0; x < gridWidth; x++) {
        for(var y = 0; y < gridHeight; y++) {
            var i = y * gridWidth + x;
            
            if(at(x, y)[0] !== SMOKE) {
                fill(colors[grid[i][0]]);
                rect(x * gridScale, y * gridScale, gridScale, gridScale);
            }
        }
    }
    
    // "untouch" everything
    for (var i = 0; i < grid.length; i++) {
        grid[i][TOUCHED] = false;
    }
    
    var iterateDirection = (frameCount % 2) * 2 - 1;
    var start = 0;
    var end = bRight;
    
    if (iterateDirection === -1) {
        start = bRight;
        end = 0;
    }
    
    // go bottom to top to simulate sand
    for(var y = bBottom; y >= 0; y--) {
        for(var x = start; x !== end; x += iterateDirection) {
            var i = y * gridWidth + x;
            
            if(at(x, y)[TOUCHED]) {
                continue;
            }
            if(y>45 && x>30 && floor(y/2)*2===y){
                at(x,y)[0]=FIRE;
            }
            if(y === 45 && x>30 && floor(x/2)*2===x){
                at(x,y)[0]=WOOD;
            }
            if(y===0 && x>3 && x<5){
                at(x,y)[0] = WATER;
            }
            
            switch (at(x, y)[0]) {
                case AIR:
                break;
                case SAND:
                    // can the sand move down
                    if (y < bBottom && down(x, y)[0] === AIR) {
                        at(x, y)[0] = AIR;
                        down(x, y)[0] = SAND;
                    } else if(x > bLeft && y < bBottom && downLeft(x, y)[0] === AIR) {
                        // can the sand move diagonally down to the left?
                        at(x, y)[0] = AIR;
                        downLeft(x, y)[0] = SAND;
                    } else if(x < bRight && y < bBottom && downRight(x, y)[0] === AIR) {
                        at(x, y)[0] = AIR;
                        downRight(x, y)[0] = SAND;
                    }
                break;
                case WATER:
                    // can the water move straight down?
                    if (y < bBottom && down(x, y)[0] === AIR) {
                        at(x, y)[0] = AIR;
                        down(x, y)[0] = WATER;
                    } else if(x > bLeft && y < bBottom && downLeft(x, y)[0] === AIR) {
                        // can the water move diagonally down to the left?
                        at(x, y)[0] = AIR;
                        downLeft(x, y)[0] = WATER;
                    } else if(x < bRight && y < bBottom && downRight(x, y)[0] === AIR) {
                        // can the water move diagonally down to the right?
                        at(x, y)[0] = AIR;
                        downRight(x, y)[0] = WATER;
                    } else if(y > bTop && densities[up(x, y)[0]] > densities[at(x, y)[0]]) {
                        // is the material above more dense? in that case, swap places
                        var materialAbove = up(x, y)[0];
                        
                        up(x, y)[0] = at(x, y)[0];
                        at(x, y)[0] = materialAbove;
                    } else {
                        // let's see what directions the water can flow
                        var canFlowLeft = false;
                        var canFlowRight = false;
                        
                        if(x > bLeft && left(x, y)[0] === AIR) {
                            canFlowLeft = true;
                        }
                        
                        if(x < bRight && right(x, y)[0] === AIR) {
                            canFlowRight = true;
                        }
                        
                        if(canFlowLeft && canFlowRight) {
                            var direction = floor(random(2)); // 0 === left, 1 === right
                            
                            if(direction === 0) {
                                at(x, y)[0] = AIR;
                                left(x, y)[0] = WATER;
                            } else {
                                at(x, y)[0] = AIR;
                                right(x, y)[0] = WATER;
                            }
                        } else if(canFlowLeft) {
                            at(x, y)[0] = AIR;
                            left(x, y)[0] = WATER;
                        } else if(canFlowRight) {
                            at(x, y)[0] = AIR;
                            right(x, y)[0] = WATER;
                        }
                    }
                break;
                case WOOD: // wood is boring
                break;
                case FIRE:
                // kill the fire
                
                at(x, y)[3]--;
                
                // check for flammibility, starting up
                var orderToCheck = [up, upLeft, upRight, left, right, downLeft, downRight, down];
                
                for (var j = 0; j < orderToCheck.length; j++) {
                    if (orderToCheck[j](x, y) && flammibility[orderToCheck[j](x, y)[0]] > 0) {
                        // check if we'll burn this time
                        var shouldBurn = random() < flammibility[orderToCheck[j](x, y)[0]];
                        
                        if (shouldBurn && orderToCheck[j](x, y)[0] === WATER) {
                            at(x, y)[TYPE] = SMOKE;
                            at(x, y)[TTL] = initialTtl[SMOKE];
                            
                            orderToCheck[j](x, y)[TYPE] = SMOKE;
                            orderToCheck[j](x, y)[TTL] = initialTtl[SMOKE];
                        } else if (shouldBurn) {
                            orderToCheck[j](x, y)[0] = FIRE;
                            orderToCheck[j](x, y)[3] = initialTtl[FIRE];
                        }
                        
                        break;
                    }
                }
                break;
                case SMOKE:
                // smoke is like inverted sand
                if (y<=0) {
                    at(x, y)[0] = AIR;
                    at(x, y)[3] = -1;
                    continue;
                }
                
                at(x, y)[TTL]--;
                
                if(y > bTop && densities[up(x, y)[0]] > densities[SMOKE]) {
                    // is the material above more dense? in that case, swap places
                    var materialAbove = up(x, y)[0];
                    var materialAboveTtl = up(x, y)[TTL];
                    
                    up(x, y)[0] = at(x, y)[0];
                    up(x, y)[TTL] = at(x, y)[TTL];
                    up(x, y)[TOUCHED] = true;
                    at(x, y)[0] = materialAbove;
                } else if(x > bLeft && y > bTop && densities[upLeft(x, y)[0]] > densities[SMOKE]) {
                    // is the material above more dense? in that case, swap places
                    var materialAbove = upLeft(x, y)[0];
                    var materialAboveTtl = upLeft(x, y)[TTL];
                    
                    upLeft(x, y)[0] = at(x, y)[0];
                    upLeft(x, y)[TTL] = at(x, y)[TTL];
                    upLeft(x, y)[TOUCHED] = true;
                    at(x, y)[0] = materialAbove;
                } else if(x < bRight && y > bTop && densities[upRight(x, y)[0]] > densities[SMOKE]) {
                    // is the material above more dense? in that case, swap places
                    var materialAbove = upRight(x, y)[0];
                    var materialAboveTtl = upRight(x, y)[TTL];
                    
                    upRight(x, y)[0] = at(x, y)[0];
                    upRight(x, y)[TTL] = at(x, y)[TTL];
                    upRight(x, y)[TOUCHED] = true;
                    at(x, y)[0] = materialAbove;
                }
            }
        }
    }
    
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(25);
    text("Selected Material: " + materialNames[selectedMaterial] + "\n(right click to switch)", width / 2, 30);
    
    fill(red(colors[selectedMaterial]), green(colors[selectedMaterial]), blue(colors[selectedMaterial]), 220);
    rect(width / 2 - 10, 65, 20, 20);
    
    if (mouseIsPressed && mouseButton === LEFT) {
        drawMaterial();
    }
};
draw = DeKhan.loopDetect(draw);

mousePressed = function() {
    if(mouseButton === LEFT) {
        drawMaterial();
    } else if(mouseButton === RIGHT) {
        selectedMaterial = (selectedMaterial + 1) % colors.length;
    }
};
mouseDragged = function() {
    if(mouseButton === LEFT) {
        drawMaterial();
    }
};
