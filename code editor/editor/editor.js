//unused file, don't delete
if(!document.querySelector("#codeEditorStyle")){
  const style = document.createElement("style")
  style.innerHTML = `
.hidden{display:none!important;}
.codeEditorContainer{
  font-family:monospace;
  position:relative;
  border:1px solid gray;
  /*word-wrap:break-word;*/
  overflow:hidden;
  height:500px;
}
.lineContainer{
  overflow:hidden;
  position:relative;
  width:calc(100% - 20px);
  height:calc(100% - 20px);
  cursor:text;
  outline:none;
  user-select:none;
}
.codeEditorContainer .line{
  position:absolute;
  white-space: nowrap;
}
.codeEditorContainer .cursor{
  position:absolute;
  display:block;
  width:0;
  border-left:2px solid #ccc;
}
.codeEditorContainer .cursor.focused{
  border-left:2px solid black;
}
@keyframes blink{
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.scrollbar{
  box-sizing:border-box;
  padding:2px;
  width:20px;
  height:20px;
  position:absolute;
  background:#eee;
}
.scrollbarY{
  height:calc(100% - 20px);
  right:0;
  top:0;
}
.scrollbarX{
  width:calc(100% - 20px);
  bottom:0;
  left:0;
}
.scrollbarHandle{
  width:100%;
  height:100%;
  background:#ccc;
  position:relative;
}
.scrollbarHandle:hover{
  background:#bbb;
}
.cornerPiece{
  width:20px;
  height:20px;
  background:#aaa;
  position:absolute;
  bottom:0;
  right:0;
  cursor:pointer;
}
.cornerPiece:hover{
  background:#aaf;
}
`
  style.id = "codeEditorStyle"
  document.head.appendChild(style)
}
function createCodeEditor(options = {}){
  let container = document.createElement("div")
  container.className = "codeEditorContainer"
  ;(options.parent || document.body).appendChild(container)
  let lines
  let lineEls = []
  let lineOffset = 0
  let scrollX = 0, scrollY = 0
  let fontSize = options.fontSize || 16
  let lineCount
  let cursor = {x:0,y:0}
  let cursorEl = document.createElement("span")
  cursorEl.className = "cursor"
  container.appendChild(cursorEl)
  let focused = false
  function setContent(content,start){
    lines = content ? (Array.isArray(content) ? content : content.split("\n")) : [""]
    if(start) return
    for(let i=0;i<lineEls.length;i++) update(i+lineOffset)
    setCursor(0,0)
    scrollTextTo(0,0)
  }
  setContent(options.content,true)
  function format(txt,forMeasure){
    txt = txt.replace(/&/g,"&amp;").replace(/ /g,"&nbsp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    if(!forMeasure){
      //color it
    }
    return txt
  }
  let measureEl = document.createElement("span")
  measureEl.style.top = -fontSize+"px"
  measureEl.style.fontSize = fontSize
  measureEl.style.display = "inline-block"
  measureEl.className = "line measureEl"
  container.appendChild(measureEl)
  function measureWidth(line,x){
    if(x === 0) return 0
    measureEl.innerHTML = format(lines[line].substring(0,x),true)
    return measureEl.clientWidth
  }
  function measureHeight(line,x){
    measureEl.innerHTML = format(lines[line].substring(0,x),true)
    measureEl.style.display = "inline-block"
    return measureEl.clientHeight
  }
  function update(line){
    let screenLine = line - lineOffset
    if(!lineEls[screenLine]) return
    lineEls[screenLine].innerHTML = lines[line] ? format(lines[line]) : "&nbsp;"
    lineEls[screenLine].style.top = line*fontSize+"px"
  }
  let lineContainer = document.createElement("div")
  lineContainer.className = "lineContainer"
  lineContainer.tabIndex = 0
  container.appendChild(lineContainer)
  function resize(){
    lineCount = Math.floor((container.clientHeight-20)/fontSize)+1
    lineEls.length = 0, lineContainer.innerHTML = ""
    for(let i=0; i<lineCount+1; i++){
      lineEls[i] = document.createElement('span')
      lineEls[i].className = "line"
      lineEls[i].style.fontSize = fontSize
      lineContainer.appendChild(lineEls[i])
      update(i+lineOffset)
    }
  }
  resize()
  function createScrollbar(dir,ondrag){
    let bar = document.createElement("div")
    bar.className = "scrollbar "+dir
    let handle = document.createElement("div")
    handle.className = "scrollbarHandle"
    let dragging = false, dragX, dragY
    handle.onmousedown = function(e){
      dragging = true
      dragX = e.x
      dragY = e.y
    }
    addEventListener("mousemove",function(e){
      if(!dragging) return
      ondrag((e.x-dragX)/bar.clientWidth, (e.y-dragY)/bar.clientHeight)
      dragX = e.x
      dragY = e.y
    })
    addEventListener("mouseup", function(){
      dragging = false
    })
    bar.appendChild(handle)
    container.appendChild(bar)
    return {bar,handle}
  }
  let scrollbarY = createScrollbar("scrollbarY", function(x,y){scrollTextBy(0,y*lines.length*fontSize)})
  let scrollbarX = createScrollbar("scrollbarX", function(x,y){scrollTextBy(x*lineContainer.scrollWidth,0)})
  let cornerPiece = document.createElement("div")
  cornerPiece.className = "cornerPiece"
  cornerPiece.onclick = e => {e.preventDefault(); window.open(atob("aHR0cHM6Ly9pYTgwMTYwMi51cy5hcmNoaXZlLm9yZy8xMS9pdGVtcy9SaWNrX0FzdGxleV9OZXZlcl9Hb25uYV9HaXZlX1lvdV9VcC9SaWNrX0FzdGxleV9OZXZlcl9Hb25uYV9HaXZlX1lvdV9VcC5tcDQ="),"_blank")}
  container.appendChild(cornerPiece)
  function updateScrollbar(){
    let y = lineContainer.clientHeight/(lines.length*fontSize)
    scrollbarY.handle.style.height = y*100+"%"
    scrollbarY.handle.style.top = scrollY/(lines.length*fontSize)*100+"%"
    
    let x = lineContainer.clientWidth/lineContainer.scrollWidth
    scrollbarX.handle.style.width = x*100+"%"
    scrollbarX.handle.style.left = scrollX/lineContainer.scrollWidth*100+"%"
  }
  function posCursor(){
    let screenLine = cursor.y - lineOffset
    if(screenLine >= lineEls.length || screenLine < 0){
      return cursorEl.classList.add("hidden")
    }
    if(cursorEl.classList.contains("hidden")) cursorEl.classList.remove("hidden")
    cursorEl.style.left = measureWidth(cursor.y,cursor.x)-scrollX+"px"
    cursorEl.style.top = cursor.y*fontSize-scrollY+"px"
    cursorEl.style.height = lineEls[screenLine].clientHeight+"px"
  }
  function setCursor(x,y){
    cursor.x = x, cursor.y = y
    if(cursor.y*fontSize < scrollY) scrollTextTo(scrollX, cursor.y*fontSize, true)
    else if(cursor.y*fontSize+fontSize > scrollY+lineContainer.clientHeight) scrollTextTo(cursor.x, cursor.y*fontSize+fontSize-lineContainer.clientHeight, true)
    let w = measureWidth(cursor.y,cursor.x)
    if(w+2 > scrollX+lineContainer.clientWidth) scrollTextTo(w+2-lineContainer.clientWidth, scrollY, true)
    else if(w < scrollX) scrollTextTo(w, scrollY, true)
    
    posCursor()
    if(focused){
      cursorEl.style.animation = ""
      cursorEl.offsetHeight //trigger reflow
      cursorEl.style.animation = "1s blink infinite step-start"
    }
    updateScrollbar()
  }
  function moveCursor(d){
    if(d === "up"){
      if(cursor.y > 0){
        cursor.y--
        cursor.x = Math.min(cursor.x,lines[cursor.y].length)
      }else cursor.x = 0
    }else if(d === "down"){
      if(cursor.y < lines.length-1){
        cursor.y++
        cursor.x = Math.min(cursor.x,lines[cursor.y].length)
      }else cursor.x = lines[lines.length-1].length
    }else if(d === "left"){
      if(cursor.x > 0){
        cursor.x--
      }else if(cursor.y > 0){
        cursor.y--
        cursor.x = lines[cursor.y].length
      }
    }else if(d === "right"){
      if(cursor.x < lines[cursor.y].length){
        cursor.x++
      }else if(cursor.y < lines.length-1){
        cursor.y++
        cursor.x = 0
      }
    }
    setCursor(cursor.x,cursor.y)
    /*x += cursor.x, y += cursor.y
    if(x < 0){
      y--
      if(y<0) x = y = 0
      else x = lines[y].length
    }else if(y >= 0 && y < lines.length && x > lines[y].length){
      x = 0
      y++
    }
    if(y < 0){
      y = x = 0
    }else if(y >= lines.length){
      y = lines.length-1
      x = lines[y].length
    }
    setCursor(x,y)*/
  }
  setCursor(0,0)
  lineContainer.onfocus = () => {
    cursorEl.style.animation = "1s blink infinite step-start"
    cursorEl.classList.add("focused")
    focused = true
  }
  lineContainer.onblur = () => {
    cursorEl.style.animation = ""
    cursorEl.classList.remove("focused")
    focused = false
  }
  lineContainer.onkeydown = function(e){
    if(e.key === "ArrowRight"){
      moveCursor("right")
      e.preventDefault()
    }else if(e.key === "ArrowLeft"){
      moveCursor("left")
      e.preventDefault()
    }else if(e.key === "ArrowUp"){
      moveCursor("up")
      e.preventDefault()
    }else if(e.key === "ArrowDown"){
      moveCursor("down")
      e.preventDefault()
    }else if(e.key.length === 1 ){
      if(e.key === " ") e.preventDefault()
      let l = lines[cursor.y]
      lines[cursor.y] = l.substring(0,cursor.x)+e.key+l.substring(cursor.x,l.length)
      update(cursor.y)
      setCursor(cursor.x+1,cursor.y)
    }else if(e.key === "Tab"){
      e.preventDefault()
      let l = lines[cursor.y]
      lines[cursor.y] = l.substring(0,cursor.x)+"  "+l.substring(cursor.x,l.length)
      update(cursor.y)
      setCursor(cursor.x+2,cursor.y)
    }else if(e.key === "Enter"){
      let l = lines[cursor.y]
      lines[cursor.y] = l.substring(0,cursor.x)
      l = l.substring(cursor.x,l.length)
      lines.splice(cursor.y+1,0,l)
      for(let i=cursor.y; i<lineOffset+lineEls.length; i++) update(i)
      setCursor(0,cursor.y+1)
    }else if(e.key === "Backspace"){
      let l = lines[cursor.y]
      if(cursor.x){
        lines[cursor.y] = l.substring(0,cursor.x-1)+l.substring(cursor.x,l.length)
        update(cursor.y)
        setCursor(cursor.x-1,cursor.y)
        scrollTextTo(scrollX,scrollY) //scroll width changes so update it
      }else if(lines.length > 1){
        lines.splice(cursor.y,1)
        let prevLength = lines[cursor.y-1].length
        lines[cursor.y-1] += l
        for(let i=cursor.y-1; i<lineOffset+lineEls.length; i++) update(i)
        setCursor(prevLength,cursor.y-1)
      }
    }
  }
  lineContainer.onmousedown = function(e){
    let x = e.clientX
    let y = e.clientY
    let cx = -1, cy = 0, lineRect
    for(let i=0;i<lineEls.length;i++){
      let rect = lineRect = lineEls[i].getBoundingClientRect()
      if(i+lineOffset >= lines.length-1 || y < rect.bottom){
        cy = i+lineOffset
        break
      }
    }
    if(cy < lines.length){
      for(let i=0; i<lines[cy].length; i++){
        if(/*measureHeight(cy,i) >= y && */measureWidth(cy,i)+lineRect.x > x){
          cx = i
          break
        }
      }
      if(cx === -1) cx = lines[cy].length
    }else cx = 0
    setCursor(cx,cy)
  }
  function scrollTextTo(x,y,lazy){
    scrollX = x
    scrollY = y
    if(lines.length*fontSize > lineContainer.clientHeight){
      if(scrollY < 0){
        scrollY = 0
      }
      if(scrollY > lines.length*fontSize-lineContainer.clientHeight){
        scrollY = lines.length*fontSize-lineContainer.clientHeight
      }
    }else if(scrollY){
      scrollY = 0
    }
    lineOffset = Math.floor(scrollY/fontSize)
    if(scrollX < 0) scrollX = 0
    if(scrollX > lineContainer.scrollWidth-lineContainer.clientWidth) scrollX = lineContainer.scrollWidth-lineContainer.clientWidth
    for(let i=0;i<lineEls.length;i++) update(i+lineOffset)
    lineContainer.scroll(scrollX,scrollY)
    if(lazy) return
    posCursor()
    updateScrollbar()
  }
  function scrollTextBy(x,y){
    scrollY += y
    scrollX += x
    scrollTextTo(scrollX,scrollY)
  }
  container.onwheel = function(e){
    scrollTextBy(e.deltaX, e.deltaY)
    e.preventDefault()
  }

  return {
    get content(){return lines.join("\n")}, setContent,
    element: container,
    setCursor, scrollTextTo, scrollTextBy, moveCursor, resize
  }
}