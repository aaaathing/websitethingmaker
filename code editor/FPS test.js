var f=0,l=0,lf=0
draw=function(){
  var n = performance.now()
  f++
  if(n-l>1000){
    l=n
    lf=f
    f=0
  }
  background(255)
  fill(0)
  text(lf,100,100)
}