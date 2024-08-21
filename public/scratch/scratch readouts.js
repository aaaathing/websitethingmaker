(function(){
  var style = document.createElement("style");
  style.innerHTML = `
.scratchList{
  position:absolute;
  overflow:scroll;
  background:#eee;
  border:1px solid gray;
  border-radius:4px;
}
.scratchList, .scratchList *{
  box-sizing:border-box;
}
.scratchList table{
  width:100%;
  border-collapse: separate;
  border-spacing:4px;
  font:18px Arial;
}
.scratchList caption{
  background:white;
  padding:4px;
  border-radius:2px;
  border-bottom:1px solid black;
}
.scratchList tr{
  height:25px;
}
.scratchList tr td:nth-child(1){
  padding-right:10px;
}
.scratchList tr td:nth-child(2){
  background-color:orange;
  width:100%;
  border:1px solid black;
  border-radius:5px;
  padding-left:5px;
  color:white;
}
.scratchList tr td:nth-child(2) div{
  width:100%;
  text-overflow:ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
`;
  document.head.appendChild(style);
})()

function createList(items, name ,props){
  var listDiv = document.createElement("div");
  listDiv.style.width = props.width+"px";
  listDiv.style.height = props.height+"px";
  listDiv.style.left = props.x+"px";
  listDiv.style.top = props.y+"px";
  listDiv.classList.add("scratchList");
  
  listDiv.setListContentTo = function(items){
    var content = "<table><caption>"+name+"</caption><tbody>";
    for(var i=0; i<items.length; i++){
      content += "<tr>";
      content += "<td>"+(i+1)+"</td>";
      content += "<td><div>"+items[i]+"</div></td>";
      content += "</tr>";
    }
    content += "</tbody></table>";
    listDiv.innerHTML = content;
  }
  
  listDiv.setListContentTo(items);
  
  return listDiv;
}