var players = {};
var you = document.querySelector("#you")

var canvas = document.querySelector("#drawing")
var ctx = canvas.getContext("2d")

var picker = document.querySelector("#picker")
var serverSelect = document.querySelector("#serverSelect")
var BGBox = document.querySelector("#BG")
var BGPick = document.querySelector("#BGPick")
var popupEl = document.querySelector("#popup")
var popupContent = document.querySelector("#popup .content")
var chat = document.querySelector("#chat")
var chatBox = document.querySelector("#chatBox")
var htmlEl = document.documentElement

var mouseX = 0, mouseY = 0
var mouseMoved //defined later
var onMouseDown //defined later
window.onmousemove = e => {
  mouseX = e.clientX + htmlEl.scrollLeft
  mouseY = e.clientY + htmlEl.scrollTop
  mouseMoved(e)
}
window.ontouchmove = function (e) {
  e.clientX = e.touches[0].pageX
  e.clientY = e.touches[0].pageY
  onmousemove(e)
  e.preventDefault() //prevent scrolling
}
var mouseDown = false
canvas.onmousedown = () => { mouseDown = true; onMouseDown() }
window.onmouseup = () => mouseDown = false
you.onmousedown = canvas.onmousedown
window.ontouchstart = e => {
  mouseX = e.touches[0].pageX
  mouseY = e.touches[0].pageY
  canvas.onmousedown()
}
you.ontouchstart = ontouchstart
canvas.addEventListener("touchend", onmouseup)
canvas.addEventListener("touchcancel", onmouseup)
window.onresize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx.imageSmoothingEnabled = false
  drawGrid()
}
canvas.width = window.innerWidth
canvas.height = window.innerHeight
ctx.imageSmoothingEnabled = false

BGBox.oninput = () => {
  if(BGPick.value === BGBox.value) return
  BGPick.value = BGBox.value
  setBG(BGBox.value, false, true)
}
BGPick.oninput = () => {
  if(BGPick.value === BGBox.value) return
  BGBox.value = BGPick.value
  setBG(BGPick.value, false, true)
}

function popup(message) {
  popupContent.innerHTML = "<span style='font-weight:bold; font-size:40px;'>"+message+"</span>"
  popupEl.style.display = ""
}

var username = "player"+Date.now()
function chatMsg(user, msg, noscroll){
  var div = document.createElement("div")
  div.classList.add("message")
  div.innerHTML = "<b>"+user+"</b><br>"+msg.replace(/\n/g, "<br>")
  div.id = "chat"+Date.now()
  chat.appendChild(div)
  if(!noscroll) location.href = "#"+div.id
}
chatBox.onkeypress = e => {
  if(e.key === "Enter" && !keys.Shift){
    chatMsg(username+" (You)", chatBox.value, true)
    sendHub({type:"chatMsg", data:chatBox.value})
    chatBox.value = ""
    e.preventDefault()
  }
}
var keys = {}
window.onkeydown = e => {
  keys[e.key] = true
}
window.onkeyup = e => {
  keys[e.key] = false
}
function clearChat(){
  chat.innerHTML = ""
}

function notification(msg){
  if (!("Notification" in window)){
    return false
  }else if(Notification.permission === "granted"){
    var notif = new Notification("Notification", {body:msg})
    notification.all.push(notif)
  }else if(Notification.permission !== "denied"){
    Notification.requestPermission().then(function(permission){
      if (permission === "granted") {
        var notif = new Notification("Notification", {body:msg})
        notification.all.push(notif)
      }
    });
  }
}
notification.all = []
notification.clear = () => {
  for(var i=0; i<notification.all.length; i++){
    notification.all[i].close()
  }
}

var blockData = {
  air: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  grass: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACmklEQVQ4T21S3UuTYRT/Pe8UP/Bjzn3Uu+WcU+pus6iLtGRaF1l0VxIJUXRXEZQXGnQtSEFBERQh/QlFLIhaYEKUn7sJy4/NuU3dh+6dpdty7xPnWe9M6tw85znn+f3O+Z3zsFuvu7lUwpD/pWJrIweysnIdlI08qioBvdGATHYTW0oWqgpIEpDJcaSSeci2ErA+7xme+bkFW60R2c0sJB3wdWgGNddk5LcZtvOA22mHBIbAehTpVA4V5RA5SaeC3fNd5ON3J+F50IGxb7MoK2VYexTGntt2rNwPwtLvRHVlBUyletHdp4FRoNeK8kog8zQCduHYfm50dSHh94EDsPTZsToUEp2QlV6VkXsWhvHmPiQeLqFRNiIYTYgc+ezxjW4ejimwmergtOrxwjuGdncTIisKVAYsLicLTADqXSdRHZ9Cg7kKI9PBAsGdc208sJLEcVcTAI4QkZkNGPXPCRBjDPa9BuFTZQJp5nE7wN4O9vJh7zga5XoRrz10FsrEK+F3uZvBeR4+fwAel1PEPvjnRQeh2A80mGrB3g1e4u+n50BsKiQEIgmojGNpVRHVbZYqfJwIoaPVIQhCcUWcBBYdPrnezRdjKXGxm/Ugn056GAivwSEb0GApPNbA5C8urwlpgoACI/6FHa2RdQEg8C6TsFsKSdAIqHKnu7mokzR/j8YxOhXEldOHi3GbuUb4aasH6amX/0qgpFM2imFZTTWYQQsOYFaAIvE0gtEk2t0OhGMFn/WfP8pJD62RNGrD0Uh2a9i5aVsRBNrQKE2stFKbpRrgrFjp8qkjGH7zReQIPP/nN4oZUGUC0iNqXSPRzv91UVzjQE8bp3X9PSjtEz33fhabOdHaAvor9K5JrkPnwRb4JmexEF3Hb9xpNuMFHKEzAAAAAElFTkSuQmCC",
  dirt: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABZElEQVQ4T22Tu0pDQRCG5yA2gtcmBhE0djZK7ISApQgp7Sx8AF/AB/AVrMVXEEQ7IbVBLezUQBBNo1HBRuTIt/oPk43b7NnZOTP/ZbY4P9gp755ejNXt9dO+sVqzPNZ5frWF2Wm/v7i6T3nF/vZ6OV+Zstb1gydwfptr2M3pcYqpoBoon2oFCKjGosvu5prpLDTxTA5LecXh3lZ5azVrVvvpx4gmp8IdKCKiVIAgl0vVGTs6u7TGyqLrEQt+VOo23msPNEkaAIufJGTkSEziRSFFL2lAVyVN1Jv23j5xtfmQ4voWFXYXEV6s3D6hiQjJI55ckAYKSg92QVaybJRjoE4FCMQ5kFWilVr9LSGVY15A9kTO0KEwnkf+fDNoaDVEgUvsVAdmZNl+B020ZDNIB2wU/1gkwv+Pir8FCfQ1Mmaj35+usrpCQ3bHCXUK8R1I/Xxw4nnIxnzuGajJx5ajji8x6vEDVe0sv/E5TwcAAAAASUVORK5CYII=",
  stone: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCElEQVQ4T4VTsRGEMAyLayjoKBiA1RiAnhGYjwEo6Cigzp98r5zwh/tUiS6RJdmxZVnyfd9JV9M0qes6h7ZtS+M4pvM8U+2egQAX+YBE+74XzmEYyh6Efd/7GYROcBxHatvWweu6yh5nPAYZVHGhGBRhOYECAEGIKopH+bgH0kIAQGU/QvkqiRjs2DzPnoFK1GrAqYi+aRUqbV1XJ4AnM0s5Zw+HwdGr+ufeFbALyh6lxmBV8SMD9ryWeiTl2QlqCbNKzT/b67Z1kNgF+seZ8nWYNBebpilzsphDHBqGHIMsIb5ZoNS3GfkZJA0qfh5aoTr+nb9tjA+U2BVwElkdlfB9o+84JyT+AHgnw0FDUcTDAAAAAElFTkSuQmCC",
  oakLeaves: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAElBMVEUAAABDlEOBxYFksWROnk7///+h5/3CAAAAAXRSTlMAQObYZgAAAAFiS0dEBfhv6ccAAAAHdElNRQflBREVCzUFsuNoAAAAAW9yTlQBz6J3mgAAAG5JREFUCNcNytEVwyAIQNEnZABpO4ANGYAjDhCj+8/U3u+LicZ+cxHY0iUdto4WcqKz+hcaY9ApCXnLND7BLu7HnQ+zns2WLLy88hgx/t0+keFo1HwU4TKkHwErkmaP0GXWolenubPxRpyt2C36AyynDrqj+w3mAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIxLTA1LTE3VDIxOjExOjUzKzAwOjAwNN0BkQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMS0wNS0xN1QyMToxMTo1MyswMDowMEWAuS0AAAAASUVORK5CYII=",
  goldBlock: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACXElEQVQ4T2WTy04VQRCGv+oeQGEHR8LGRIlRQPQNjFGJiXFh9EF9DndGLhHiJSyIgiOcE25zznR3lakZoiR20klnevqrqr/+kr3362YmxAhTc4E4WzE1M0OoBFMlJgUVbG4WYqCK01isCKGiHf5AfnzYsMXlOwgJqTLMGBaMgGIqYAYWkAiIw3xnkEy9WyNHH1/a4uMVumUVGidI+UmWCs9MPLssSFDExphmcmlAW0ZfL5CjzQ1bXF/rAd2qUN0nhNABTCOoB28QGXcJiShGof48QupPL23waB5kAfQnpi0SwhUsQLkBHegScIB129fJ9zOk3nxug4dLGAnOT/CrcGP6H4BpVwOCAAWs/IUM90bI4eYzu7W6hGqh4qx7WHImelvEHwUsCJnsWhK9nKJIKtRfTpGjrae2uLqM6RixETZur+lxdRQhTfVQcWhOWMocf5sgv7Zf2K0Hd/to5QDiCnax+T/k2peil+ikcLLvgK1XPWAqQvsVwm2KeBa5f9LVrqgUIi6gEv1aM/XeEVJvvbHByr3OZZ1ImtwQWHCzaG8Pc2NNrrxiaJogzSW/tg+9C29tsHa//zG6WUKnNMFBGSuKIkRrII1J4wtKM4G25eTbMfJ7650tPLzzr78hIGKIuyfnbh7MCqEdoc0pk7MLtE2EYpweNsjvndc2v7ZEKYWgBlWvtFhveysJSYlyPiRMzileWSrEYtQHbqSdDRuszKOldOm6El2rukEKV8NjlOExNm5ITYbsWhnDOiHD3SfmIvURfdJcaa/Zz+48oaoqbuZEcJu6lbNhyShF+QPL5IpFLX+VZwAAAABJRU5ErkJggg==",
  diamondBlock: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB7klEQVQ4T21TMW8TMRh9vtwlIUsk1IWlEmoalTY/i9/BwkqHMmSBAYZ2QGJiQCCKhAggFiYEpeqV9pAaBBHStZBecvYZ3uf6eu1hybLv7Pf8vvdshccPLC637lWg2QSMAYoCsBZot4FGiE4jRDcMESmF5NcECttP7M3rfaHoBAEWwkgWc4KAcuQ//8213BZY3/8ChdfP7J3eaqmhChYAFQCIgkDmqTFIjZa+9e0rFN68sBtLK7XTqMadZDE1pqaIgNt7n6Awem6Hy2uYFoVI52bW6Evw0lKtS0LKZ1tPYkdwrz8Qgp3TqSxci5pO9lndlz3mXlFwsOsINnqrF2Syvm4jvEBCRZ6QBNxz93DvXAHNofxxPq+lSiB7J2jISPBE53iY7DsTh70bspjMMiy22nj/+7hGUv1B8Hg+x+joEApvt+1waUUkx9kpFqKoTKTqQfUesASqvRV/dgSb/UFZn4+uCnAXiCkx2gKTPEc8y3B/9yMU3r20j/qD/0r2ZD42AneyKeIswzifIRYPzgh8NN4wMorUwsjowfSHcyH9MXYEm8tr4ixP9PF52UyHgA9/TiQhucZai+L0KDk3UbLVWrzw76G8yoXB6CQVk9P5DDDavdCf36Hw6mn9OZO+2QK4mYStK8gJYiOQc6r4N/4FmthwxKuBQngAAAAASUVORK5CYII=",
  red: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACYUlEQVQ4T3XSW2sUSRjG8X+dujpzyHiIh8264oXgjSJjTETxe3qpCLIisrDsd9mb3atVMB5ixphJT1VX1StdA8qwWFfdFP2j3+d91LP5XJalZ9savLbEUlDAzDs+r3omXvM1JVoMi5QYaYs3gIYvXUK93L8nSQSRgjcGrRWhL5tATKQiJGDiFA7zA3h1sCdZhFRyBVKWehlSwSjN+ZHluIvEImRgd9ySS6HrM6Uo1OsHe9KlwpVtx/uThEbQBlb9Ghh7TUiZqWsYjrWavmSWIa2Bvx7tyyKkChx+6dFDACi0pv7VcGa+QddkoCghF8EpxVnKqD8f3pe3Z5Hfpp7FWdoA+pzru4hmmGxny3EUVmgxnG/tGhgy+Bh6rk0aFl3iom/4FAKNMYSc2faGZZAKXGgtxzEgxWC14tJWg3py97acaxwpQ6aw4/0GgNSJuHPzBn//+x/GFGLSPwdGxtQuDF8dp8hE2w2gdRATWKO4fn0X9XTvrnS9MLWGc63laBVph3UWqcDMOIyBLgnewtRaYhasgau/7qL+eLwvhyfhO7AIsfbhuE/EkrnceLxTfOpSbWCrNa2zLFZDPgr1/N5cTlNmp7VsWUM3hAEVKFKYWYfRilwzgiKZW1dm/PPhlHHD/4FhhHVuuu56VTITZzaAUWvoguAMqBf35xIkc9E7NJoP3Rrw2gyNJknhQtvwsQtcnnrefQ01C4peA78fzCVR2LaWVS8sYqrA2FpUfRoK5HmzPOOXacvRMtYmjt1wD+rlwVxipgYUEpwOw7JO2yqhy4VZ4zjp+7qd4ZzGzKVRQ8yFb3WbWNOauF2hAAAAAElFTkSuQmCC",
  green: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACpklEQVQ4TyWTy4okRRSGvxMRWZlZWZVdNcXoQAuutMaeRvARfAA3PojoThhaEF3Oq4zoSmgXXkDoEXQ5SwXBC9jTVdV1y0tEHImsTRAEER/nv4Q8+/ld/fPfhqo2hE7Z3yv1QggBCqv0UYgBRoWwP0I5Op1ZC+PSIh89X2pVC6KKAD6mFc6mluMx4HvFqRIzwbfwcJ6z8x5EIL355Jul5qUQI9QTw24biI1SPXCUY+Hu1mNHhjwTCuMG+ObQIkbY7xV59uJS7zae2EVUhGzsOGz9cDG3SlEYNgfFOuHhdMSrXYcKhFaJCvLlzRNd33ryERgrrFbKdAJtB5OZo7TKahsggihUlSAG1mslswnwy6VuX/VMKmH1T489ywZ5vlXev/iQmz++wgcwRmg6yN3Jq2wk9K0iV9+/o3EfiO7kbJYJXQcysuQE9o0SWx0g+cTgDGz3SlnAuLDIFz891i4YypHQ9IoJEWsNtjCEPtB76NtIe1CkMFQuotbQBwi9Ik+vl5rMODZgTZoA0ozj2qFeaXaBvHK0254uidd0T4fxZ5MZcvXDhW5vexavZ6zXYYinngoew/2dH/bHRhEn+E6prA5y2yC8/ehN5Om3S+16qOd2AJQTx4OJ8Nb8A25ePmcyM3QefFAaL5QjhpYeO2U2FeTz66W+8eicv1Z/s2vMSUKIGFESOEV7ef4ev/7+2xDr0JcQB8j8zCGf/Xih96vA+WsZ/20jZaYYo3h/AqT8XS7UlWF/iEP+s1lKSmlakI+/XmpVgdHktuKKU62d6MntPtU6wzXKpg1kJv2BSJumc4J8+t1jtSgBwcSIH2oiFBJpglBl0GsCQhsAIxx2kboSmijI1fVSN/fKYmEGt1NMwcN84dju/CAhtTKVSBPICbtdJCuEqrT8D9DKalqvhtXaAAAAAElFTkSuQmCC",
  goldOre: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABfElEQVQ4T21TLU/FQBDc6lbUVTyDosETPBbNT0AUxRN9BEN6CclDVDQkhBp+BApLsASBrXsJqaiiohUkkJJZmMsWWNPb637N7FxQVdXU973A4jgWnMdxVD8MQz0PwyBRFPk7xNGCoigmOAhEQtd1kqapD8CBDfCPliSJ5mgBdsHP6/WrnK13fDHc2e7O7cnn241cXO1qrQAQWBWdCAN3CH6/O5XLl8PZPWLatv0ukOf5hNEJA19gZufFYuF5QRyTmaMQbFfgrOtaRO7FuSdfuCxLvVutHjypKD6bwDmnQcAI+3jcSL050gnOT57VBxxrWoAjg1muk0FN0/h4konOfo0gcbnc9sxaLaCwhcNVswmI9DpgIjjgjstyX7dA4zbs1oIsyyYmgFlghQ5+bwJJhMN4XSOVaImxUmUi8HMiEAsDuV6Jdv+UMjAiSeTgz3YAR6VMJaKaVR4nwjTHW7fqMoki8hDs67Pj21fKkRkLH4X+5YCypoxnyvlx2OgL5Mca++TgcZEAAAAASUVORK5CYII=",
  diamondOre: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABd0lEQVQ4T4VSu0rFQBCdRQQhKdLlQsDCJr2Vn2BnYecXpLEyiIKQCIJyQYIoBm4riI2gn2B3fyEfEDVdhARFuETOwAkbjTpVdjJ79jzGJEnStW0rdjmOI57naasoCgnDUOq6lrE5AwAM8sIASUTKspQgCPo2AH3f1zMAFaCqKnFdV5tLO6eyuD3sL+AyQMAKtRkl8vCykJXHEz0rAF4HRRYA8QqGr5ffZe1y+oM+ZgHaA6CBl34rWwZnIMfEcawekCK+0zSV+Wsn9+f72gejPM/7HmaaplGWJssyBYAEXoRG1PPqp9JHfWwd6Xn9ZjYwtE+Bro5JwGs0mf/JWAHo7NtsVzO3XSer+d3FqD0K8H1BOLm9N9UUWP5ZMogXsgeLhJexB5OnKx3EmfTtFOzITRRFHTeLPtiJcENxiXtBIzXGvyQAEDI2JkYjtNOBnMEigS41Mzp6Ux0cqyRewjeZ/Rsj5dhSCKwMuIm0F6YhSi6XnZ2dFoG/AH7B6kGelfa8AAAAAElFTkSuQmCC",
  redstoneOre: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABq0lEQVQ4T21TsYrCQBB9CchJIAg24mFpeY0/4Md4VuohYhOrAxvhGjkIVsHuvuPEb7BMKUoaQRYkh4XHm2T29sRpNtmdfTPvzVtvPp/fLpcL3AiCALUwlK1jlqHZaOBsDB7leVEU3ZjIpEfBiwomIFkmaUGjIYCe20H9ekV9tULa6wFhCP4/tVpSnVE9n/EWx/jyfZwGA+S1WgHACtoiL53yXADel0tJTsfjv+aMQb1axalSAalaAOXL1YLotTB8SPGYphANiKQtBrsdXjcbfAPY9vsF1yzDe5IUe5NJAWuMnHmfy6WI+LPf4yWObasH35fvw2wm6/NiISu5Uxft2PuYTgVADvO84FdqwCo2yrFqt7ovAKos1dfxMFFVZ+u70chWdsddjLGc7b9qxqCbJFAqebeLfadjU9RcAsBdjpKqttdry5P/EndTUHPRpV40HN7YNkOsWqqrpdSFFJlUXToyRutEY9BKU+zbbamoo+KejlXp8Ez1skbSCmpTOo3dEKC63Qqea3HamN1ZI7F918ZKwTWZvgt9lWJlfY1WXmPQJA3APiJ3bPc6/QKQ8Qv4qp0KjwAAAABJRU5ErkJggg==",
  emeraldOre: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABfElEQVQ4T21TPUvDUBS9wcWETBYymt/hD+go0aUKdRAEqWDBUBAkg4NDh7oInXRxcBIEcXL3l6RuhTiFpFvKufE8Xh55S95Lbs695+N58/m8KctSsMIwFOyrqpK6rvWd7/u6xxMrCAKt4/KyLGtwwE/4SKCD6YmMfxdy/bmvoFhFUXSA8I8CuB1R/H65keLjR66KoemGBgDBGgwG+vRAwVSISJ7neozj2H6te0wyvLvQyUbPuy1AmqYNR8ckycPUFIA7Otmcl0crnWxWJSKetBQoHhBfz/604PvmS4EOnxoFIU1Otl6vJYqi7gR9ne53xkZEW2jjAijg4NrGTtDEtRKdDYAtIkQiHYp1/rZnLLTVRx1omBy4klMLUEAhxUUu6BS08SaTSUOR4AZ4upTcXCjYaiGjl6B/Aoppp9GecJn8W7k5bgGYLohlZ52eM40U2rZSKZw+3nbSZd8JJpATuFbqBBRsVied1Nm3lEDUCGc0Mkns6wS/CeK6RJ228Q0JHuyQCQAAAAAASUVORK5CYII=",
  ironOre: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACGElEQVQ4T21TvW7TUBg9FwkpVWLXRqpUJ0Fq2BKJBZgY0oGBoUNXJNSVwIqUmTxCHiKPQAdG2GkYwFFRRaU2tS01ku34pwuS0fnsayzEXXzv9fdzvnPOVfP5vIiiCFyWZYH7LMvk3G63ZZ8kCQzDqO8Yp5eazWYFDwxkgu/7GI1GKAq5hlIKYRjKPgiC+t5xHMmRAroLk1496+L0PEWnUxbjMk2z7v76yR6ugw2+eFUDjtDsZFk2oigEL0+e7uHHxTWWcQu2bQsSAuP+5mZdIpxOpwWh6zH43W63cjYME/1+XwqmKVF1JHm9Xsu4UoAjaPLY1fd8fDh5iTz0sDjbQAGS/P74OWaLT9g1zZrUXq/3FwGT37x4jDz0cRVsWBtpluPyXhdRGGLcVUjyOyyjVq1APYKGvO844PC2XcmkFFzXFRQsaJqllOxcy0gSjx7dF2Y/ewUeVGRRmTjeVuP4WJzdIq+k1p4hF8KBZpZkUTpqnGYZ3o4P8P3iSroThVZDe4SmU5PJpNCmILOHPYXTnynSJBHTiBIP+4J45brylQZpKiarndhkRluVASzirlZi5XeHA/HFpdqXcEGgncgLep4Jw+FQAjjjZHyAHcvBXeTj46/fMsyg8LCMd0ork0Ttd98PcDS08DVqVcwDu5aFQUFLK3yLW/WbqVVoIiAHzZfWfKUasn6pPDP+vxzwJ0kqbVw+9X+XbvQHjsQ+KOrRN6sAAAAASUVORK5CYII=",
  coalOre: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqElEQVQ4T2VTPZKBURCcl6lC+UmoIvedgJicI0hdQO4IXMEF3IBIQiRRJZFRRUQVAgJvq3u3Z79dL3m/PdM9PS+Mx+N4vV4No1gsGtaPx4P7bDbL9f1+t1wu52d4pxFGo1HEBg8BOJ/PliSJxchjCyHY5XLhGncalUqFGAZQFlxut1trtVoeDGfKjnmxWDBGp9NhkgAJ6UylUokZkRmPQb/X61GemODN4XD4ZjgcDiOoSwZmgJS5Xq8TKIkCC0MJKh6ynk4n2+/39nw+nSbAm83GXq+XNZtNL2qtVvtlAPByueQjDTDp9/t0BnIQqNvteoFdgihXq1VegqbGbrfzdT6f5z0yu42TySTOZjPu2+02wdKMwGk52Es7ZKOQ3gcCwmt5vF6vvamQWW6oRyAtDAaDCOrQB5/n8zn74L8TYCg5SIB71M0ZuKYQrFAoeBcKCP2r1YqJUNj3+83ieiem/W80GgxwPB4JymQyf9y53W6UQxboRFCRVTiEVRrlctmm0ynp4lwfy/+K/gIAqDCKmS4SzmWr3FFwvP+oQbqJ0Mb66k7pZ6Ev/QUrOUH4ds3ThwAAAABJRU5ErkJggg==",
  glass: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAd0lEQVQ4T2M89/zZfwYywY3nHxgYQQYYSUoxkmPGsnPX/mMYQIqBVWu2ohpAimaQi1EMADknykiLJK9guIDUcOjcfxozDEgxZOBdQLEXBokB5MQ/LMGR5QXk1Ao2gBwXwNIKODOBCJDA449fGWT5ucE0MQCkFgQAJXaGLdPi2dMAAAAASUVORK5CYII=",
  oakPlanks: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABWUlEQVQ4T3VTwUoDMRRMkILbVllWRHspxV77E36A4MWz4KU/4Cf07kW8iZ/gtWf/wyJC2Yqy5NB2BZEt8+qU2bTmkuTlZfJm3sSP76+r8mfpkkbTNZM9F49l+ftvfPL27jwAcAkgGPn0yyVp26WtfQPl4DljeSjsyD/fXVVxIva4EBbftYIAisF8q+Dh9ryaFevXT7P1i9h/FAtbn2Qtm7HHWuNYGwVwf80/Xb9zXHsxjkEPUkF1nTSrU2DZKBUJZZhv9NDSVRf/NLowESkaX6CgZ73ulpCqjR9eDgyAXKGDasDbPKdWzNlogAPleHR4sOUJDSAXrTQAGkkT4jZSF87mnTB3/uXxporVVSD2njHyRwesAtVglw+oD7WhJwhoFaDfQORfQEXWhVDUvEFf6P8wK2uP6XHlCnDj/PfptNUGQF7qBRqJPtj1NwBqGqjflTN5suf6F3i2AmdSAz8rWDB/AAAAAElFTkSuQmCC",
  oakLog: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACx0lEQVQ4Tz1T20+ScRh+PkEgPCCkIAcBkbMpiDa7cJZuutXaqmWbbTVvaquL7vp7Op+Py87n1G5aS8EURQRPeVjmWQEV/dr7MvldfR8f7/M+p59wpb1ejEwsocJYAIlEAp9di1uvQ/C7DXCXqfDkaxSOMhVycnIgiiJKigqwktiESinHwuoGhAsnqsXo1Aqc5iIolUr8CI1BLpfjbKsXDz8N83Ct24A7b3+jsqIEAZcenT1R+B2lCEbnIFxuqxVDkVnYzSWQSUXEptfgsqhR4yzF3XcD8JTv5+c9AGJAg1mABp9JrPEYMTy+CLNWwQANPjPodPeNw2srht+hY4ADdi0/E3DHcT/uvR/MMBAEAUNjC0xxe3ubddJZ3kjxO0kaGP0Lt1XDALff9OP8sWr2igHIvNX1TRTmy7G1tYU6jxG9kVns7u5CKpWCFvSPzDEDp7EAz7vjaKyx4ntoEgJJoA/FqnzWZjUUodKqwc/wH8hkMt58ptmJx19GcKTWhtj0IuJT82g55GKJwtWORjGZTHJ8pLPKoWOaRI9o3v8QRnuLBzdfBdF80M5LDMVKaNWF6AlOZCSQXhoiU8hQuz4PT7+NsmbyhpKgrpxqtHG01BHqBLHLAlDWjz5HUK7PY+ouUyGedcUYhE7f0DTOHa1iYAL0WtRcMuHS6YBI0dV79WwKxbazs5OVRO8jk8uwGtRoqitnKfQbdePBxyEIF0/6uMrkKmmijQqFgo2kP5D+ay9+wWnV4XDAghsv++Bz6fk79YFTID1UjOudvWxibm4uM6DBgNeEwdg8V51qTEPVzlKkUinEZ9YzADRAUa6spbgL6XQ6G6vNpGHDEokEdyIc/8dLyANimr0Le/GRy9RIdf4+jmx1PYW2JgfCE0vZFpIHOo0KXb1jGYCNZBpKhYS3UjmILrGizXRHyHVqK9U6ODzDMdL1Jqb/AQGiU934nA6oAAAAAElFTkSuQmCC",
  oakLogTop:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA2ElEQVQ4y41TIQ4CMRDsazB4UAgsOSQGc8m94TQKj7ngCE/AovlYyTSZzXTbUsRkt9t2urPdDeNhHYfdKsLO503UNWO6Vh8ICLyXMcPrdjL7eUzJMqbA3QAWLC7TNuE+7xOe16NZBfdBnDJQAgSBVkYECGCNAAcYZLot4AwygZ/VAEESqAxNmwT0rQa8xFcgx7+s+1UJPgPGmC5tIaFHQL8mwWrQIlDwVd0vauCLyL5QKX9J6H1jIUG/sdY4BJuskEACbeEesm/0bavD9GugjMCPaG+cOfbAF9SuWTg3yVMfAAAAAElFTkSuQmCC",
  birchPlanks:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA00lEQVQ4T31SMQ4CMQzzV5l4AQzsTIiNGSYkJtZjZUPiAfecQiJcfL7AkKZNrDR2gvG+bY9h08KPz/3c/sSvp3VDAj5FwiJ4u6y+RS3Pd2DCUAHpCaJ5kewgjvNhmRZ3vo+7RRpzvGs8PMgxfnCes5hQydz7PaHABL3q4VSJh/LTHyhoJaTqAufqGnjeMV0D51jO3vTIDnR03q6PUD01QqVuNXvP9w6UY7UHmtOdoKHP27TgD+VeCBY+Y+fci4tWSgkKVABF+iXqZA+cm+qhmlT78QLNQ+ggcLCwKwAAAABJRU5ErkJggg==",
  birchLog:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA0UlEQVQ4y32T3QkCMRCEtx6fxUp8Fiu0hCvBFxHuyQIUDq0gMoEJH0O4gzmS/ZnMbjb13T5NeD2ebV3vHbYJ2svHPWMqAwx+JDJMUgxMp5NTEQ8YBHIsy61dL+d2Oh46tM4ExncC1kMSE5kky5FdseVgNof10mZQZZkpu+7GZjOF7fceasctUOasXscpWfBhxbqyYQ7Oj7aiPEt3YibPhqlmJ2dC9ob+2kvekz56kNc1m3f2Iweu9OM17r2BnIFBwIkzkogDx2ktSpZhpiKfOtd/9yiBCxyFl98AAAAASUVORK5CYII=",
  birchLogTop:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA8UlEQVQ4y4WTMQ7CMAxFeztGxCk4AQyMSIxsCImJCYmJFVY2JA7AERh6iNJv8cJvSFtLv3ad5MeO7apppa7fzWG/Do0tzKaTAGuy2S9IKn1e900Hj+vqp5/b0PgcIqnErp/Tbh64HJeB23mRtIN1EetsJRYI5Az0RASCoNVKKSLQBpyE2wftUSSyIwKx4ITA0/CwIcCONxABh7hF6eQ3+zrRpkeUM48AH+GiPYVUxiEC7FIKowQObvX1SEGfvAo8Gn3hqfxVofQGY2UkgmIZS42T8G0yCKKRnMBbeAydTszb1odpaKDSI0oYWx9rl9KYSz4EZfr0MtlURAAAAABJRU5ErkJggg==",
  cobblestone: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACvklEQVQ4Tz1TTU9aURA9FxDlow8qH0lTITVpqCE21GrFWHVTDa4af4MLNzYxXRlN18b+BLf+AX+A6Qa6oiWlKTUqUD8QHhBAUMAH+HjNDOhs7rszb87MnDlXfN3d1TKZDMgWl5bQarUQCYf5Pr+wwPdfsRhuGw10VRVmsxkDBgPeBYP8LR4A6Ge9Xo90KsXJL0ZHkU6n4ff7+RRC4F86zbHgzAxS/f/El+1t7aXPh9PTU+gAPJEkUEcEWCgUUC6XOcloNKIgy1zEYrHguceDUqkEBmg0GvCPj6NSLiN7dcUJTx0O6HQ6SJKEarWKzOUl+z8sLuJnNMogOVmG2Nvb0+x2++PcOiFQbzRgkyR07u85iXzv5+dRq9WQzWbZd1Ot8ikODg60WCyGZrOJubk51Ot1Rv8eDjMAEfZxZQVnZ2e4uLgAFaOOhoaGUMznITY3N7kDav3NxARyuRwURYHBYMBtrcZVyCS7ncfpdDowmUz4HY9DabUgtra2tG63C1VVmQNqnYyqe7xeeL1eJphYJyJtNhuq19ccdw4PQ6yurmqhUOix0vHxMaqVCs9cLBbxzOVCu9uFLMsMEggEelz0tcM6oOyupnHr1ObfRII7EXo9gsEgg0ciETgcDpRLJeYrtLzcI/HzxoZWu7nBq7ExDtC6HsZQ2m20FIVHIXtY5UPyyckJxKf1dY2YJhAySp6YnITVakUikeB2rysV9lvMZkxOT+Po6IjjlUql18HrQIDZJTJ/RKOscZIrKW1kZIT9f+JxNJpNzMzOIplMcrHL83OI/f19jVaWz+f54dCuTYODvS14PI8boZimqny3ShLu7u4gZ7MQa2trms/ng9vt5kdDsnY5nb2Z+0zTt8PpZPV1VBVtReE4CU7s7OxoqWQSLrebVUabILIGjEZWZq4vXQIjrt5OTbEevh0e8oP6DwoGecA3ajD5AAAAAElFTkSuQmCC",
  oakDoorTop: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABbUlEQVQ4T52TMUvDUBSFz8OhiDYVW2wyqkNtB7H/QlBwdtF/UP+C2FXcRBAXF7OKg9FJsR0Uh0yiRWxSpLSVBlrbjvbKfTG1oUFL7vLg8Djv3u+eJ64Pt8lxmuCKxxPy9Ir1v7SybUGc7a1R67MDIQQA8hkQAVL2lQARSd0o2hDcATsZBRvq3KTvajalwihYgTpfvCpabLBFZduGWWrg+KLke0/Pr9PN42ugzl1Lg939I0o29ECDy4MNOr99GTFgvVJruQa53A6lI2b4DvS8C7Hu9LA0ryE2NSE5tHtf8nwu15BeGNUHI4SDmAQgPIjuFkJD5By0O12YpXogrH8heiOE7oAN3ixLQgyCNRZENpiNKYMgM+Fasyu3kFnUwJHmGta1xLQf4vhR7iOb0n63oPNn+oHI2R+uGSUKjrKrEz6Sm7w9NCpVLEfu3M/EUe4/naDudKEmohj0C0gmbODpTWUV1YdTrGTcHBj37/gG3DxD5ENyrdMAAAAASUVORK5CYII=",
  oakDoorBottom: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABk0lEQVQ4T5WTMUvDUBSFz8NBpNqKiqbQSZDi0KGCoKur4OhoN0EH/4CL6Oqqbo5200mqDlpoB6FDFYSmFJuIQ1LbYtMmiEN5cl9IGlOj9i1JTm7Ou+98N2x7Z5cnhnMolmtIxiVwzqE3LdBaTsRwnpWxEJfEcyaniOvWehKq1sJVXgFLH6zyVrsDrWFhfjaKSGhIFNEyrC5KVc3VGYkMaJld0DfC4GzfNpiIhMEBvBttMMagNUxhEp0adQ0dTZoMiRphcH2U4lVVQSanQpoecYvpho5EbXt12mRlca7XgWPgZOB1GA+P4a5QEUZ+3T1CkAG1SyFeZOVvBqQvJWJ4cUL0GwRR8Op9Bs+KItD9RcFP51Gu91OgIhtrjwJl4deJQub+lShs8KqqBlLQmha0Rofwi9VHYe/whM/U0u4k+tO+LVTcSXTeUUfU5emlDOYfZafo3xTsUTZRLOu//guBFGiUjY4pQhuEgqzodog3xymeLzyJ2aYZ9yauN4nET7qFh9IbNOMTbHMtzmv1D/Ew6KJNvwArckqHjyNqVAAAAABJRU5ErkJggg==",
  ladderOrElse: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAGFBMVEUAAACWdEFRPSR+Yje1jVBnUCw6Lx7///93LYupAAAAAXRSTlMAQObYZgAAAAFiS0dEBxZhiOsAAAAHdElNRQflAwESMSXnupnPAAAAOUlEQVQI12NgEGIAAiDB7Cwi4uLo7MDAaqoaGhpkGsDAoAaSUoNIgwkWZxEXEUHCaoDmGBBQg8MuABzWDwxlLkg5AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIxLTAzLTAxVDE4OjQ5OjM3KzAwOjAw1mJGNAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMS0wMy0wMVQxODo0OTozNyswMDowMKc//ogAAAAASUVORK5CYII=",
  snowGrass: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQ0lEQVQ4T3VTz2sTURD+XlFUkI0mQbq7NBFiExBv3VaIOZjmoh6sSG8qeLFQ8CCCIP4DORTxmEM96VWpxZs/kpugXU8eajap0qbZrDWbuDkp2jyZSV4SK93L7Js3833ffLMrfuzuSux5DgmBw0L8k/0pe2Wj+aDbhSCA0NgYX6oi1UnFlFNN9P6rD0Q9AwBqIFbFsBdIAarmUWnic7vN2nRNA70Q8n4ARPE1CGCEQmgEAeOIl+vrMqnrKLsuKI5rGhqdDgMqmXSmJq/T4SaqTRkGR3H/6iWZyT/Ch5WHuLa4BEnG9MdRhdTkNDw8uXkBWSsDL3YUM3N3cPB5AeJV/q58vPoCCfM0DsyYuLG4hKeFe/j9voaclcJKXUM0/g2ZP0dQdX1sNVqI68ex6bYQM8IQr/PXZdGuIGdNoitPoFLfYQU1rw2BHcT0CIprDs5b5yDwHTWvxWPE9DBoIaJw+6JUyYnxMLYaPuJGhJk26k0kzCiDSCkHzQSg7hiARi7ZDherS4rq3F89qC47leSaol1mIgagBKkYvcxNp1DZbqL00cHC5TSvuGg7LB3oIpjIobP27P8RqDBpRvHGLuOkHsEncQpnZJVZiYSkZ60UNt0mvrg+xIP5s3KYpPl75kyaUby1y4OVsmH934P8mLVSvQ+JAMgkMm/UHDKUtkF5Irg1l8by6jv2ZXYqCafeBOENtlDdbmLhSprnVA6rqL79jbqPhNnbCJGyAjKRVpazhqg1z4c2PY9jtRKbp+anSMqGfvj4C/aYOS+BgKHCAAAAAElFTkSuQmCC",
  furnace: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACRklEQVQ4T22TS08aURTH/0MXQJRXYHg5wkINiCygSSO7QmI0TbAQtxo/BKwaPwOsZYMxcauBrhpiQnfaNCksTDfqAhgediC8NMACprl3MhMw3M299+Se3znnf85lYoeHoiiKkNc/QYCVZRfu8sXGsngRBHq1Wa10Z75Go6KT40AgJpOJGrvdLj3L+4Kt14PJaARfrWIwGIAJ7e6Kmxsb4FwuOJ1ONBoNGAwGVCoVGI1G6PV66HQ6DIdDuvM8jx6BmEz4+/AgZeBYW4Pb7QbDMMjncqjWakoJ8wfX+jpi8Tj6/T6FNHheAvj8fhrpez6PUrm81Fk2BgMBhCMRWsLT87NUAjEQYvbiAh9UKsxmM1gsFqoLFYph0G63oVKpMJ1OkUql8OvuTgLEolFx2++XANksdfgYDC7N4k+pRO0ygOiiZEAEtDsc9IFGo1kKGI/H1N5qNqnYP4tFCfA5HKYakLaQ1r0NBuDcbuW8otcvtJW8IWU163VJxG9nZyADxFosSs3vU5gfNuJc43lcXV5KgOPTU0UwrVaLyWSCp8fHBcbm1hbUajVGoxHIm067jcz5uQSIHx1hZXUVL60Wft/f47ZYRKfToWmSRaKbzWbsRSL4FArBZrfj7fUVuZsbCbC3v08f3hYK+FEoKI7LyvhycACvzweP14vc9bUE2N7ZAcdxSCaTijOZg/lF5kDOJpPJ0NEmAWkXjk9OUK/XkU6nwbKsosf7DEhJgiAgkUjA4/FIGhBAIBhEuVRSos9/53kI6ZSchezzH7aWHvP2VHPLAAAAAElFTkSuQmCC",
  whiteConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAoElEQVQoz21SAQ6EMAjr/x/nuTj1OxJ7q7UzIaTbgBYGfvux9H09zgLliXnkjePyqAh/05FgzkQ88FieVASOEXrK2qCisVAbFaFoWfBEJ2C2xz1sWxdP4Wxa45onI9l/BrHf1kOkyjEMLjF+47M3uOjPwmqdHm1E+BBdZNDC9XjCbPnTvkWq3Uze66djoK6QaQ9D7FxMbF4c+G4p2aNj4hdKoXpiwnOMOQAAAABJRU5ErkJggg==",
  lightGrayConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAlElEQVQoz21SWwrAMAzyzNs+2519AYM4UyjFxjxN8b7P3nedta7C8ay7MAFvyEqCgAG0EzBXHUTiCJtFQDqc9BRL78KIdr2Z4xMeTc7pWRyqePT2Sbql47iiiXX3DFNQje4Few9qI7YWokkuRKYpqPToGeILxJTyloYIcbyg55bltzgRIa5TiKV69/FTDgGxgWkp8AFKt20ox3jNZAAAAABJRU5ErkJggg==",
  grayConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAgklEQVQokYVSCQ6AMAjjVZ5R//8rMSQdFJjJYmCspQVlPW49y35ZgNQOXepXEKGMp4SxVHLZ0yMGUiZKfGfcs6SSezsfBAWgUz88eFVUJg8fgF7ToGjiAVBOM6uVjqnTWXigboQXn0+IA+CXlU3rOsr5kKWxuE5V/h2DB9t/Jvb99bz2063byK2koAAAAABJRU5ErkJggg==",
  blackConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAq0lEQVQoz3WSWwrDQAwD9dcmLX3c/7J1mTIoGwqLURzJlr2b6/7c7+85l+0xeM52ew2eCCAzZzgTA3UiysGy1YOJIYvGqjZsPZmoXgy0je6Ttt4MrdqKGCbWWOu7Cpzv0Fh0XGobSdIWnP5eJnFiwW9L574qyTcnXQMPfQmy/RXr9e406TIkZLn8nufMPgjOD2G5FuzlX2sx41n3IFiWq8leV/RgjX6F3Rb8AXbuIjZ1rkwcAAAAAElFTkSuQmCC",
  brownConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAApklEQVQoz3VSixHFIAhjkzZztM4Cb/8lXquCfOyd1yIYQ4jE1/G7T7kOicHI9wX94imRZk9ZJzLeShPw/FgLIzZkWovBd8IfVONSStR1m1ql2n2VZFtWBtjFGiO2BMNTlTWCV0lDrMaxel4vxuc7QzM6eAFrvg1+ErQVZ4Dk2suQqNkdHZwcR9wBkxSRDUlJcDr1un1RE1CFyu51GGYZFxwo5oja8gebObuZKhFp+QAAAABJRU5ErkJggg==",
  pinkConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAA1UlEQVQoU21SiRHDMAhjWKeZxk12C+48BcSXtHdczsYCCRHiMXm8P68TsewsSb1uh163I58kCCng5HCD7nrwkOSuNeQXQzgIDIZjMNgBTasAwlZ8wczRItkIbys6Ac2h0Fs0hVTQiKzPp6wXqZTjOnVjuDFHkIsDunVFwTVmar7MwBg6Pd3/2J8tjCF0lxUPlxutkKgkVtHzaW7ZPXMtKzeNMcqA+FPQqHYiM2RBWdmgXn+bIVK9ICVlvXmtjlGHcjMeDPzThWCl48yAGkOX4yuCaQL+AtbuyXHgaK2tAAAAAElFTkSuQmCC",
  magentaConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAwklEQVQoz11SQQ7DMAjjR13y33Xc1u6VI5gYioQiQrAxELlfH7Pf0GVTr+OEYyeezCLoEYlUJLkt/AbUVPBKJSOSvgFq3AFPJaC36/d4E4AzKjShQbm12XXFpy78LD0wimzQkws14QvImNok2YknmPnC4XjSyY4pOusMzSmFqqFNAIfB3rJC1VO5mQqRAqGsaD7pCcvlpqSy2sjwgsDDdoU947a7B3jkJEJS+20A0K/fSarQRsl2ufv8GpWjbTckbNI/avV49T4yfrIAAAAASUVORK5CYII=",
  purpleConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAs0lEQVQoz2VRiRHAIAhjk9bZ2k6l7lo+I+Bdz4KQmAB993yvYR/i5+pfm5zyafeS6g1JcqPWpaxNj8YIrJsD0l/nEx3lQaNDYIBFszQ4ZROWLUFJyfUtGhBzTVk6uP2FlLfNhPsilWA/So/aohkHYAhQXBwbqbVRHuIeZYCJE7OkgOA1ficy7QH7ioAyNzeNISTf2ECbFfBmwDnWOPH0QllI1H16GJXyBCyRVEcel9DmWfoBggQge0YrCH4AAAAASUVORK5CYII=",
  blueConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAlElEQVQokX1S2xGAMAhjIF+ToiPbisYQqnd8tEASUmrzekzLztEykeTSst0Z4w5pAqwFAzzuUUAAcLU6WEz4vqa6Dh1mjQByXJYzRrCfvqFy9xAKPHQMkAdz9QAF1ql+jC+Z2NkbIik84bKBBODat92XIgFkX7V0e6g/h57F5T0GACHWPWAJoKyCLJL+Em+wWPcwdgLVcOqBQ5nSMgAAAABJRU5ErkJggg==",
  lightBlueConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAA4UlEQVQoU1VSAQ4DIQjjL0O/qtu/YHvWkAJyCTHeQUuL0Pj8Xu/vtHOJXU5sv2zFyZbaamUIsm+rZocBbMGeA2AgayxGsZU4EoIK8CW9gKtSFuRQCRkWS0YVORJK0GQeQGqw0mhdNlpAuV2ouXRV0JruR3nbOj1LfQIj3d9xXdOKFF2veaLDQ2TBjqTGUbkclxRxENlYr+lCLtjQ+v+QFFN33zMtciHXnUe+Q3bgHH/IcwPlLe2JA4Kmb0F7B0hYMWKa4Uk5q6NDW61+J7jpw01WqUcsrhEectW4UYK1LxLK/o1Gc51dHEMGAAAAAElFTkSuQmCC",
  cyanConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAsElEQVQoz3VSAQ4DIQjrJ2781O0HuF9PhYPCtsQY1FJKBddz2nq83tfQE6sd9019XTv2eeMcFFBGZ/5QMFnHecFSBI445SJB6qUQHaSWTvR3wUOBiDLzEK+uQqexWIBU4jjOcaJ4DUlpkcVsXSR7QuEjraXm0Njh6ouDyj4K6ak9BKh5YL7dzYDUT3OmuElqhXtglc0uuyySeFTsX/8Ny3pCq95naXSRoKmeP+e5/ekHlj8U6keQMxcAAAAASUVORK5CYII=",
  greenConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAoklEQVQoz3WRyxHAIAhEtxhCLZISMP3XkQOouI4zHBg+7luEdYl4v2fLPZMRGi1EL6ajOjdH8akJmnNpTGuttxRUVF1iez+1fC55mguial3MxaaaLzPkDYQ7ASpPpUCtUsx7VFoEGWHkju/iLqxwd7/wwAzHMtHi7lLZlYt1yY+rAK3e9zgdqBEvVR5ywqbP/2r7fp6V5ohq81AA9KYzW9blB2ZZyT6my4nWAAAAAElFTkSuQmCC",
  limeConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAA3klEQVQoz12SgQ3EIAwDM0bLz9by28F3yk84MFElhJKAYztgVz/qc36f4vv9O+5++O4xqZ9eLVYcjWWKrr6r9Sl+qY4uqgeyH0Y+jk/fnUoM6g1PcDpg6PlkBipIBaa6c05JfgPRdTDICY0msiNpKJOwGSwNka4jVxsAErouowW5YIBJnmW0JG2GtmETsMecWoL3hbc1wJiNadK8HbchySOOeFRMtvS6xOh+1UNS9pQHJQP40axNnXIzPLwelBhAkYx447bepCWq5dP4BTiBjXTGbTPzZUxCRUqq6b0wf3WSH3Vw4JwOAAAAAElFTkSuQmCC",
  yellowConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAA90lEQVQoU11SixGFMAhjiWr3H0DbyaxO8EgC6L07DinySdLaM9o62zraTV/BM3f/FX60W/5sxmz388Uib0bAKZ5kZ4dHw+ZmNUmzWb1djN08RifzOM7dFj5vtrar4hJIZlA5mnFMmm+Ddc0WaNWpYYHDBDL9A1xmxad86eEFlvNCHz9qhDpl5BlDY4MIJdFg/GcqM2mCAcQDAY5U9vhcERs8D9KBhMqEfIUwxZGMJJ1K38lVmmQMwIq10AKPAFTR7HEDOaj6sYGQ8ChCys/jqYXSFA0FDti4VFOD6weM8oaUEOteMxDjl0l6vqV4FO+bA4EUPiDl8QeEq7Xpb7WlLQAAAABJRU5ErkJggg==",
  orangeConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAA6klEQVQoU01SCRLEIAir9qO7+m+3/mTJAXXGaVFIQtBrz/77XHu0/b2wRsOW8YMts9oy8C/WAqzveeM7us+JrxUUKHoYnTrKLRYdai2KL1EKQAzo3V4io8bg2VMLm1t8rGDrwSVl0dOSmKCFo4lvgOmnZRGzQs7b0k5IhB3Kg+LyFlyHLszkcNl30ntpNsa9jeYADnBbsl4elFYbVeprGagOjLJQIDduRzQlhQbkQSfJlRHtaqA6UToDXs7oC6azOT8KYopCYJkU4+GhesgpqTSt2/fbkkVK0MtdkQvD8HxcxzdTZC/YdwKKPyPxQi2kyQCXAAAAAElFTkSuQmCC",
  redConcrete:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAvUlEQVQoz21SAQ6EMAjjKXP7ruiXb1KoxVxCljkoLVS7j+Maw8fYJ+/3nF6f+47UE3Ma6/YJGACtOvBI2Sk9NIeWbISaHZYtpZ8GqbxeTOtUrg52rwXkjpzhFY3h4oXkmQqYse6SiVMMmSN7xiWHJolXooFFgv3lpWjSksoy19lZmi2CAYTNOCyk2YeoTTySEroWB30XVeaQMLekilHn3RYXv007KYn67SLYvtUqZjOHVBew0Vf+0g1TVDTnB8N/0AN3NSH0AAAAAElFTkSuQmCC",
}
var blockIds = {}
var idBlocks = []
var i = -1
for (var name in blockData) {
  i++
  blockIds[name] = i
  idBlocks[i] = name
  var code = blockData[name]
  blockData[name] = new Image()
  blockData[name].title = name
  blockData[name].src = "data:image/png;base64," + code
}
var currentBlock = 0

//fill picker
for (var i in blockData) {
  var div = document.createElement("div")
  div.classList.add("block")
  div.appendChild(blockData[i]) //append image
  div.title = i
  div.setAttribute("onclick", "select(" + blockIds[i] + ")")
  picker.appendChild(div)
}
function select(id) {
  //deselect
  var divs = picker.getElementsByClassName("block")
  for (var i = 0; i < divs.length; i++) {
    divs[i].classList.remove("selected")
  }

  divs[id].classList.add("selected")

  currentBlock = id
}
select(0)

var grid = []
var gridSize = 20
var gridW = 30
var gridH = 20
for (var y = 0; y < gridH; y++) {
  var row = []
  for (var x = 0; x < gridW; x++) {
    row.push(0)
  }
  grid.push(row)
}
function clearGrid(remote) {
  for (var y = 0; y < grid.length; y++) {
    var row = grid[y]
    for (var x = 0; x < row.length; x++) {
      setBlock(x, y, 0, remote)
    }
  }
  drawGrid()
}
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (var y = 0; y < grid.length; y++) {
    var row = grid[y]
    for (var x = 0; x < row.length; x++) {
      var block = row[x]
      if (block) ctx.drawImage(blockData[idBlocks[block]], x * gridSize, y * gridSize, gridSize, gridSize)
    }
  }
}
function setBlock(x, y, block, remote) {
  if (y > -1 && x > -1 && y < grid.length && x < grid[y].length) {
    grid[y][x] = block
    if (multiplayer && !remote) {
      sendHub({
        type: "setBlock",
        data: { x: x, y: y, block: block }
      })
    }
  }
}
function getBlock(x, y) {
  var b
  if (grid[y]) {
    b = grid[y][x]
  }
  if (b || b === 0) {
    return b
  } else {
    return -1
  }
}
function spreadGrass() {
  for (var y = 0; y < grid.length; y++) {
    var row = grid[y]
    for (var x = 0; x < row.length; x++) {
      var block = row[x]
      if (block === blockIds.dirt && !getBlock(x, y - 1)) {
        setBlock(x, y, blockIds.grass)
      }
      if (block === blockIds.grass && getBlock(x, y - 1)) {
        setBlock(x, y, blockIds.dirt)
      }
    }
  }
  drawGrid()
}
function dirtToTerrain(){
  var dirt = blockIds.dirt
  var strips = []
  var prev = 0
  var strip
  for(var x = 0; x<gridW; x++){
    prev = 0
    for(var y = 0; y<gridH; y++){
      var block = getBlock(x,y)
      if((prev !== dirt) && (block === dirt)){
        strip = [x,y]
      }
      if((prev === dirt) && (block !== dirt)){
        strip.push(x,y)
        strips.push(strip)
      }
      prev = block
    }
  }

  for(var i=0; i<strips.length; i++){
    strip = strips[i]
    for(var y=strip[1]; y<strip[3]; y++){
      var Y = y - strip[1]
      var block
      if(Y === 0){
        block = blockIds.grass
      }else if(Y < 3){
        block = dirt
      }else{
        block = blockIds.stone
      }
      setBlock(strip[0], y, block)
    }
  }

  drawGrid()
}
function loadSave(str) {
  var arr = str.split(",")
  grid = []
  var row = []
  grid.push(row)
  var x = -1
  for (var i = 0; i < arr.length; i++) {
    x++
    if (x >= gridW) {
      row = []
      grid.push(row)
      x = 0
    }
    row.push(parseInt(arr[i]))
  }
  drawGrid()
}
function getSave() {
  var str = ""
  for (var y = 0; y < grid.length; y++) {
    var row = grid[y]
    for (var x = 0; x < row.length; x++) {
      var block = row[x]
      str += block + ","
    }
  }
  str = str.substring(0, str.length - 1) //remove trailing comma
  return str
}

var BG = "white"
function getBG() {
  return BG
}
function setBG(color, remote, leavePicker) {
  BG = color
  canvas.style.background = BG
  if (multiplayer && !remote) sendHub({ type: "BG", data: BG })
  if(!leavePicker){
    BGBox.value = BG
    BGPick.value = BG
  }
}

var servers = ["thingMaker:Multiplayer", "thingMaker:Building contest", "thingMaker:Minecraft Terrain"]
var serverData = {}
var hub = servers[0]
//fill serverSelect with the servers
for (var i = 0; i < servers.length; i++) {
  var option = document.createElement("option")
  option.innerHTML = servers[i]
  serverSelect.appendChild(option)
}
serverSelect.onchange = () => {
  var value = serverSelect.options[serverSelect.selectedIndex].text
  serverData[hub] = {
    grid: getSave(),
    BG: getBG()
  } //store the grid
  if (serverData[value]) {
    loadSave(serverData[value].grid) //preload the grid
    setBG(serverData[value].BG, true)
  } else {
    clearGrid(true)
    setBG("white", true)
  }
  chat.innerHTML = ""
  initMultiplayer(value)
}

var player = {
  x: 0,
  y: 0
}
var players = {}

mouseMoved = () => {
  player.x = mouseX
  player.y = mouseY

  you.style.left = player.x + "px"
  you.style.top = player.y + "px"

  if (mouseDown) {
    var x = Math.floor(mouseX / gridSize), y = Math.floor(mouseY / gridSize)
    if (getBlock(x, y) !== currentBlock) setBlock(x, y, currentBlock)
    drawGrid()
  }
}
drawGrid()
onMouseDown = () => {
  var x = Math.floor(mouseX / gridSize), y = Math.floor(mouseY / gridSize)
  //currentBlock = (getBlock(x,y) + 1) % idBlocks.length
  setBlock(x, y, currentBlock)
  drawGrid()
}

class Player {
  constructor() {
    this.el = document.createElement("div")
    this.el.classList.add("player")
    document.body.appendChild(this.el)
  }
  pos(x, y) {
    this.el.style.left = x + "px"
    this.el.style.top = y + "px"
  }
  remove() {
    this.el.remove()
  }
}

var multiplayer = null
function sendHub(obj) {
  if(!multiplayer) return
  let str = JSON.stringify({
    "toH": hub,
    "msg": JSON.stringify(obj)
  })
  multiplayer.send(str)
  return str
}
function sendUser(user, obj) {
  if(!multiplayer) return
  let str = JSON.stringify({
    "to": user,
    "msg": JSON.stringify(obj)
  })
  multiplayer.send(str)
  return str
}
function initMultiplayer(server) {
  if (multiplayer && server === hub) {
    return
  } else {
    hub = server
    for (var i in players) {
      players[i].remove()
    }
    players = {}
    if (multiplayer) multiplayer.close()
  }

  // We use the hub: "Multiplayer"
  multiplayer = new WebSocket("wss://ws.achex.ca")
  multiplayer.onerror = e => popup(e)
  multiplayer.onclose = () => {
    clearInterval(multiplayer.pos)
    popup("Connection lost!")
  }
  multiplayer.onopen = () => {
    multiplayer.send(JSON.stringify({
      "auth": username,
      "passwd": "none"
    }))
    multiplayer.send(JSON.stringify({
      "joinHub": hub,
      "passwd": "none"
    }))
    sendHub({ type: "getSave", data: "" })

    multiplayer.pos = setInterval(() => {
      sendHub({ type: "pos", data: player })
    }, 200)
  }
  multiplayer.onmessage = msg => {
    msg = JSON.parse(msg.data)
    var author = msg.FROM
    var data = msg.msg ? JSON.parse(msg.msg) : {}

    if (data.type === "pos") {
      var pos = data.data
      if (!players[author]) {
        players[author] = new Player()
      }
      players[author].pos(pos.x, pos.y)
    } else if (msg.leftHub === hub) {
      players[msg.user].remove()
      delete players[msg.user]
    } else if (data.type === "getSave") {
      sendUser(author, {
        type: "loadSave",
        data: getSave(),
        BG: getBG()
      })
    } else if (data.type === "loadSave") {
      loadSave(data.data)
      setBG(data.BG, true)
    } else if (data.type === "setBlock") {
      var pos = data.data
      setBlock(pos.x, pos.y, pos.block, true)
      drawGrid()
    } else if (data.type === "BG") {
      setBG(data.data, true)
    }else if(data.type === "chatMsg"){
      chatMsg(author, data.data)
      notification.clear()
      if(!document.hasFocus())notification(data.data)
    }
  }
}

window.onload = () => {
  initMultiplayer(hub)
}