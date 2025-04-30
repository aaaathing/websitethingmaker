"use strict"
{
let exports = {}
window.serverExports = exports
const {round,floor,ceil,abs,max,min,sin,cos,sqrt,PI} = Math
const PI2 = PI*0.5, PId = PI*2
const tickSpeed = 20, tickTime = 1000/tickSpeed
exports.tickSpeed = tickSpeed, exports.tickTime = tickTime
/*
static means it does not move freely
*/
const partTypes = exports.partTypes = [
	{
		name:"air"
	},
	{
		name:"stone"
	},
	{
		name:"blue"
	},
	{
		name:"faller",
		dynamic:true
	}
]
const partIds = exports.partIds = {}
for(let i=0; i<partTypes.length; i++){
	partIds[partTypes[i].name] = i
}
const chunkSize = 256, chunkPosMask = chunkSize-1, octreeMaxDepth = Math.log2(chunkSize)
exports.chunkSize = chunkSize
let changedThing, changedThingDepth
class SubchunkOctree{
	constructor(depth, fillWith){
		this.depth = depth
		this.mask = (1<<depth)-1
		if(fillWith !== undefined){
			this[0] = ParticlesNode.clone(fillWith)
			this[1] = ParticlesNode.clone(fillWith)
			this[2] = ParticlesNode.clone(fillWith)
			this[3] = ParticlesNode.clone(fillWith)
			this[4] = ParticlesNode.clone(fillWith)
			this[5] = ParticlesNode.clone(fillWith)
			this[6] = ParticlesNode.clone(fillWith)
			this[7] = ParticlesNode.clone(fillWith)
		}
	}
	canMerge(){
		if(!(this[0] instanceof SubchunkOctree) && !(this[1] instanceof SubchunkOctree) && !(this[2] instanceof SubchunkOctree) && !(this[3] instanceof SubchunkOctree) && !(this[4] instanceof SubchunkOctree) && !(this[5] instanceof SubchunkOctree) && !(this[6] instanceof SubchunkOctree) && !(this[7] instanceof SubchunkOctree)){
			const l = this[0]
			if(ParticlesNode.compare(l,this[1]) && ParticlesNode.compare(l,this[2]) && ParticlesNode.compare(l,this[3]) && ParticlesNode.compare(l,this[4]) && ParticlesNode.compare(l,this[5]) && ParticlesNode.compare(l,this[6]) && ParticlesNode.compare(l,this[7])){
				return true
			}
		}
	}
	set(x,y,z,id,offx,offy,offz){
		const xm = x&this.mask, ym = y&this.mask, zm = z&this.mask
		const i = x>>>this.depth<<2 | y>>>this.depth<<1 | z>>>this.depth
		//if(!this[i]) this[i] = this.depth ? new SubchunkOctree(this.depth-1) : new ParticlesNode()
		if(this[i] instanceof SubchunkOctree || this.tree instanceof SubchunkArray){
			this[i].set(xm,ym,zm,id,offx,offy,offz)
		}else if(this.depth){//if leaf node, split
			(this[i] = new SubchunkOctree(this.depth-1, this[i])).set(xm,ym,zm,id,offx,offy,offz)
			changedThing = this[i], changedThingDepth = this.depth-1
		}else{
			ParticlesNode.setOn(this,i,id,offx,offy,offz)
			changedThing = this[i], changedThingDepth = this.depth-1
		}
		if(this[i] instanceof SubchunkOctree && this[i].canMerge()){
			this[i] = this[i][0]
			changedThing = this[i], changedThingDepth = this.depth-1
		}
	}
	delete(x,y,z,offx,offy,offz){
		const xm = x&this.mask, ym = y&this.mask, zm = z&this.mask
		const i = x>>>this.depth<<2 | y>>>this.depth<<1 | z>>>this.depth
		if(typeof this[i] === "object" && ("depth" in this[i])) this[i].delete(xm,ym,zm,offx,offy,offz)
		else if(this.depth){//if leaf node, split
			(this[i] = new SubchunkOctree(this.depth-1, this[i])).delete(xm,ym,zm,offx,offy,offz)
			changedThing = this[i], changedThingDepth = this.depth-1
		}else{
			ParticlesNode.deleteOn(this,i,offx,offy,offz)
			changedThing = this[i], changedThingDepth = this.depth-1
		}
		if(this[i] instanceof SubchunkOctree && this[i].canMerge()){
			this[i] = this[i][0]
			changedThing = this[i], changedThingDepth = this.depth-1
		}
	}
	flatten(arr,iarr){
		const p1 = typeof this[0] === "object" && ("depth" in this[0]) ? this[0].flatten(arr) : ParticlesNode.toNumber(this[0])
		const p2 = typeof this[1] === "object" && ("depth" in this[1]) ? this[1].flatten(arr) : ParticlesNode.toNumber(this[1])
		const p3 = typeof this[2] === "object" && ("depth" in this[2]) ? this[2].flatten(arr) : ParticlesNode.toNumber(this[2])
		const p4 = typeof this[3] === "object" && ("depth" in this[3]) ? this[3].flatten(arr) : ParticlesNode.toNumber(this[3])
		const p5 = typeof this[4] === "object" && ("depth" in this[4]) ? this[4].flatten(arr) : ParticlesNode.toNumber(this[4])
		const p6 = typeof this[5] === "object" && ("depth" in this[5]) ? this[5].flatten(arr) : ParticlesNode.toNumber(this[5])
		const p7 = typeof this[6] === "object" && ("depth" in this[6]) ? this[6].flatten(arr) : ParticlesNode.toNumber(this[6])
		const p8 = typeof this[7] === "object" && ("depth" in this[7]) ? this[7].flatten(arr) : ParticlesNode.toNumber(this[7])
		const ptr = arr.length
		arr[ptr] = p1, arr[ptr+1] = p2, arr[ptr+2] = p3, arr[ptr+3] = p4, arr[ptr+4] = p5, arr[ptr+5] = p6, arr[ptr+6] = p7, arr[ptr+7] = p8
		return ptr
	}
	*iterate(x=0,y=0,z=0){
		const s = 1<<(this.depth)
		if(typeof this[0] === "object" && ("depth" in this[0])) yield* this[0].iterate(x,y,z); else yield [this[0],x,y,z,s]
		if(typeof this[1] === "object" && ("depth" in this[1])) yield* this[1].iterate(x,y,z+s); else yield [this[1],x,y,z+s,s]
		if(typeof this[2] === "object" && ("depth" in this[2])) yield* this[2].iterate(x,y+s,z); else yield [this[2],x,y+s,z,s]
		if(typeof this[3] === "object" && ("depth" in this[3])) yield* this[3].iterate(x,y+s,z+s); else yield [this[3],x,y+s,z+s,s]
		if(typeof this[4] === "object" && ("depth" in this[4])) yield* this[4].iterate(x+s,y,z); else yield [this[4],x+s,y,z,s]
		if(typeof this[5] === "object" && ("depth" in this[5])) yield* this[5].iterate(x+s,y,z+s); else yield [this[5],x+s,y,z+s,s]
		if(typeof this[6] === "object" && ("depth" in this[6])) yield* this[6].iterate(x+s,y+s,z); else yield [this[6],x+s,y+s,z,s]
		if(typeof this[7] === "object" && ("depth" in this[7])) yield* this[7].iterate(x+s,y+s,z+s); else yield [this[7],x+s,y+s,z+s,s]
	}
	mergeAll(){
		if(this[0] instanceof SubchunkOctree){this[0].mergeAll(); if(this[0].canMerge()){this[0] = this[0][0]}}
		if(this[1] instanceof SubchunkOctree){this[1].mergeAll(); if(this[1].canMerge()){this[1] = this[1][0]}}
		if(this[2] instanceof SubchunkOctree){this[2].mergeAll(); if(this[2].canMerge()){this[2] = this[2][0]}}
		if(this[3] instanceof SubchunkOctree){this[3].mergeAll(); if(this[3].canMerge()){this[3] = this[3][0]}}
		if(this[4] instanceof SubchunkOctree){this[4].mergeAll(); if(this[4].canMerge()){this[4] = this[4][0]}}
		if(this[5] instanceof SubchunkOctree){this[5].mergeAll(); if(this[5].canMerge()){this[5] = this[5][0]}}
		if(this[6] instanceof SubchunkOctree){this[6].mergeAll(); if(this[6].canMerge()){this[6] = this[6][0]}}
		if(this[7] instanceof SubchunkOctree){this[7].mergeAll(); if(this[7].canMerge()){this[7] = this[7][0]}}
	}
	static from(that){
		let t,x,y,z
		let newC = new this(that.depth)
		for(let n of that.iterate()){//only works for aligned things, dont work if a thing is the same size of the new tree
			t = newC
			;[,x,y,z] = n
			while((1<<t.depth) > n[4]){
				const i = (x>>>t.depth&1)<<2 | (y>>>t.depth&1)<<1 | z>>>t.depth&1
				if(!(typeof t[i] === "object" && ("depth" in t[i])) && t.depth){//if leaf node, split
					t[i] = new SubchunkOctree(t.depth-1, t[i])
				}
				t = t[i]
			}
			t[(x>>>t.depth&1)<<2 | (y>>>t.depth&1)<<1 | z>>>t.depth&1] = ParticlesNode.clone(n[0])
		}
		newC.mergeAll()
		if(newC.canMerge()) newC = newC[0]
		return newC
	}
}
exports.SubchunkOctree = SubchunkOctree
class ParticlesNode{
	constructor(fillWith){
		this.data = []
		if(fillWith !== undefined){
			if(fillWith.data) this.data.push(...fillWith.data)
			else this.data.push(0,0,0,fillWith)
		}
	}
	static setOn(obj,prop, id,x,y,z){
		if(obj[prop]?.data){
			obj[prop].set(id,x,y,z)
		}else{
			if(!x && !y && !z) obj[prop] = id
			else{
				(obj[prop] = new this(obj[prop])).set(id,x,y,z)
			}
		}
	}
	static deleteOn(obj,prop, x,y,z){
		if(obj[prop]?.data){
			const n = obj[prop]
			if(n.data.length === 4 && n.data[0] === x && n.data[1] === y && n.data[2] === z){
				delete obj[prop]
				return
			}
			n.delete(x,y,z)
			if(n.data.length === 4 && !n.data[0] && !n.data[1] && !n.data[2]){
				obj[prop] = n.data[3]
			}
		}else{
			if(!x && !y && !z) delete obj[prop]
		}
	}
	static compare(a,b){
		if(!a?.data || !b?.data) return a === b
		if(a.data.length !== b.data.length) return
		for(let i=0; i<a.data.length; i+=4){
			if(a.data[i] !== b.data[i] || a.data[i+1] !== b.data[i+1] || a.data[i+2] !== b.data[i+2] || a.data[i+3] !== b.data[i+3]) return
		}
		return true
	}
	static toNumber(n){
		return n?.data ? n[3]|0x80000000 : (n === undefined ? 0xffffffff : n|0x80000000)
	}
	static getOn(n,x,y,z){
		return n?.data ? n.get(x,y,z) : (!x && !y && !z ? n : undefined)
	}
	static clone(n){
		return typeof n === "object" ? new this(n) : n
	}
	get(x,y,z){
		for(let i=0; i<this.data.length; i+=4){
			if(this.data[i] === x && this.data[i+1] === y && this.data[i+2] === z) return this.data[i+3]
		}
		return null
	}
	set(id,x,y,z){
		for(let i=0; i<this.data.length; i+=4){
			if(this.data[i] === x && this.data[i+1] === y && this.data[i+2] === z){
				this.data[i+3] = id
				return
			}
		}
		this.data.push(x,y,z,id)
	}
	delete(x,y,z){
		for(let i=0; i<this.data.length; i+=4){
			if(this.data[i] === x && this.data[i+1] === y && this.data[i+2] === z) return this.data.splice(i,4)
		}
	}
}
class SubchunkArray{
	constructor(depth){
		this.active = new Set()
		this.depth = depth
		this.size = 1<<(depth+1)
	}
	set(x,y,z,id,offx,offy,offz){
		ParticlesNode.setOn(this,x*this.size*this.size+y*this.size+z,id,offx,offy,offz)
	}
	delete(x,y,z,offx,offy,offz){
		ParticlesNode.deleteOn(this,x*this.size*this.size+y*this.size+z,offx,offy,offz)
	}
	static from(that){
		let x,y,z
		let newC = new this(that.depth)
		const tw = newC.size
		for(let n of that.iterate()){
			if(n[0] === undefined) continue
			const w = n[4]
			if(n[4] === 1) newC[n[1]*tw*tw+n[2]*tw+n[3]] = ParticlesNode.clone(n[0])
			else{//fill up an area
				x=0,y=0,z=0
				while(x !== w){
					newC[(x+n[1])*tw*tw+(y+n[2])*tw+(z+n[3])] = ParticlesNode.clone(n[0])
					if(++z === w){
						z=0
						if(++y === w) y=0, x++
					}
				}
			}
		}
		return newC
	}
	*iterate(){//use z-order curve to find chunks of stuff
		const {size} = this
		let carry, x=0,y=0,z=0, newcarry, sx,sy,sz, startStuff, cx,cy,cz, hi2Pow, px,py,pz
		while(!(px+1 === size && py+1 === size && pz+1 === size)){
			sx = cx = px = x, sy = cy = py = y, sz = cz = pz = z //s start, c current, p previous
			startStuff = this[x*size*size+y*size+z]
			hi2Pow = 0.5
			findChunk:do{
				if(cx-sx === cy-sy && cy-sy === cz-sz && (cx-sx+1) === hi2Pow*2){//found new biggest cube with pow of 2 width
					hi2Pow = cx-sx+1
					if(cx+1 === size && cy+1 === size && cz+1 === size) break findChunk
					carry = 1;
					do{//from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
						newcarry = cz & carry;
						cz ^= carry;
						carry = newcarry;
						newcarry = cy & carry;
						cy ^= carry;
						carry = newcarry;
						newcarry = (cx & carry) << 1;
						cx ^= carry;
						carry = newcarry;
					} while (carry);
					x = cx, y = cy, z = cz//save new starting position
					continue findChunk
				}
				if(cx+1 === size && cy+1 === size && cz+1 === size) break findChunk
				carry = 1;
				do{//from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
					newcarry = cz & carry;
					cz ^= carry;
					carry = newcarry;
					newcarry = cy & carry;
					cy ^= carry;
					carry = newcarry;
					newcarry = (cx & carry) << 1;
					cx ^= carry;
					carry = newcarry;
				} while (carry);
			}while(ParticlesNode.compare(startStuff,this[cx*size*size+cy*size+cz]) && cx>=sx && cy>=sy && cz>=sz)
			yield [startStuff,sx,sy,sz,hi2Pow]
		}
	}
	*iterate2(){
		const sh = this.depth+1, an = (1<<sh)-1
		for(let i=0; i<this.size*this.size*this.size; i++){
			yield [this[i],i>>sh>>sh,i>>sh&an,i&an,1]
		}
	}
}
exports.SubchunkArray = SubchunkArray
class Chunk{
	constructor(){
		this.tree = partIds.air
	}
	set(x,y,z,id,offx,offy,offz){
		if(typeof this.tree === "object" && ("depth" in this.tree)){
			this.tree.set(x,y,z,id,offx,offy,offz)
		}else{//if leaf node, split
			(this.tree = new SubchunkOctree(octreeMaxDepth-1, this.tree)).set(x,y,z,id,offx,offy,offz)
			changedThing = this.tree, changedThingDepth = octreeMaxDepth-1
		}
		if(this.tree instanceof SubchunkOctree && this.tree.canMerge()){
			this.tree = this.tree[0]
			changedThing = this.tree, changedThingDepth = octreeMaxDepth-1
		}
	}
	get(x,y,z,offx,offy,offz){
		let t = this.tree
		while(true){
			if(t instanceof SubchunkOctree) t = t[(x>>>t.depth&1)<<2 | (y>>>t.depth&1)<<1 | z>>>t.depth&1]
			else if(t instanceof SubchunkArray) t = t[(x>>>t.depth)*this.size*this.size+(y>>>t.depth)*this.size+(z>>>t.depth)]
			else break
		}
		return ParticlesNode.getOn(t,offx,offy,offz)
	}
	static updatedOctree(world,x,y,z){//add to updates
		for(let p of world.players)addUpdate:{
			for(let i=0; i<p.updates.length; i+=5){
				let b = p.updates[i+4]
				const bigger = changedThingDepth>p.updates[i+3] ? changedThing : b//check for overlap
				const biggerDepth = max(changedThingDepth,p.updates[i+3])
				const m = ~((1<<(biggerDepth+1))-1)
				if((x&m) === (p.updates[i]&m) && (y&m) === (p.updates[i+1]&m) && (z&m) === (p.updates[i+2]&m)){
					if(changedThing === bigger){
						p.updates[i+4] = bigger//overlap, update bigger one
						p.updates[i] = x&m
						p.updates[i+1] = y&m
						p.updates[i+2] = z&m
						p.updates[i+3] = biggerDepth
					}
					break addUpdate
				}
			}
			const m = ~((1<<(changedThingDepth+1))-1)
			p.updates.push(x&m,y&m,z&m,changedThingDepth,changedThing)//m is used to remove insignificant bits.
		}
	}
	static sendUpdate(x,y,z,depth,tree,p){
		let arr = []
		const basePtr = typeof tree === "object" && ("depth" in tree) ? tree.flatten(arr) : ParticlesNode.toNumber(tree)
		let idxs = []
		for(let j=0, sd=octreeMaxDepth-1; j<octreeMaxDepth-depth-1; j++, sd--){
			idxs.push((x>>>sd&1)<<2 | (y>>>sd&1)<<1 | z>>>sd&1)
		}
		p.send({type:"chunkUpdate",x,y,z,depth,data:arr,basePtr,idxs})
	}
}
exports.Chunk = Chunk
class ServerWorld{
	constructor(){
		this.chunks = {}
		this.players = []
	}
	getChunk(x,y,z){
		return this.chunks?.[x>>octreeMaxDepth]?.[y>>octreeMaxDepth]?.[z>>octreeMaxDepth]
	}
	newChunk(x,y,z){
		x >>= octreeMaxDepth, y >>= octreeMaxDepth, z >>= octreeMaxDepth
		if(!this.chunks[x]) this.chunks[x] = {}
		if(!this.chunks[x][y]) this.chunks[x][y] = {}
		return this.chunks[x][y][z] = new Chunk()
	}
	set(x,y,z,id){
		let c = this.getChunk(x,y,z)
		if(!c) c = this.newChunk(x,y,z)
		changedThing = null
		c.set(x&chunkPosMask,y&chunkPosMask,z&chunkPosMask,id, x-floor(x),y-floor(y),z-floor(z))
		c.constructor.updatedOctree(this,x,y,z)
	}
	get(x,y,z){
		let c = this.getChunk(x,y,z)
		return c ? c.get(x&chunkPosMask,y&chunkPosMask,z&chunkPosMask, x-floor(x),y-floor(y),z-floor(z)) : null
	}
	tick(){

	}
	addPlayer(p){
		p.updates = []
		this.players.push(p)
		p.onmessage = pkt => {
			if(pkt.type === "connect"){
				p.send({type:"connect"})
			}else if(pkt.type === "pos"){
				p.x = pkt.x
				p.y = pkt.y
				p.z = pkt.z
				for(let i=0; i<p.updates.length; i+=5){
					Chunk.sendUpdate(p.updates[i],p.updates[i+1],p.updates[i+2],p.updates[i+3],p.updates[i+4],p)
				}
				p.updates.length = 0
				p.send({type:"canSendPos"})
			}
		}
		p.onclose = () => {
			this.players.splice(this.players.indexOf(p),1)
		}
	}
}
exports.ServerWorld = ServerWorld

//decompress from https://dev.to/lucasdamianjohnson/compress-decompress-an-arraybuffer-client-side-in-js-2nf6
async function decompress(e,t){const n=new DecompressionStream(e),r=n.writable.getWriter();r.write(t),r.close();const o=[],s=n.readable.getReader();let a=0;for(;;){const{value:e,done:t}=await s.read();if(t)break;o.push(e),a+=e.byteLength}const c=new Uint8Array(a);let i=0;for(const e of o)c.set(e,i),i+=e.byteLength;return(new TextDecoder).decode(c)}
async function compress(e,t){const n=new CompressionStream(e),r=n.writable.getWriter();r.write((new TextEncoder).encode(t)),r.close();const o=[],s=n.readable.getReader();let a=0;for(;;){const{value:e,done:t}=await s.read();if(t)break;o.push(e),a+=e.byteLength}const c=new Uint8Array(a);let i=0;for(const e of o)c.set(e,i),i+=e.byteLength;return c}
exports.decompress = decompress, exports.compress = compress
function strtohash() {
	var hash = 0, i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}
exports.strtohash = strtohash
function arrtoa() {
	let str = ""
	for (let i = 0; i < this.length; i++) {
		str += String.fromCharCode(this[i])
	}
	return btoa(str)
}
exports.arrtoa = arrtoa
function atoarr(data){
	let bytes = atob(data)
	let arr = new Uint8Array(bytes.length)
	for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
	return arr
}
exports.atoarr = atoarr
}