app.use(getPostTextSmall)
app.use(async(req,res,next) => {
	if(req.url.match(/[\p{C}`~!@$%^=+\{\}\[\]:;<>]/u)){
		Log("suspicious: ", where(req), cap(req.username+":"+req.who.id), req.method, req.url, req.body)
	}
})