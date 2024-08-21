var url = document.querySelector("#url")
var sendWhat = document.querySelector("#sendWhat")
var logElement = document.querySelector("#log")

function log(msg){
  logElement.innerHTML += msg+"<br>"
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0')+" ")
      .join('');
}

var socket = null
function connect(){
  socket = new WebSocket(url.value)
	socket.binaryType = "arraybuffer"
  socket.onerror = (e) => {
    log(e)
  }
  socket.onopen = () => log("WebSocket connected")
  socket.onclose = () => {
    log("WebSocket closed")
    socket = null
  }
  socket.onmessage = (msg) => {
    if(typeof msg.data === "string") log("<blue>Recieved:</blue> "+msg.data)
    else if(msg.data instanceof ArrayBuffer){
      log("<blue>Recieved (as binary):</blue> "+buf2hex(msg.data))
    }
  }
}
function disconnect(){
  if(socket){
    socket.close()
  }else log("WebSocket does not exist")
}
function send(msg){
  msg = msg || sendWhat.value
  if(socket){
    socket.send(msg)
    log("Send: "+msg)
  }else{
    log("Please connect to a WebSocket server")
  }
}