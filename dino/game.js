var p = {
  groundX: 0
}
var groundW = imgCoords.ground[2]
function draw(){
  p.groundX -= 10
  if(p.groundX < 0) p.groundX = groundW
  drawThing("ground", p.groundX, height/2)
  drawThing("ground", p.groundX-groundW, height/2)
}

function initScreens(){
  drawScreens["main menu"] = function(){
    clear()
    fontSize(40)
    textAlign("center")
    text("just click play", width/2, 50)
  }
  drawScreens.play = function(){
    clear()
    draw()
    fontSize(40)
    textAlign("center")
    text("just do nothing", width/2, height/2)
  }
}
function initButtons(){
  Button.all = []
  Button.add(width/2, 100, 200,40,"main menu",()=>changeScreen("play"),"Play and stuff")
}
init = function(){
  screen = "main menu"
  initScreens()
  initButtons()
}