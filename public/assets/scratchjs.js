var Trigger = {
  triggers:[],
  generators:[],
  add:function(when, value, gen, sprite){
    //possible "when"s: "green_flag", "broadcast_receive"
    this.triggers.push({
      when:when,
      value:value,
      gen:gen,
      sprite:sprite
    })
  },
  greenFlag:function(){
    for(var i = 0; i<this.triggers.length; i++){
      var trig = this.triggers[i];
      if(trig.when === "green_flag"){
        var gen = trig.gen(trig.sprite);
        gen.trig_value = trig.value;
        this.generators.push(gen);
      }
    }
  },
  tick:function(){
    for(var i=0; i<this.generators.length; i++){
      var gen = this.generators[i];
      var stat = gen.next();
      if(stat.done){
        this.generators.splice(i,1);
        i--;
      }
    }
  },
  broadcast:function(msg){
    for(var i = 0; i<this.triggers.length; i++){
      var trig = this.triggers[i];
      if((trig.when === "broadcast_receive") && (trig.value.BROADCAST_OPTION[0] === msg)){
        var gen = trig.gen(trig.sprite);
        gen.trig_value = trig.value;
        this.generators.push(gen);
      }
    }
  },
  msgDone:function(msg){
    var done = true;
    for(var i = 0; i<this.generators.length; i++){
      var gen = this.generators[i];
      if(gen.trig_value.BROADCAST_OPTION && gen.trig_value.BROADCAST_OPTION[0] === msg){
        done = false;
      }
    }
    return done;
  },
  broadcastWait:function*(msg){
    this.broadcast(msg);
    while(!this.msgDone(msg)){
      yield;
    }
  }
}

class Costume{
  constructor(url, properties, name){
    this.image = new Image();
    this.image.src = url;
    properties = properties || {};
    this.centerX = properties.centerX
    this.centerY = properties.centerY
    this.name = name || "";
    
    this.size = properties.bitmapResolution * 100;
  }
  getCenterX(){
    if(!this.centerX)this.centerX = this.image.width/2;
    return this.centerX
  }
  getCenterY(){
    if(!this.centerY)this.centerY = this.image.height/2;
    return this.centerY
  }
}

class Sound{
  constructor(url, properties, name){
    this.audio = new Audio();
    this.audio.src = url;
    properties = properties || {};
    this.name = name || "";
  }
  play(){
    this.done = false;
    var parent = this;
    this.audio.onended = function(){
      parent.done = true;
    }
    
    this.audio.currentTime = 0;
    this.audio.play();
  }
  stop(){
    this.audio.pause();
    this.done = true;
  }
}

var monitor = {
  variable:{},
  list:{}
};

monitor.variable.default = class{
  constructor(value, x, y, master, show){
    this.value = value;
    this.x = x || 0;
    this.y = y || 0;
    
    this.master = master || ["stage", "my variable"]; // ["stage", <varname>] or ["sprite", <sprite name>, <varname>]
    
    this.showing = show || show === false ? show : true;
    
    this.label = this.master[0] === "stage" ? this.master[1] : this.master[1] + ": " + this.master[2];
    this.name = this.master[0] === "stage" ? this.master[1] : this.master[2];
    
    if(this.master[0] === "sprite"){
      for(var s=0; s<Project.sprites.length; s++){
        if(this.master[1] === Project.sprites[s].name){
          this.master[1] = s;
          break;
        }
      }
    }
    
    this.element = document.createElement("div");
    this.element.innerHTML = this.label;
    this.element.classList.add("variable");
    this.element.classList.add("norm");
    this.element.style.left = x+"px";
    this.element.style.top = y+"px";
    this.valueElement = document.createElement("div");
    this.valueElement.innerText = value;
    this.element.appendChild(this.valueElement);
    
    this.element.style.display = this.showing ? "" : "none";
  }
  display(){
    var sprite;
    var variable;
    if(this.master[0] === "stage"){
      sprite = Project.stage;
      variable = sprite.vars[this.name];
    }else{
      sprite = Project.sprites[this.master[1]]
      variable = sprite.vars[this.name];
    }
    
    this.valueElement.innerText = variable;
    
    this.element.style.display = this.showing ? "" : "none";
  }
}

monitor.variable.large = class{
  constructor(value, x, y, master, show){
    this.value = value;
    this.x = x || 0;
    this.y = y || 0;
    
    this.master = master || ["stage", "my variable"]; // ["stage", <varname>] or ["sprite", <sprite name>, <varname>]
    
    this.showing = show || show === false ? show : true;
    
    this.label = this.master[0] === "stage" ? this.master[1] : this.master[1] + ": " + this.master[2];
    this.name = this.master[0] === "stage" ? this.master[1] : this.master[2];
    
    if(this.master[0] === "sprite"){
      for(var s=0; s<Project.sprites.length; s++){
        if(this.master[1] === Project.sprites[s].name){
          this.master[1] = s;
          break;
        }
      }
    }
    
    this.element = document.createElement("div");
    this.element.innerHTML = value;
    this.element.classList.add("variable");
    this.element.classList.add("large");
    this.element.style.left = x+"px";
    this.element.style.top = y+"px";
    
    this.element.style.display = this.showing ? "" : "none";
  }
  display(){
    var sprite;
    var variable;
    if(this.master[0] === "stage"){
      sprite = Project.stage;
      variable = sprite.vars[this.name];
    }else{
      sprite = Project.sprites[this.master[1]]
      variable = sprite.vars[this.name];
    }
    
    this.element.innerText = variable;
    
    this.element.style.display = this.showing ? "" : "none";
  }
}

monitor.variable.slider = class{
  constructor(value, x, y, master, show, sliderMin, sliderMax, isDiscrete){
    this.value = value;
    this.x = x || 0;
    this.y = y || 0;
    
    this.master = master || ["stage", "my variable"]; // ["stage", <varname>] or ["sprite", <sprite name>, <varname>]
    
    this.showing = show || show === false ? show : true;
    
    this.label = this.master[0] === "stage" ? this.master[1] : this.master[1] + ": " + this.master[2];
    this.name = this.master[0] === "stage" ? this.master[1] : this.master[2];
    
    if(this.master[0] === "sprite"){
      for(var s=0; s<Project.sprites.length; s++){
        if(this.master[1] === Project.sprites[s].name){
          this.master[1] = s;
          break;
        }
      }
    }
    
    var step = isDiscrete ? 1 : 0.01;
    this.element = document.createElement("div");
    this.element.innerHTML = `
<div class="top">${this.label}<div class="valueElement"></div></div>
<input type="range" min="${sliderMin}" max="${sliderMax}" step="${step}">
`;
    this.element.classList.add("variable");
    this.element.classList.add("slider");
    this.element.style.left = x+"px";
    this.element.style.top = y+"px";
    this.valueElement = this.element.getElementsByClassName("valueElement")[0];
    this.valueElement.innerText = value;
    this.sliderElement = this.element.getElementsByTagName("input")[0];
    this.sliderElement.value = value;
    
    var me = this;
    this.sliderElement.oninput = function(){
      me.setValue(this.value);
    };
    
    this.element.style.display = this.showing ? "" : "none";
  }
  display(){
    var sprite;
    var variable;
    if(this.master[0] === "stage"){
      sprite = Project.stage;
      variable = sprite.vars[this.name];
    }else{
      sprite = Project.sprites[this.master[1]]
      variable = sprite.vars[this.name];
    }
    
    this.valueElement.innerText = variable;
    
    this.element.style.display = this.showing ? "" : "none";
  }
  setValue(value){
    var sprite;
    if(this.master[0] === "stage"){
      sprite = Project.stage;
      sprite.vars[this.name] = value;
    }else{
      sprite = Project.sprites[this.master[1]]
      sprite.vars[this.name] = value;
    }
    
    this.valueElement.innerText = value;
  }
}

class Sprite{
  constructor(name, costumes, sounds, properties){
    this.name = name;
    this.costumes = costumes;
    this.sounds = sounds || [];
    properties = properties || {};
    this.x = properties.x || 0;
    this.y = properties.y || 0;
    this.size = properties.size || 100;
    this.currentCostume = properties.costume || 0;
    this.vars = properties.vars || {};
    this.funcs = properties.funcs || {};
    
    this.sinX = 1;
    this.cosY = 0;
    this.dir = 90;
    
    this.saying = "";
    this.showing = true;
    this.penIsDown = false;
    this.penSize = 1;
    this.penColor = [0,100,100];
    this.graphicEffects = {BLUR:0, COLOR:0, FISHEYE:0, WHIRL:0, PIXELATE:0, MOSAIC:0, BRIGHTNESS:0, GHOST:0}
  }
  render(){
    if(this.showing){
      var costume = this.costumes[this.currentCostume];
      var img = costume.image;
      var imgSize = costume.size;
      var cosCentX = costume.getCenterX() * (this.size/imgSize);
      var cosCentY = costume.getCenterY() * (this.size/imgSize);
      var efx = this.graphicEffects;
      Project.ctx.filter = `hue-rotate(${efx.COLOR}deg) brightness(${(efx.BRIGHTNESS / 100) + 1}) blur(${efx.BLUR}px) opcaity(${(-efx.GHOST/100)+1})`;
      Project.ctx.translate(this.x, -this.y);
      Project.ctx.rotate(scratchToRad(this.dir));
      Project.ctx.translate(-cosCentX, -cosCentY);
      Project.ctx.drawImage(img, 0, 0, img.width * (this.size/imgSize), img.height * (this.size/imgSize));
      Project.ctx.translate(cosCentX, cosCentY);
      Project.ctx.rotate(-scratchToRad(this.dir));
      Project.ctx.filter = "";
      if((this.saying)){
        var boxWidth = Project.ctx.measureText(this.saying).width + 20;
        Project.ctx.translate(cosCentX, -cosCentY);
        Project.ctx.strokeStyle = "black";
        Project.ctx.lineWidth = 2;
        Project.ctx.strokeRect(0, 0, boxWidth, 25);
        Project.ctx.fillStyle = "white";
        Project.ctx.fillRect(0, 0, boxWidth, 25);
        Project.ctx.fillStyle = "black";
        Project.ctx.font = "18px Arial";
        Project.ctx.fillText(this.saying, 10, 20);
        Project.ctx.translate(-cosCentX, cosCentY);
      }
      Project.ctx.translate(-this.x, this.y);
    }
  }
  
  //scratch blocks
  moveSteps(steps){
    steps *= (this.size/100)
    this.goto(this.x + (this.sinX * steps), this.y + (this.cosY * steps));
  }
  pointInDirection(dir){
    dir = ((dir + 180) % 360) - 180
    this.dir = dir;
    this.sinX = Math.sin(scratchToRad(dir+90));
    this.cosY = Math.cos(scratchToRad(dir+90));
  }
  pointAt(what){
    if(what === "_mouse_"){
      var dir = getAngleFromXY(this.x, this.y, mouseX, mouseY);
      this.pointInDirection(dir);
    }else{
      var sprite = getSpriteByName(what);
      if(!sprite)return;
      var dir = getAngleFromXY(this.x, this.y, sprite.x, sprite.y);
      this.pointInDirection(dir);
    }
  }
  turnL(deg){
    this.turn(deg, true)
  }
  turnR(deg){
    this.turn(deg)
  }
  turn(deg, cc){
    if(cc){deg = -deg}
    this.pointInDirection(this.dir + deg);
  }
  gotoStr(str){
    if(str === "_random_"){
      this.goto(random(-240, 240), random(-180, 180));
    }else if(str === "_mouse_"){
      this.goto(mouseX, mouseY);
    }else{
      var sprite = getSpriteByName(str);
      if(!sprite)return;
      this.goto(sprite.x, sprite.y);
    }
  }
  goto(x,y){
    if(typeof x !== "number"){
      x = parseInt(x) || 0;
    }
    if(typeof y !== "number"){
      y = parseInt(y) || 0;
    }
    
    var imgW = this.costumes[this.currentCostume].image.width * (this.size / 100);
    var imgH = this.costumes[this.currentCostume].image.height * (this.size / 100);
    var limitPadding = 60 * (this.size / 100);
    if(x > 240+imgW-limitPadding)x = 240+imgW-limitPadding;
    if(x < -240-imgW+limitPadding)x = -240-imgW+limitPadding;
    if(y > 180+imgH-limitPadding)y = 180+imgH-limitPadding;
    if(y < -180-imgH+limitPadding)y = -180-imgH+limitPadding;
    
    if(this.penIsDown){
      Project.pen.strokeStyle = getHsv(this.penColor);
      Project.pen.lineWidth = this.penSize;
      Project.pen.beginPath();
      Project.pen.moveTo(this.x, this.y);
      Project.pen.lineTo(x,y);
      Project.pen.stroke();
    }
    this.x = x;
    this.y = y;
  }
  *glideToStr(secs, str){
    if(str === "_random_"){
      yield* this.glideTo(secs, random(-240, 240), random(-180, 180));
    }else if(str === "_mouse_"){
      yield* this.glideTo(secs, mouseX, mouseY);
    }else{
      var sprite = getSpriteByName(str);
      if(!sprite)return;
      yield* this.glideTo(secs, sprite.x, sprite.y);
    }
  }
  *glideTo(secs,x,y){
    var percent = 0;
    var frames = 30 * secs;
    var speed = 100 / 100 / frames;
    var sx = this.x;
    var sy = this.y;
    x = x - this.x;
    y = y - this.y;
    while(percent < 1){
      percent += speed;
      this.goto((x*percent)+sx, (y*percent)+sy);
      yield;
    }
    this.x = x+sx;
    this.y = y+sy;
  }
  changeXBy(x){
    this.goto(this.x+x, this.y);
  }
  changeYBy(y){
    this.goto(this.x, this.y+y);
  }
  setX(x){this.goto(x,this.y)}
  setY(y){this.goto(this.x,y)}
  say(msg){
    if(msg !== undefined){
      this.saying = String(msg) || "";
    }
  }
  *sayFor(msg, secs){
    this.say(msg);
    yield* this.wait(secs);
    this.say("");
  }
  setCostume(costume){
    if(typeof costume === "number"){
      //number
      costume -= 1;
      while(costume < 0){costume += this.costumes.length}
      this.currentCostume = costume % this.costumes.length;
    }else{
      //string
      for(var c = 0; c<this.costumes.length; c++){
        var cObj = this.costumes[c];
        if(cObj.name === costume){
          this.currentCostume = c;
          break;
        }
      }
    }
  }
  nextCostume(){
    this.setCostume(this.currentCostume + 1 + 1);
  }
  changeSize(s){this.setSize(this.size + s)}
  setSize(s){
    this.size = s;
    if(this.size < 1){
      this.size = 1;
    }
  }
  show(){this.showing = true}
  hide(){this.showing = false}
  costumeNumOrName(NumOrName){
    if(NumOrName === "number"){
      return this.currentCostume + 1;
    }else{
      return this.costumes[this.currentCostume].name;
    }
  }
  setGraphicEffect(value, effect){
    if(typeof value !== "number") value = parseInt(value);
    if(value > 100) value = 100;
    if(value < -100) value = -100;
    this.graphicEffects[effect] = value
  }
  changeGraphicEffect(by, effect){
    if(typeof by !== "number") by = parseInt(by);
    this.setGraphicEffect(this.graphicEffects[effect] + by)
  }
  startSound(sound){
    if(typeof sound === "number"){
      //number
      sound -= 1;
      while(sound < 0){sound += this.sounds.length}
      this.sounds[sound].play();
    }else{
      //string
      for(var s = 0; s<this.sounds.length; s++){
        var sObj = this.sounds[s];
        if(sObj.name === sound){
          sObj.play();
          break;
        }
      }
    }
  }
  *playSound(sound){
    if(typeof sound === "number"){
      //number
      sound -= 1;
      while(sound < 0){sound += this.sounds.length}
      sound = this.sounds[sound];
    }else{
      //string
      for(var s = 0; s<this.sounds.length; s++){
        var sObj = this.sounds[s];
        if(sObj.name === sound){
          sound = sObj;
          break;
        }
      }
    }
    
    sound.play();
    while(!sound.done){yield;}
  }
  *wait(secs){
    var frames = secs * 30;
    for(var i=0; i<frames; i++){
      yield;
    }
  }
  distanceTo(thing){
    if(thing === "_mouse_"){
      return Math.abs(Math.hypot(this.x - mouseX, this.y - mouseY)) * 5;
    }
    var sprite = getSpriteByName(thing);
    if(sprite){
      return Math.abs(Math.hypot(this.x - sprite.x, this.y - sprite.y)) * 5;
    }
  }
  setVar(value, name){
    if(value === "true"){value = true}
    if(value === "false"){value = false}
    
    if(this.vars[name] !== undefined){
      this.vars[name] = value;
    }else{
      Project.stage.vars[name] = value;
    }
  }
  changeVar(by, name){
    var Var = this.vars[name];
    if(Var === undefined){Var = Project.stage.vars[name]}
    var value = parseFloat(Var) + parseFloat(by);
    if(isNaN(value)){value = 1}
    this.setVar(value, name);
  }
  showVar(name){
    for(var v=0; v<Project.monitors.length; v++){
      if(Project.monitors[v].name === name){
        Project.monitors[v].showing = true;
        break;
      }
    }
  }
  hideVar(name){
    for(var v=0; v<Project.monitors.length; v++){
      if(Project.monitors[v].name === name){
        Project.monitors[v].showing = false;
        break;
      }
    }
  }
  
  penClear(){
    Project.pen.clearRect(-240, -180, 480, 360);
  }
  penStamp(){
    var costume = this.costumes[this.currentCostume];
    var img = costume.image;
    var imgSize = costume.size;
    var cosCentX = costume.getCenterX() * (this.size/imgSize);
    var cosCentY = costume.getCenterY() * (this.size/imgSize);
    Project.ctx.translate(this.x, -this.y);
    Project.ctx.rotate(scratchToRad(this.dir));
    Project.ctx.translate(-cosCentX, -cosCentY);
    Project.ctx.drawImage(img, 0, 0, img.width * (this.size/imgSize), img.height * (this.size/imgSize));
    Project.ctx.translate(cosCentX, cosCentY);
    Project.ctx.rotate(-scratchToRad(this.dir));
    Project.ctx.translate(-this.x, this.y);
  }
  penDown(){
    this.penIsDown = true;
    Project.pen.fillStyle = getHsv(this.penColor);
    if(this.penSize === 1){
      Project.pen.fillRect(this.x, this.y, 1,1);
    }else{
      Project.pen.beginPath();
      Project.pen.arc(this.x, this.y, this.penSize/2, 0, Math.PI * 2, true);
      Project.pen.fill();
    }
  }
  penUp(){
    this.penIsDown = false;
  }
  setPenColor(color){
    this.penColor = hexToHsv(color);
    this.penColor[0] = this.penColor[0] * 100 / 360;
  }
  changePen(what, by){
    if(what === "color"){
      this.penColor[0] += by;
      while(this.penColor[0] < 0){this.penColor[0] += 100}
      this.penColor[0] = this.penColor[0] % 100;
    }else if(what === "saturation"){
      this.penColor[1] += by;
      if(this.penColor[1] > 100)this.penColor[1] = 100;
      if(this.penColor[1] < 0)this.penColor[1] = 0;
    }else if(what === "brightness"){
      this.penColor[2] += by;
      if(this.penColor[2] > 100)this.penColor[2] = 100;
      if(this.penColor[2] < 0)this.penColor[2] = 0;
    }
  }
  setPen(what, value){
    var limited = value;
    if(limited > 100)limited = 100;
    if(limited < 0)limited = 0;
    
    if(what === "color"){
      while(value < 0){value += 100}
      this.penColor[0] = value % 100;
    }else if(what === "saturation"){
      this.penColor[1] = limited;
    }else if(what === "brightness"){
      this.penColor[2] = limited;
    }
    
  }
  setPenSize(value){
    this.penSize = value;
    if(this.penSize < 1){this.penSize = 1}
  }
  changePenSize(by){
    this.setPenSize(this.penSize + by);
  }
}

var Project = {
  canvas:null,
  ctx:null,
  penCanv: document.createElement("canvas"),
  pen: null,
  setCanvas:function(c){
    this.canvas = c;
    this.canvas.width = 480;
    this.canvas.height = 360;
    this.canvas.style.display = "block";
    this.canvas.imageRendering = "pixelated";
    this.ctx = c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.translate(240, 180); //0, 0 at center
    
    Project.canvas.onmousedown = function(){
      mouseDown = true;
    }
    window.onmouseup = function(){
      mouseDown = false;
    }
    
    this.penCanv.width = 480;
    this.penCanv.height = 360;
    this.pen = this.penCanv.getContext("2d");
    this.pen.translate(240, 180);
    this.pen.scale(1, -1);
    this.pen.lineCap = "round";
  },
  monitors:[],
  monitorArea:null,
  setMonitorArea:function(el){
    this.monitorArea = el;
  },
  addMonitor:function(monitorClass){
    this.monitors.push(monitorClass);
    if(!this.monitorArea)return;
    this.monitorArea.appendChild(monitorClass.element);
  },
  username:"",
  setUsername:function(u){
    this.username = u;
  },
  stage:new Sprite("Stage",[new Costume("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=")]),
  sprites: [],
  startTimer:0,
  timer:0,
  resetTimer:function(){
    this.startTimer = Date.now()/1000;
    this.timer = 0;
  },
  raf: -1,
  rafTog: false,
  greenFlag:function(){
    this.stop(true);
    this.rafTog = false;
    this.resetTimer();
    if(typeof this.onstart === "function"){
      this.onstart();
    }
    Trigger.greenFlag();
    requestAnimationFrame(function(){
      requestAnimationFrame(Project.tickFrame);
    });
  },
  stop:function(noOnstop){
    if(this.raf > -1){
      cancelAnimationFrame(this.raf);
    }
    Trigger.generators = [];
    if(typeof this.onstop === "function" && !noOnstop){
      this.onstop();
    }
  },
  render:function(){
    if(Project.canvas){
      Project.ctx.clearRect(-240, -180, 480, 360);
      Project.stage.render();
      Project.ctx.drawImage(Project.penCanv, -240, -180, 480, 360);
      for(var i = 0; i<Project.sprites.length; i++){
        Project.sprites[i].render();
      }
    }
    for(var i=0; i<Project.monitors.length; i++){
      Project.monitors[i].display();
    }
  },
  tickFrame:function(){
    Project.timer = Date.now()/1000 - Project.startTimer;
    
    Project.rafTog = !Project.rafTog;
    if(Project.rafTog){
      Trigger.tick();
    }
    
    Project.render();
    
    Project.raf = requestAnimationFrame(Project.tickFrame);
    if(Trigger.generators.length === 0){
      Project.stop();
    }
  },
  addSprite:function(spriteObj){
    this.sprites.push(spriteObj);
  },
  stopAllSounds:function(){
    for(var i=0; i<this.sprites.length; i++){
      for(var s=0; s<this.sprites[i].sounds.length; s++){
        this.sprites[i].sounds[s].stop();
      }
    }
  }
}


//simpler code functions
function radToScratch(n){
  n *= Math.PI;
  n /= 180;
  n += 90;
  return n;
}
function scratchToRad(n){
  n -= 90;
  n /= 180;
  n *= Math.PI;
  return n;
}
function random(min, max, float){
  var range = max - min;
  var rand = Math.random()*range + min;
  if(!float)rand = Math.round(rand);
  return rand;
}
function getSpriteByName(name){
  for(var s=0; s<Project.sprites.length; s++){
    var sprite = Project.sprites[s];
    if(sprite.name === name){
      return sprite;
    }
  }
}

function getAngleFromXY(myX,myY,x,y){
  var direction = 0;
  if(y-myY === 0){
    if(x-myX > 0){
      direction = 90;
    }else{
      direction =- 90;
    }
  }else{
    direction = Math.atan((x-myX)/(y-myY)) * 180 / Math.PI;
    if(y-myY<0){
      if(x-myX>0){
        direction += 180;
      }else{
        if(x-myX<0){
          direction -= 180;
        }else{
          direction = 180;
        }
      }
    }
  }
  return direction;
}

var mouseX = 0, mouseY = 0;
window.onmousemove = function(e){
  if(!Project.canvas)return;
  var rect = Project.canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left; //x position within the element.
  mouseY = e.clientY - rect.top;  //y position within the element.
  
  //scale it
  if(rect.width !== 480){
    mouseX /= rect.width / 480;
  }
  if(rect.height !== 360){
    mouseY /= rect.height / 360;
  }
  
  mouseX -= 240;
  mouseY -= 180; mouseY = -mouseY;
  
  if(mouseX > 240){mouseX = 240}
  if(mouseX < -240){mouseX = -240}
  if(mouseY > 180){mouseY = 180}
  if(mouseY < -180){mouseY = -180}
  
  mouseX = Math.round(mouseX);
  mouseY = Math.round(mouseY);
}

var mouseDown = false;
//mouse down detect at Project.setCanvas

function mathOption(num, op){
  var options = {
    abs:Math.abs,
    floor:Math.floor,
    ceiling:Math.ceil,
    sqrt:Math.sqrt,
    sin:Math.sin,
    cos:Math.cos,
    tan:Math.tan,
    asin:Math.asin,
    acos:Math.acos,
    atan:Math.atan,
    ln:Math.log,
    log:Math.log10,
    "e ^":function(n){return Math.pow(Math.E, n)},
    "10 ^":function(n){return Math.pow(10, n)}
  }
  var scratchRad = [
    "cos",
    "sin",
    "tan",
    "asin",
    "acos",
    "atan"
  ];
  if(scratchRad.includes(op)){
    num = num * Math.PI / 180;
  }
  return options[op](num);
}

var keysPressed = {};
window.onkeydown = function(e){
  keysPressed[e.key] = true;
}
window.onkeyup = function(e){
  keysPressed[e.key] = false;
}
function keyPressed(key){
  var difKeys = {
    space:" ",
    "left arrow":"ArrowLeft",
    "right arrow":"ArrowRight",
    "up arrow":"ArrowUp",
    "down arrow":"ArrowDown"
  };
  key = difKeys[key] || key;
  return keysPressed[key];
}

function getHsv(arr){
  var h = arr[0] * 360 / 100, s = arr[1], v = arr[2];
  
      s/=100.0;
			v/=100.0;
			C = v*s;
			hh = h/60.0;
			X = C*(1.0-Math.abs((hh%2)-1.0));
			r = g = b = 0;
			if( hh>=0 && hh<1 )
			{
				r = C;
				g = X;
			}
			else if( hh>=1 && hh<2 )
			{
				r = X;
				g = C;
			}
			else if( hh>=2 && hh<3 )
			{
				g = C;
				b = X;
			}
			else if( hh>=3 && hh<4 )
			{
				g = X;
				b = C;
			}
			else if( hh>=4 && hh<5 )
			{
				r = X;
				b = C;
			}
			else
			{
				r = C;
				b = X;
			}
			m = v-C;
			r += m;
			g += m;
			b += m;
			r *= 255.0;
			g *= 255.0;
			b *= 255.0;
			r = Math.round(r);
			g = Math.round(g);
			b = Math.round(b);
			hex = r*65536+g*256+b;
			hex = hex.toString(16,6);
			len = hex.length;
			if( len<6 )
				for(i=0; i<6-len; i++)
					hex = '0'+hex;
  return "#"+hex;
}
function hexToRgb(hex){
  hex = hex.replace("#", "");
  var values = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
  var arr = [
    hex.substring(0,2),
    hex.substring(2,4),
    hex.substring(4,6),
  ];
  for(var i=0; i<arr.length; i++){
    var a = arr[i];
    var num = parseInt(a, 16);
    
    arr[i] = num;
  }
  return arr;
}
function hexToHsv(hex){
  var rgb = hexToRgb(hex);
  r = rgb[0];
  g = rgb[1];
  b = rgb[2];
  
  hex = r*65536+g*256+b;
  hex = hex.toString(16,6);
  len = hex.length;
  if( len<6 )
    for(i=0; i<6-len; i++)
      hex = '0'+hex;
  r/=255;
  g/=255;
  b/=255;
  M = Math.max(r,g,b);
  m = Math.min(r,g,b);
  C = M-m;
  if( C==0 ) h=0;
  else if( M==r ) h=((g-b)/C)%6;
  else if( M==g ) h=(b-r)/C+2;
  else h=(r-g)/C+4;
  h*=60;
  if( h<0 ) h+=360;
  v = M;
  if( v==0 )
    s = 0;
  else
  s = C/v;
  s*=100;
  v*=100;
  
  return [h,s,v];
}

async function imageToDataURL(url){
  /*var data = await new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onerror = function(){
      reject({
        status:this.status,
        statusText:xhr.statusText
      })
    }
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        resolve(xhr.response);
      }else{
        reject({
          status:this.status,
          statusText:xhr.statusText
        })
      }
    }
  });*/
  var data = await fetch(url).then(response => response.blob());
  data = data;
  
  var getPromise = function(){
    return new Promise(function(resolve){
      var reader = new FileReader();
      reader.onload = function(){
        resolve(reader.result);
      }
      reader.readAsDataURL(data);
    });
  }
  
  data = await getPromise();
  
  return data;
}