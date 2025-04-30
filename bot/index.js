var msgToSend = "error";
var output = document.getElementById("output");

function messageChatBot() {
  msgToSend = document.getElementById("msg").value;
  document.getElementById("msg").value = "";
  //get lowercase too because if it's like this: hElLo it won't work
  if(msgToSend.toLowerCase() === "hello" || msgToSend.toLowerCase() === "hi") {
    output.append(msgToSend,document.createElement("br"),"Hello! That's cool that you said hi to me.", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "who are you" || msgToSend.toLowerCase() === "who are you?") {
    output.append(msgToSend,document.createElement("br"),"I am a chat bot created by TomMustBe12 hosted on thingmaker.us.eu.org!!", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "why are you here" || msgToSend.toLowerCase() === "why") {
    output.append(msgToSend,document.createElement("br"),"Because TomMustBe12 coded me. lol.", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "ur mom" || msgToSend.toLowerCase() === "your mom") {
    output.append(msgToSend,document.createElement("br"),"I know. My mom. Wait.... I'm a bot, so I don't have a mom :(", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "crazy" || msgToSend.toLowerCase() === "that's crazy") {
    output.append(msgToSend,document.createElement("br"),"I KNOW RIGHT LIKE THAT WAS THE MOSTEST CRAZIEST THING EVER", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "mk" || msgToSend.toLowerCase() === "minekhan") {
    output.append(msgToSend,document.createElement("br"),"MineKhan is a fun game! You can see it <a href='https://thingmaker.us.eu.org/minekhan'>here</a>.", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "where are you") {
    output.append(msgToSend,document.createElement("br"),"In a website. Duh.", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "youtube" || msgToSend.toLowerCase() === "yt") {
    output.append(msgToSend,document.createElement("br"),"YouTube is a video platform. Pretty cool!", document.createElement("br"), document.createElement("br"));
  } else
  if(msgToSend.toLowerCase() === "bye" || msgToSend.toLowerCase() === "see you later" || msgToSend.toLowerCase() === "cya" || msgToSend.toLowerCase() === "goodbye") {
    output.append(msgToSend,document.createElement("br"),"Bye! Nice having a chat with ya.", document.createElement("br"), document.createElement("br"));
  } else {
    output.append(msgToSend,document.createElement("br"),"Sorry, I couldn't understand you. Could you please try a different keyword?", document.createElement("br"), document.createElement("br"));
  }
}

function clearChat() {
  output.innerHTML="Talk to the bot to continue.<br><br>";
}

document.addEventListener("keyup", function(event) {
  if(event.keyCode === 13) {
    messageChatBot()
  }
})