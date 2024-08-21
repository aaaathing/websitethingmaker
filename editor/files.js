if(!document.querySelector("#fileEditorStyle")){
  const style = document.createElement("style")
  style.innerHTML = `
.fileEditorContainer{
  font-family:sans-serif;
  overflow:auto;
  padding:8px;
}
.fileEditorContainer > button{
  position:sticky;
  top:0;
  padding:5px;
  border:none;
  border-radius:100%;
  cursor:pointer;
  background:#fff;
  transition:0.5s ease;
  z-index:2;
}
.fileEditorContainer > button:hover{
  background:#ccc;
}
.pathContainer .filename{
  cursor:pointer;
  position:relative;
}
.pathContainer .filename:before {
  content: "";
  display: block;
  position: absolute;
  border-top: 1px solid black;
  width: 8px;
  left: -8px;
  top: 9px;
}
.pathContainer .filename:hover, .pathContainer .selected{
  background:#ccc;
}
.pathContainer .file{
  margin-left:16px;
  position:relative;
}
.pathContainer .file:before{
  content:"";
  position:absolute;
  height:100%;
  border-left:1px solid black;
  left:-8px;
}
.pathContainer .file:last-child:before{
  height:9px;
}
`
  style.id = "fileEditorStyle"
  document.head.appendChild(style)
}
function createFileEditor(options){
  var container = document.createElement("div")
  container.className = "fileEditorContainer"
  container.innerHTML = `
<button class="newFile">
<svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-1gcl232" style="vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.05546 2.05546C4.57118 1.53973 5.27065 1.25 6 1.25H14C14.1989 1.25 14.3897 1.32902 14.5303 1.46967L20.5303 7.46967C20.671 7.61032 20.75 7.80109 20.75 8V20C20.75 20.7293 20.4603 21.4288 19.9445 21.9445C19.4288 22.4603 18.7293 22.75 18 22.75H6C5.27065 22.75 4.57118 22.4603 4.05546 21.9445C3.53973 21.4288 3.25 20.7293 3.25 20V4C3.25 3.27065 3.53973 2.57118 4.05546 2.05546ZM6 2.75C5.66848 2.75 5.35054 2.8817 5.11612 3.11612C4.8817 3.35054 4.75 3.66848 4.75 4V20C4.75 20.3315 4.8817 20.6495 5.11612 20.8839C5.35054 21.1183 5.66848 21.25 6 21.25H18C18.3315 21.25 18.6495 21.1183 18.8839 20.8839C19.1183 20.6495 19.25 20.3315 19.25 20V8.75H14C13.5858 8.75 13.25 8.41421 13.25 8V2.75H6ZM14.75 3.81066L18.1893 7.25H14.75V3.81066ZM12 11.25C12.4142 11.25 12.75 11.5858 12.75 12V14.25H15C15.4142 14.25 15.75 14.5858 15.75 15C15.75 15.4142 15.4142 15.75 15 15.75H12.75V18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18V15.75H9C8.58579 15.75 8.25 15.4142 8.25 15C8.25 14.5858 8.58579 14.25 9 14.25H11.25V12C11.25 11.5858 11.5858 11.25 12 11.25Z"></path></svg>
</button>
<button class="newFolder">
<svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-1gcl232" style="vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 3.75C3.66848 3.75 3.35054 3.8817 3.11612 4.11612C2.8817 4.35054 2.75 4.66848 2.75 5V19C2.75 19.3315 2.8817 19.6495 3.11612 19.8839C3.35054 20.1183 3.66848 20.25 4 20.25H20C20.3315 20.25 20.6495 20.1183 20.8839 19.8839C21.1183 19.6495 21.25 19.3315 21.25 19V8C21.25 7.66848 21.1183 7.35054 20.8839 7.11612C20.6495 6.8817 20.3315 6.75 20 6.75H11C10.7492 6.75 10.5151 6.62467 10.376 6.41603L8.59861 3.75H4ZM2.05546 3.05546C2.57118 2.53973 3.27065 2.25 4 2.25H9C9.25076 2.25 9.48494 2.37533 9.62404 2.58397L11.4014 5.25H20C20.7293 5.25 21.4288 5.53973 21.9445 6.05546C22.4603 6.57118 22.75 7.27065 22.75 8V19C22.75 19.7293 22.4603 20.4288 21.9445 20.9445C21.4288 21.4603 20.7293 21.75 20 21.75H4C3.27065 21.75 2.57118 21.4603 2.05546 20.9445C1.53973 20.4288 1.25 19.7293 1.25 19V5C1.25 4.27065 1.53973 3.57118 2.05546 3.05546ZM12 10.25C12.4142 10.25 12.75 10.5858 12.75 11V13.25H15C15.4142 13.25 15.75 13.5858 15.75 14C15.75 14.4142 15.4142 14.75 15 14.75H12.75V17C12.75 17.4142 12.4142 17.75 12 17.75C11.5858 17.75 11.25 17.4142 11.25 17V14.75H9C8.58579 14.75 8.25 14.4142 8.25 14C8.25 13.5858 8.58579 13.25 9 13.25H11.25V11C11.25 10.5858 11.5858 10.25 12 10.25Z"></path></svg>
</button>
<button class="deleteIt">Delete</button>
<button class="renameIt">Rename</button>
<button class="uploadFile">Upload file</button>
`
  let pathContainer = document.createElement("div")
  pathContainer.className = "pathContainer"
  container.appendChild(pathContainer)
  ;(options.parent || document.body).appendChild(container)
  let paths = {all:{}}
  let selected = ""
  function getPath(path){
    path = path.split("/")
    let c = paths
    for(let i of path){
      if(!i) continue
      c = c.all[i]
      if(!c) return false
    }
    return c
  }
  function getFolderPath(path){
    path = path.split("/")
    let folderPath = []
    let c = paths
    for(let i of path){
      if(!i) continue
      if(typeof c.all[i] !== "object") break
      folderPath.push(i)
      c = c.all[i]
      if(!c) return false
    }
    return folderPath.join("/")
  }
  function setPath(path,content){
    path = path.split("/")
    let name = path.pop()
    if(!path.length && !name) return Object.assign(paths,content), null
    let c = paths
    for(let i of path){
      if(!i) continue
      c = c.all[i]
      if(!c) return false
    }
    c.all[name] = content
  }
  function deletePath(path){
    path = path.split("/")
    let name = path.pop()
    let c = paths
    for(let i of path){
      if(!i) continue
      c = c.all[i]
      if(!c) return false
    }
    delete c.all[name]
  }
  function update(path){
    return options.load(path).then(r => JSON.parse(r)).then(r => {
      if(r.folder){
        let name = path.split("/").pop()
        let o = {name,all:{}}
        for(let i of r.folders){
          o.all[i] = {name:i,all:{}}
        }
        for(let i of r.files){
          o.all[i] = ""
        }
        setPath(path,o)
        return o
      }else{
        setPath(path,r.content)
        return r.content
      }
    })
  }
  function clickFile(){
    selected = this.id.replace("file_","")
    openPath(selected)
  }
  function updateHTML(thisPaths = paths, el = pathContainer, prefix = ""){
    if(el === pathContainer) el.innerHTML = ""
    prefix = prefix ? prefix+"/" : ""
    for(let i in thisPaths.all){
      let j = thisPaths.all[i]
      let div = document.createElement("div")
      div.className = "file"
      let name = document.createElement("div")
      name.className = "filename"
      if(options.getIcon){
        let type
        if(typeof j === "object") type = "folder"
        else{
          type = i.substring(i.lastIndexOf("."))
        }
        let icon = options.getIcon(type)
        name.innerHTML = "<img src='"+icon+"'>"
      }
      let users
      if(typeof j === "object"){
        name.innerHTML += j.name
        name.id = "file_"+prefix+j.name
        name.onclick = clickFile
        if(j.open) updateHTML(j, div, prefix+j.name)
        users = pathUsers[prefix+j.name]
      }else{
        name.innerHTML += i
        name.id = "file_"+prefix+i
        name.onclick = clickFile
        users = pathUsers[prefix+i]
      }
      if(users){
        let span = document.createElement("span")
        span.innerHTML = " | "+users.join(",")
        name.appendChild(span)
      }
      if(name.id === "file_"+selected) name.classList.add("selected")
      div.prepend(name)
      el.appendChild(div)
    }
    if(options.onchange) options.onchange()
  }
  async function openPath(path){
    let f = getPath(path)
    if(f && (typeof f === "object") && f.open){
      f.open = false
    }else{
      let r = await update(path)
      if(typeof r === "object"){
        r.open = true
      }else{
        options.onload(r)
      }
    }
    updateHTML()
  }
  async function showPath(path){
    let f = getPath(path)
    let r = await update(path)
    r.open = f.open
    updateHTML()
  }
  function hidePath(path){
    deletePath(path)
    updateHTML()
  }
  let pathUsers = {}
  function setUsers(u){
    pathUsers = {}
    for(let i in u){
      let p = u[i].path
      if(!p) continue
      let username = "<span style='background:"+u[i].color+";color:"+u[i].textColor+";'>"+u[i].username+"</span>"
      p = p.split("/")
      for(let j=0; j<p.length; j++){
        let p2 = p.slice(0,j+1).join("/")
        if(!pathUsers[p2]) pathUsers[p2] = []
        pathUsers[p2].push(username)
      }
    }
    updateHTML()
  }
  container.querySelector(".newFile").onclick = async function(){
    let folder = getFolderPath(selected), name = prompt("File name")
    await options.newFile(folder,name)
    //setPath(folder+"/"+name,"")
    //updateHTML()
  }
  container.querySelector(".newFolder").onclick = async function(){
    let folder = getFolderPath(selected), name = prompt("Folder name")
    await options.newFolder(folder,name)
    //setPath(folder+"/"+name,{name,all:{}})
    //updateHTML()
  }
  container.querySelector(".deleteIt").onclick = async function(){
    if(!confirm("Delete "+selected+"?")) return
    await options.delete(selected)
    //deletePath(selected)
    //updateHTML()
  }
  container.querySelector(".renameIt").onclick = function(){
    alert('not done')
  }
  const uploadInput = document.createElement("input")
  uploadInput.type = "file"
  container.querySelector(".uploadFile").onclick = function(){
    uploadInput.click()
    uploadInput.onchange = function(){
      uploadInput.onchange = null
      let folder = getFolderPath(selected)
      options.save(folder+"/"+this.files[0].name,this.files[0])
    }
  }
  return {
    element: container,
    openPath, paths, showPath, hidePath, setUsers,
    get selected(){return selected}
  }
}
