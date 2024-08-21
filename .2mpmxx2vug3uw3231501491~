(function(){
  var newStyle = document.createElement("style")
  newStyle.innerHTML = `
    .RubixCube{
      perspective:400px;
      width:60px;
      height:60px;
    }
    .RubixCube .container{
      transform-style:preserve-3d;
      -webkit-transform-style:preserve-3d;
      position:relative;
      width:60px;
      height:60px;
    }
    .RubixCube *{
      box-sizing:border-box;
    }
    .RubixCube div{
      line-height:0;
    }
    .RubixCube .face{
      width:60px;
      position:absolute;
      top:0;
      left:0;
    }
    .RubixCube .part{
      width:20px;
      height:20px;
      line-height:0;
      border:1px solid black;
    }
  `;
  document.head.appendChild(newStyle)
})();

class RubixCube{
  constructor(element){
    this.element = element;
    this.colors = {
      0:"white",
      1:"blue",
      2:"orange",
      3:"green",
      4:"red",
      5:"yellow"
    }
    this.Rubify(this.element);
  }
  Rubify(element){
    this.parts = {
      t:{},
      1:{},
      2:{},
      3:{},
      4:{},
      b:{}
    }
    var numbers = ["t",1,2,3,4,"b"];
    var directions = [[90,0], [0,0], [0,-90], [0,-180], [0,90], [90,0]];
    var translates = [[0,0,30],[0,0,30],[0,0,30],[0,0,30],[0,0,30],[0,0,-30]];
    element.classList.add("RubixCube")
    var container = document.createElement("div");
    container.classList.add("container")
    container.classList.add("animateMe")
    for(var p = 0; p<numbers.length; p++){
      var part = this.parts[numbers[p]];
      var color = this.colors[p];
      var elem = document.createElement("div");
      elem.style.transform = "rotateX("+directions[p][0]+"deg) rotateY("+directions[p][1]+"deg) translate3d("+translates[p][0]+"px, "+translates[p][1]+"px, "+translates[p][2]+"px)"
      elem.classList.add("face")
      part.elem = elem;
      for(var i = 0; i<9; i++){
        var elemInside = document.createElement("div");
        elemInside.style.display = "inline-block"
        elemInside.style.background = color;
        elemInside.classList.add("part")
        elem.appendChild(elemInside)
        part[i] = elemInside
      }
      container.appendChild(elem);
    }
    element.appendChild(container)
  }
}