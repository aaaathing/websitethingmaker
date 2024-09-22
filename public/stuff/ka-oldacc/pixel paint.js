// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 2, 2020
var pixels=[
    "0110100110010110"
    ];

var findcolor = function(col){
    if(col==="1"){
        return[255, 0, 0];
    }
    if(col==="0"){
        return[0, 0, 0];
    }
};
var render = function(list){
    for(var x=0;x<list.length;x++){
        for(var y=0;y<list[x].length;y++){
            
            fill(findcolor(list[x][y])[0],findcolor(list[x][y])[1],findcolor(list[x][y])[2]);
            rect(y*30,x*30,30,30);
            
            
        }
    }
    
};


draw = function() {
    background(255, 255, 255);
    render(pixels);
};
