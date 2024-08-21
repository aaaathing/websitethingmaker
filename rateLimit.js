let rates = {}
const usernameLimit = 5 //How many different usernames
//only rate limit uploads
let banFromMineKhan
function getRate(i){
  if(!rates[i]) rates[i] = {time:null,amount:0,requests:[],usernames:[]}
  return rates[i]
}
function rateLimit(req, diffUsernames = false, addamount=0.1){
  if(req.isAdmin) return
  let r = getRate(req.clientIp)
  r.time = Date.now()
  r.amount+=addamount
  r.requests.push(req.path)
  if(r.amount > 1){
    banFromMineKhan(req.username,"Too many requests. Requests: "+r.requests.join(", "),1000*60*60*24,req.clientIp,"rateLimit")
    return true
  }
  if(diffUsernames && !r.usernames.includes(req.username)){
    r.usernames.push(req.username)
    if(r.usernames > usernameLimit){
      banFromMineKhan(req.username,"Too many requests. Requests: "+r.requests.join(", "),1000*60*60*24,req.clientIp,"rateLimit")
      return true
    }
  }
}
setInterval(() => {
  let n = Date.now()
  for(let i in rates){
    if(n - rates[i].time > 60000){
      delete rates[i]
    }
  }
}, 1000)
module.exports = b => {
  banFromMineKhan = b
  return rateLimit
}
