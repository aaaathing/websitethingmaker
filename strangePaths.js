
app.use(getPostTextSmall,async(req,res,next) => {
	let path = decodeURI(req.url)
	if(path.match(/[\p{C}`~!@$%^=+\{\}\[\]:;<>]/u)){
		rateLimit(req)
		console.log("suspicious:", where(req), cap(req.username+":"+req.who.id), req.method, req.url, req.body ? "body:"+JSON.stringify(req.body) : "")
	}
	next()
})