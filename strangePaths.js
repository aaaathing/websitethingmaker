
app.use(getPostTextSmall,async(req,res,next) => {
	let path, e
	try{
		path = decodeURI(req.url)
	}catch(err){e=err}
	if(e || path.match(/[\p{C}`~!@$%^=+\{\}\[\]:;<>]/u)){
		console.log("suspicious:", where(req), cap(req.username+":"+req.who.id), req.method, req.url, req.body ? "body:"+JSON.stringify(req.body) : "")
		if(e)console.error(e)
	}
	next()
})