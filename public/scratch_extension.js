//go to https://turbowarp.org/editor?extension=https://thingmaker.us.eu.org/randomscripts/scratch_extension.js
const icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
class intelligence{
  constructor(){
    this.iq = 0
    this.atSchool = 0
  }
  getInfo(){
    return {
      id: 'intelligence',
      name: 'Intelligence',
      color1:"#888800",
      menuIconURI: icon,
      blocks:[
        {
          opcode:"getiq",
          blockType: Scratch.BlockType.REPORTER,
          text: 'intelligence quota'
        },
        {
          opcode:"learn",
          blockType: Scratch.BlockType.COMMAND,
          text: 'Learn[amount]things',
          arguments: {
            amount: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: "1"
            }
          }
        },
        {
          opcode:"forget",
          blockType: Scratch.BlockType.COMMAND,
          text: 'Forget[amount]things',
          arguments: {
            amount: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: "1"
            }
          }
        },
        {
          opcode:"isstupid",
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'is stupid?'
        },
        {
          opcode:"getclassification",
          blockType: Scratch.BlockType.REPORTER,
          text: 'Intelligence classification'
        },
        {
          opcode:"getclassificationfor",
          blockType: Scratch.BlockType.REPORTER,
          text: 'Intelligence classification for[what]',
          arguments:{
            what:{
              type:Scratch.ArgumentType.NUMBER,
              defaultValue: "100"
            }
          }
        },
        {
          opcode:"gotoschool",
          blockType: Scratch.BlockType.COMMAND,
          text: 'Go to school for[time]seconds',
          arguments:{
            time:{
              type:Scratch.ArgumentType.NUMBER,
              defaultValue: "10"
            }
          }
        },
        {
          opcode:"getatschool",
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'At school?'
        },
      ]
    }
  }
  getiq(){
    return this.iq
  }
  learn({amount}){
    this.iq += amount
  }
  forget({amount}){
    this.iq -= amount
  }
  isstupid(){
    return this.iq <= 0
  }
  getclassificationfor({what}){
    if(this.iq <= 0) return "stupid"
    else if(this.iq < 85) return "dumb"
    else if(this.iq <= 114) return "average"
    else if(this.iq <= 200) return "smart"
    else return "overpowered"
  }
  getclassification(){
    return this.getclassificationfor({what:this.iq})
  }
  gotoschool({time}){
    this.atSchool++
    let me = this
    return new Promise(resolve => {
      let start = Date.now()
      let i = setInterval(() => {
        this.iq++
        if(Date.now() - start >= time*1000){
          clearInterval(i)
          resolve()
          me.atSchool--
        }
      },500)
    })
  }
  getatschool(){
    return !!this.atSchool
  }
}
Scratch.extensions.register(new intelligence());