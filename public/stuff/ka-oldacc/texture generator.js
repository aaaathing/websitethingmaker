// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Dec 4, 2020
var Win;
var Doc;
(function(){
var d="document";
var w="window";
Doc=this[d];
Win=this[w];
}());

var block = {
    randomTexture:function(w,h){
        var texture=[];
        var i,i2;
        for(i=0; i<h;i++){
            var row=[];
            for(i2=0;i2<w;i2++){
                var r,g,b;
                r=round(random(255));
                g=round(random(255));
                b=round(random(255));
                var col=[r,g,b];
                row.push(col);
            }
            texture.push(row);
        }
        return texture;
    },
    render:function(){
        if(arguments.length<2){
            noStroke();
            var what;
            if(arguments.length===1){what=arguments[0];}else{what=block.texture();}
            var i,i2;
            for(i=0;i<what.length;i++){
                var row=what[i];
                for(i2=0;i2<row.length;i2++){
                    var col=row[i2];
                    fill(col[0], col[1], col[2]);
                    rect(i2*10,i*10,10,10);
                }
            }
        }else if(arguments.length>1){
            throw{
                message:"Error at \"block.render\". Too many arguments!"
            };
        }
    }
};


var custom=[
    [[255,0,0],[0,255,0],[0,0,255]],
    [[255,0,255],[0,255,255],[0,0,255]]
];

var tex=block.randomTexture(16,16);
block.render(tex);
