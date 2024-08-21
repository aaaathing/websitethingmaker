const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
  credentials:{
    audience: "replit",
    subject_token_type: "access_token",
    token_url: "http://127.0.0.1:1106/token",
    type: "external_account",
    credential_source: {
      url: "http://127.0.0.1:1106/credential",
      format: {
        type: "json",
        subject_token_field_name: "access_token"
      }
    },
    universe_domain: "googleapis.com"
  },
  projectId:""
});

// Creates a client from a Google service account key
// const storage = new Storage({keyFilename: 'key.json'});

const bucket = storage.bucket("replit-objstore-dfc036d2-f315-4a87-877d-ec3cea3d75ed")

/*function backup(key,value){
  return new Promise(function(resolve,reject){
    const stream = backupBucket.file(key+".json").createWriteStream({resumable:false});
  
    stream.on('error', reject);
  
    stream.on('finish', () => {
      resolve(true)
    });
  
    stream.end(value);
  })
}*/

module.exports = {
  storage,
  timeouts:{},
  updateTimeout(n){
    var t = this.timeouts[n]
    var now = Date.now()
    if(t.canBeSet && now - t.time >= 1000){
      if(t.operation){
        let operation = t.operation
        t.operation = null
        t.time = now
        t.canBeSet = false
        operation().then(r => {
          t.canBeSet = true
          for(var i of t.promises) i.resolve()
          t.promises.length = 0
        }).catch(r => {
          t.time = Date.now() //try again in 1 second
          for(var i of t.promises) i.reject(r)
          t.promises.length = 0
        })
      }else if(now - t.time >= 5000) delete this.timeouts[n]
    }
  },
  _newTimeout:function(key,value){
    return this.timeouts[key] = {
      time:Date.now()-1000, promises:[], canBeSet:true,
      nextValue:value, operation:null
    }
  },
  _set:function(key,value){
    return new Promise(function(resolve,reject){
      const stream = bucket.file(key+".json").createWriteStream({
        resumable:false,
        metadata:{
        }
      });
    
      stream.on('error', reject);
    
      stream.on('finish', () => {
        resolve(true)
      });
    
      stream.end(value);
    })
  },
  set: function(key,value,options){
    if(!value) throw new Error('---------- Missing value for '+key)
    if(!(options && options.raw)) value = JSON.stringify(value)
    if(this.timeouts[key]){
      this.updateTimeout(key)
    }
    let me = this
    return new Promise((resolve,reject) => {
      let t = this.timeouts[key]
      if(!this.timeouts[key]) t = me._newTimeout(key,value)
      t.nextValue = value
      t.operation = () => me._set(key,value)
      t.promises.push({
        resolve: () => resolve(true),
        reject
      })
      this.updateTimeout(key)//it may be able to upload so update it
    })
  },
  setFile:function(path,value){
    return new Promise(function(resolve,reject){
      var file = bucket.file(path)
      const stream = file.createWriteStream();
    
      stream.on('error', reject);
    
      stream.on('finish', () => {
        resolve(true)
      });
    
      stream.end(value);
    })
  },
  get:function(key){
    var me = this
    return new Promise(async function(resolve,reject){
      if(me.timeouts[key]){
        return resolve(JSON.parse(me.timeouts[key].nextValue))
      }
      var data = [], str = ""
      var file = bucket.file(key+".json")
      if(!(await file.exists())[0]) return resolve(null)

      var stream = file.createReadStream();
      stream.on("data", r => data.push(r))
      stream.on("end",function(){
        try{
          str = Buffer.concat(data)
          data = JSON.parse(str)
        }catch(e){
          this.Log("Unparseable json "+key+" "+e.message)
          return
        }
        me._newTimeout(key,str)
        resolve(data)
      })
    })
  },
  getFile:async function(path){
    var data = ""
    var file = bucket.file(path)
    if(!(await file.exists())[0]) return null
    return (await file.download())[0]
  },
  getStream:function(key){
    var file = bucket.file(key)
    return file.createReadStream();
  },
  setStream:function(path,value){
    return new Promise(function(resolve,reject){
      var file = bucket.file(path)
      const stream = file.createWriteStream();
    
      stream.on('error', reject);
    
      stream.on('finish', () => {
        resolve(true)
      });
    
      value.pipe(stream)
    })
  },
  delete: function(key){
    if(this.timeouts[key]){
      this.updateTimeout(key)
    }
    let me = this
    return new Promise((resolve,reject) => {
      let t = this.timeouts[key]
      if(!this.timeouts[key]) t = me._newTimeout(key,value)
      t.nextValue = null
      t.operation = () => bucket.file(key+".json").delete({ignoreNotFound:true})
      t.promises.push({
        resolve: () => resolve(true),
        reject
      })
      this.updateTimeout(key)//it may be able to upload so update it
    })
  },
  getToObj:function(key,obj){
    return this.get(key).then(r => obj[key] = r)
  },
  list:async function(prefix,values){
    const [files] = await bucket.getFiles({prefix});
  
    if(values){
      var obj = {}, promises = []
      for(var i=0; i<files.length; i++){
        var name = files[i].name
        name = name.substring(0,name.lastIndexOf(".json"))
        if(prefix && !name.startsWith(prefix)) continue
        promises.push(this.getToObj(name,obj))
      }
      await Promise.all(promises)
      return obj
    }else{
      var arr = []
      for(var i=0; i<files.length; i++){
        var name = files[i].name
        name = name.substring(0,name.lastIndexOf(".json"))
        if(prefix && !name.startsWith(prefix)) continue
        arr.push(name)
      }
      return arr
    }
  },
  atInterval:function(){
    for(var i in this.timeouts) this.updateTimeout(i)
  },
  getSize:function(){
    return bucket.getMetadata().then(metadata => {
      metadata = metadata[0]
      console.log(metadata.size)
    })
  }
}
setInterval(() => module.exports.atInterval(),1000)
