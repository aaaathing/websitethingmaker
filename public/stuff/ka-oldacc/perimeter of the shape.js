// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Feb 4, 2021
var gridShape=[
  "  x  x  xx",
  "xxxx  xxxx",
  "x xxx  x x",
  "xx x  x xx",
  " xxxxxxxx ",
  "  xx  x xx",
  "x  xxxxx x",
  "  x x xxxx",
  "xxx xx x x",
  "  xxx xxxx"
];
var blockSize = 40;
var blockSize_1 = blockSize - 1;

function render(){
    var row;
    for(var y=0; y < gridShape.length; y++){
        row = gridShape[y];
        for(var x=0; x < row.length; x++){
            var unit = row[x];
            if(unit === "x"){
                rect(x*blockSize, y*blockSize, blockSize, blockSize);
            }
        }
    }
}
function renderPerimeter(perimeter){
    var row;
    for(var y=0; y < perimeter.length; y++){
        row = perimeter[y];
        for(var x=0; x < row.length; x++){
            var unit = row[x];
            
            if(unit.up){
                line(x*blockSize, y*blockSize, x*blockSize+blockSize_1, y*blockSize);
            }
            if(unit.dn){
                line(x*blockSize, y*blockSize+blockSize_1, x*blockSize+blockSize_1, y*blockSize+blockSize_1);
            }
            if(unit.lf){
                line(x*blockSize, y*blockSize, x*blockSize, y*blockSize+blockSize_1);
            }
            if(unit.rt){
                line(x*blockSize+blockSize_1, y*blockSize, x*blockSize+blockSize_1, y*blockSize+blockSize_1);
            }
        }
    }
}
function getPerimeter(){
    var perimeter = [];
    var row;
    for(var y=0; y < gridShape.length; y++){
        row = gridShape[y];
        var perimeterRow=[];
        for(var x=0; x < row.length; x++){
            var unit = row[x];
            var perimeterUnit = {};
            
            if(unit==="x"){
                var unitUp = gridShape[y-1];
                if(unitUp){unitUp = unitUp[x];}
                var unitDn = gridShape[y+1];
                if(unitDn){unitDn = unitDn[x];}
                var unitLf = row[x-1];
                var unitRt = row[x+1];
                
                perimeterUnit.up = unitUp === " " || !unitUp;
                perimeterUnit.dn = unitDn === " " || !unitDn;
                perimeterUnit.lf = unitLf === " " || !unitLf;
                perimeterUnit.rt = unitRt === " " || !unitRt;
            }
            
            perimeterRow.push(perimeterUnit);
        }
        perimeter.push(perimeterRow);
    }
    
    return perimeter;
}



noStroke();
fill(230,230,230);
render();

var perim = getPerimeter();
stroke(0,0,0);
renderPerimeter(perim);