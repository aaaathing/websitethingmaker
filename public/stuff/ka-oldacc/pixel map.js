// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 10, 2020
function pixelMap(id){
    this.id=id;
    this.map=[];
    this.colors={};
}
pixelMap.prototype.addRow=function(row){
    var args = Array.prototype.slice.call(arguments);
    this.map.push(row);
};
pixelMap.prototype.addColor=function(char,color){
    this.colors[char] = color;
};
pixelMap.prototype.render=function(x,y){
    var i,j;
    var map=this.map;
    for(i=0;i<map.length;i++){
        var row = map[i];
        for(j=0;j<row.length;j++){
            this.testColor(row[j]);
            fill(this.colors[row[j]]);
            rect(j*10+x,i*10+y,10,10);
        }
    }
};
pixelMap.prototype.testColor=function(char){
    if(!this.colors[char]){
        throw{
            message:"The color for\""+char+"\"does not exist"
        };
    }
};






var myMap = new pixelMap("map1");
myMap.addRow("aaaa");
myMap.addRow("aabb");
myMap.addColor("a",color(255, 0, 0));
myMap.addColor("b",color(0, 255, 38));

draw = function() {
    background(255, 255, 255);
    noStroke();
    myMap.render(200,200);
};
