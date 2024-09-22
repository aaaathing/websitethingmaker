// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Feb 8, 2021
function printImages(){
    var t = (function(){return this;})()[["AllImages"]], s = "";
    for(var i in t){
        for(var j = 0; j < t[i][["images"]].length; j++){
            s += t[i][["groupName"]] + "/" + t[i][["images"]][j] + "\n";
        }
    }
    println(s);
}

printImages();