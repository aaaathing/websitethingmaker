let updatesStyle = `
.updates{
  font-family:sans-serif;
}
.update{
  border:1px solid gray;
  padding:8px;
  margin-bottom:8px;
}
.updatename{
  margin:0;
  cursor:pointer;
}
.updatename:hover{
  text-decoration:underline;
  color:blue;
}
.updateinfo{
  color:gray;
}
.updatesLoad{
  width:100%;
  background:#ddd;
  border:1px solid gray;
  cursor:pointer;
}
.updatesLoad:hover{
  background:#aaa;
}
.updateModal{
  position:fixed;
  top:25%;
  left:25%;
  width:50%;
  height:50%;
  overflow:auto;
  padding:8px;
  border:1px solid gray;
  box-shadow:0px 0px 15px 3px black;
  background:white;
  z-index:2;
}
.closeupdate{
  float:right;
  font-size:24px;
  width:24px;
  height:24px;
  border:1px solid gray;
  background:#ddd;
  border-radius:100%;
  padding:0;
  cursor:pointer;
}
.closeupdate:hover{
  background:#aaa;
}
`
function createHTMLForUpdate(i){
  let time = (new Date(Date.now()-i.timeSinceUpdate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }))
  let resolved = i.resolved ? "<span style='color:green;'>Issue resolved</span> "+(new Date(Date.now()-i.resolved).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })) : (i.isIssue ? "<span style='color:red;'>Issue</span>" : "Update")
  return `
<h3 class='updatename' onclick="showUpdateModal('${i.id}')">${i.name}</h3>
<span class='updateinfo'>
${time}<br>
${resolved}<br>
${i.id}
</span><br>
<p>${i.desc}</p>
`
}
async function showUpdates(el){
  let error
  let updates = await fetch('/updates/all').then(r => r.json()).catch(e => error = e)
  if(error){
    return el.innerHTML = `Failed to load updates. ${error.toString()}`
  }
  if(updates.status === "offline"){
    return el.innerHTML = updates.reason
  }
  updates.reverse()
  el.className = "updates"
  el.innerHTML = `
<div class="updatesContainer"></div>
<button class="updatesLoad">Load more</button>
<style>${updatesStyle}</style>
`
  let c = el.querySelector(".updatesContainer")
  let btn = el.querySelector(".updatesLoad")
  btn.onclick = loadMore
  let loaded = -1
  async function loadMore(){
    let loading = document.createElement("div")
    loading.innerHTML = "Loading..."
    el.appendChild(loading)
    let loadedUpdates = [], p = []
    for(let i=0; i<5; i++){
      if(loaded+1 >= updates.length){
        btn.remove()
        break
      }
      loaded++
      p.push(fetch('/updates/update/'+encodeURIComponent(updates[loaded])).then(r => r.json()).then(r => loadedUpdates[i] = r).catch(e => e))
    }
    await Promise.all(p)
    for(let i of loadedUpdates){
      let div = document.createElement("div")
      if(i.name){
        div.innerHTML = createHTMLForUpdate(i)
        div.id = "update_"+i.id
        div.className = 'update'
      }else{
        div.innerHTML = i.toString()
      }
      c.appendChild(div)
    }
    loading.remove()
  }
  loadMore()
}

async function showUpdateModal(id){
  let div = document.createElement("div")
  div.innerHTML = "Loading update..."
  let update = await fetch('/updates/update/'+encodeURIComponent(id)).then(r => r.json()).catch(e => e)
  if(!update) return div.remove()
  if(update.name){
    div.innerHTML = "<button class='closeupdate'>&times;</button>"+createHTMLForUpdate(update)
    div.id = "update-modal_"+update.id
    div.className = 'updates update updateModal'
    div.querySelector(".closeupdate").onclick = function(){
      div.remove()
    }
  }else{
    div.innerHTML = update.toString()
  }
  document.body.appendChild(div)
}