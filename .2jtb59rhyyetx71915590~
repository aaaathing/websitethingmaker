"use strict"
function LFBDS({workerCount}){
let serverExports = {}
const {round,floor,ceil,abs,max,min,sin,cos,sqrt,PI,trunc} = Math
const PI2 = PI*0.5, PId = PI*2

const EMPTYCELL = 0xffffffff
const PartsNodeStride = 5
let changedThing, changedThingDepth
/**
 * @typedef {Array.<number> | number} PartsNode
 * Pattern in array: offset x, offset y, offset z, data, active
 * It uses array if any of them have offset that is not zero or if any are active, else it is number
*/
const PartsNodeFncts = {
	/**
	 * The value in that (octree, array, etc.). data should be set before calling setOn, deleteOn.
	 * newValue & newActive should also be set before calling setOn.
	*/
	valueOfThat:{
		/**@type {PartsNode}*/data:undefined,
		active:0, newValue:0,
		/**@type {0|1}*/newActive:0
	},
	/**
	 * @param {0|1} active
	 * Set valueOfThat before calling
	 */
	setOn(x,y,z){
		const {newValue,newActive} = this.valueOfThat
		let n = this.valueOfThat.data
		if(!Array.isArray(n)){
			if(!x && !y && !z && !newActive){
				this.valueOfThat.data = newValue
				this.valueOfThat.active = 0
				return
			}else{
				n = this.valueOfThat.data = [0,0,0,this.valueOfThat.data,this.valueOfThat.active]//the new data will be added below
			}
		}
		this.valueOfThat.active = newActive
		let found
		for(let i=0; i<n.length; i+=PartsNodeStride){
			if(n[i] === x && n[i+1] === y && n[i+2] === z){
				n[i+3] = newValue
				n[i+4] = newActive
				found = true
			}else this.valueOfThat.active ||= n[i+4]
		}
		if(!found) n.push(x,y,z,newValue,newActive)
	},
	/**
	 * Set valueOfThat before calling
	 */
	deleteOn(x,y,z){
		const n = this.valueOfThat.data
		if(Array.isArray(n)){
			if(n.length === PartsNodeStride && n[0] === x && n[1] === y && n[2] === z){
				//this.valueOfThat.prevValue = n[3]
				//this.valueOfThat.prevActive = n[4]
				this.valueOfThat.data = EMPTYCELL
				this.valueOfThat.active = 0
				return
			}
			this.valueOfThat.active = 0
			for(let i=0; i<n.length; i+=PartsNodeStride){
				if(n[i] === x && n[i+1] === y && n[i+2] === z){
					//this.valueOfThat.prevValue = n[i+3]
					//this.valueOfThat.prevActive = n[i+4]
					n.splice(i,PartsNodeStride)
				}else this.valueOfThat.active ||= n[i+4]
			}
			if(n.length === PartsNodeStride && !n[0] && !n[1] && !n[2]){
				this.valueOfThat.data = n[3] //valueOfThat.active should be set by above
			}
		}else{
			if(!x && !y && !z){
				//this.valueOfThat.prevValue = this.valueOfThat.data
				//this.valueOfThat.prevActive = this.valueOfThat.active
				this.valueOfThat.data = EMPTYCELL
				this.valueOfThat.active = 0
			}
		}
	},
	getOn(n,x,y,z){
		if(!Array.isArray(n)){
			this.valueOfThat.newActive = 0
			return !x && !y && !z ? n : undefined
		}
		for(let i=0; i<n.length; i+=PartsNodeStride){
			if(n[i] === x && n[i+1] === y && n[i+2] === z){
				this.valueOfThat.newActive = n[i+4]
				return n[i+3]
			}
		}
	},
	/**
	 * @param {PartsNode} a 
	 * @param {PartsNode} b 
	 * @returns {boolean}
	 */
	compare(a,b){
		return !Array.isArray(a) && a === b
		/*if(!Array.isArray(a) || !Array.isArray(b)) return a === b
		if(a.length !== b.length) return false
		for(let i=0; i<a.length; i+=4){
			if(a[i] !== b[i] || a[i+1] !== b[i+1] || a[i+2] !== b[i+2] || a[i+3] !== b[i+3]) return
		}
		return true*/
	},
	isActive(n){
		if(!Array.isArray(n)) return 0
		for(let i=0; i<n.length; i+=PartsNodeStride){
			if(n[i+4]) return 1
		}
		return 0
	},
	/**
	 * @param {PartsNode} n 
	 * @param {{fromAttrFormat:Object.<string,AttributeFormat>,allAttrFormat:Object.<string,AttributeFormat>}} attrInfo 
	 * @returns {number}
	 */
	flatten(n,attrInfo){
		if(n === EMPTYCELL) return n
		const data = Array.isArray(n) ? n[3] : n
		let i = 0
		return(
			(attrInfo.fromAttrFormat.id?(data>>attrInfo.fromAttrFormat.id.offset)&attrInfo.fromAttrFormat.id.mask:0) |
			(attrInfo.fromAttrFormat.texture?(data>>attrInfo.fromAttrFormat.texture.offset)&attrInfo.fromAttrFormat.texture.mask:0)<<(i+=attrInfo.allAttrFormat.id.size) |
			0x80000000
		)
	},
	/**
	 * @param {PartsNode} n 
	 * @returns {PartsNode}
	 */
	clone(n){
		return typeof n === "object" ? [...n] : n
	}
}
class SubchunkOctree{
	0;1;2;3;4;5;6;7
	static{
		this.prototype.isSubchunk = true
	}
	/**
	 * @param {PartsNode} fillWith 
	 */
	constructor(depth, fillWith=EMPTYCELL){
		this.depth = depth
		this.mask = (1<<depth)-1
		this[0] = PartsNodeFncts.clone(fillWith)
		this[1] = PartsNodeFncts.clone(fillWith)
		this[2] = PartsNodeFncts.clone(fillWith)
		this[3] = PartsNodeFncts.clone(fillWith)
		this[4] = PartsNodeFncts.clone(fillWith)
		this[5] = PartsNodeFncts.clone(fillWith)
		this[6] = PartsNodeFncts.clone(fillWith)
		this[7] = PartsNodeFncts.clone(fillWith)
		const f = PartsNodeFncts.isActive
		this.active = [f(this[0]),f(this[1]),f(this[2]),f(this[3]),f(this[4]),f(this[5]),f(this[6]),f(this[7])]
	}
	canMerge(){
		if(!(this[0] instanceof SubchunkOctree) && !(this[1] instanceof SubchunkOctree) && !(this[2] instanceof SubchunkOctree) && !(this[3] instanceof SubchunkOctree) && !(this[4] instanceof SubchunkOctree) && !(this[5] instanceof SubchunkOctree) && !(this[6] instanceof SubchunkOctree) && !(this[7] instanceof SubchunkOctree)){
			const l = this[0]
			if(PartsNodeFncts.compare(l,this[1]) && PartsNodeFncts.compare(l,this[2]) && PartsNodeFncts.compare(l,this[3]) && PartsNodeFncts.compare(l,this[4]) && PartsNodeFncts.compare(l,this[5]) && PartsNodeFncts.compare(l,this[6]) && PartsNodeFncts.compare(l,this[7])){
				return true
			}
		}
	}
	set(x,y,z,offx,offy,offz){
		const xm = x&this.mask, ym = y&this.mask, zm = z&this.mask
		const i = x>>>this.depth<<2 | y>>>this.depth<<1 | z>>>this.depth
		//if(!this[i]) this[i] = this.depth ? new SubchunkOctree(this.depth-1) : new PartsNode()
		if(this[i].isSubchunk){
			const didMerge = this[i].set(xm,ym,zm,offx,offy,offz)
			this.active[i] = this[i].isActive()
			if(!didMerge) return//don't check for merge
		}else if(this.depth){//if leaf node, split
			const didMerge = (this[i] = new SubchunkOctree(this.depth-1, this[i])).set(xm,ym,zm,offx,offy,offz)
			changedThing = this[i], changedThingDepth = this.depth-1
			this.active[i] = this[i].isActive()
			if(!didMerge) return//don't check for merge
		}else{
			const a = PartsNodeFncts.valueOfThat
			a.data = this[i]
			PartsNodeFncts.setOn(offx,offy,offz)
			this[i] = a.data, this.active[i] = a.active
			changedThing = this[i], changedThingDepth = this.depth-1
		}
		if(this[i] instanceof SubchunkOctree && this[i].canMerge()){
			this[i] = this[i][0]
			changedThing = this[i], changedThingDepth = this.depth-1
			return true
		}
	}
	delete(x,y,z,offx,offy,offz){
		const xm = x&this.mask, ym = y&this.mask, zm = z&this.mask
		const i = x>>>this.depth<<2 | y>>>this.depth<<1 | z>>>this.depth
		if(this[i].isSubchunk){
			const didMerge = this[i].delete(xm,ym,zm,offx,offy,offz)
			this.active[i] = this[i].isActive()
			if(!didMerge) return//don't check for merge
		}else if(this.depth){//if leaf node, split
			const didMerge = (this[i] = new SubchunkOctree(this.depth-1, this[i])).delete(xm,ym,zm,offx,offy,offz)
			changedThing = this[i], changedThingDepth = this.depth-1
			this.active[i] = this[i].isActive()
			if(!didMerge) return//don't check for merge
		}else{
			const a = PartsNodeFncts.valueOfThat
			a.data = this[i]
			PartsNodeFncts.deleteOn(this,i,offx,offy,offz)
			this[i] = a.data, this.active[i] = a.active
			changedThing = this[i], changedThingDepth = this.depth-1
		}
		if(this[i] instanceof SubchunkOctree && this[i].canMerge()){
			this[i] = this[i][0]
			changedThing = this[i], changedThingDepth = this.depth-1
			return true
		}
	}
	isActive(){
		const a = this.active
		return a[0]||a[1]||a[2]||a[3]||a[4]||a[5]||a[6]||a[7]
	}
	flatten(arr){
		const p1 = typeof this[0] === "object" && ("depth" in this[0]) ? this[0].flatten(arr) : PartsNodeFncts.flatten(this[0],arr)
		const p2 = typeof this[1] === "object" && ("depth" in this[1]) ? this[1].flatten(arr) : PartsNodeFncts.flatten(this[1],arr)
		const p3 = typeof this[2] === "object" && ("depth" in this[2]) ? this[2].flatten(arr) : PartsNodeFncts.flatten(this[2],arr)
		const p4 = typeof this[3] === "object" && ("depth" in this[3]) ? this[3].flatten(arr) : PartsNodeFncts.flatten(this[3],arr)
		const p5 = typeof this[4] === "object" && ("depth" in this[4]) ? this[4].flatten(arr) : PartsNodeFncts.flatten(this[4],arr)
		const p6 = typeof this[5] === "object" && ("depth" in this[5]) ? this[5].flatten(arr) : PartsNodeFncts.flatten(this[5],arr)
		const p7 = typeof this[6] === "object" && ("depth" in this[6]) ? this[6].flatten(arr) : PartsNodeFncts.flatten(this[6],arr)
		const p8 = typeof this[7] === "object" && ("depth" in this[7]) ? this[7].flatten(arr) : PartsNodeFncts.flatten(this[7],arr)
		const ptr = arr.length
		arr[ptr] = p1, arr[ptr+1] = p2, arr[ptr+2] = p3, arr[ptr+3] = p4, arr[ptr+4] = p5, arr[ptr+5] = p6, arr[ptr+6] = p7, arr[ptr+7] = p8
		return ptr
	}
	*iterateConv(whatFor,x=0,y=0,z=0){
		const s = 1<<(this.depth)
		if(this[0].isSubchunk) yield* this[0].iterateConv(whatFor,x,y,z); else yield {data:this[0],x,y,z,size:s}
		if(this[1].isSubchunk) yield* this[1].iterateConv(whatFor,x,y,z+s); else yield {data:this[1],x,y,z:z+s,size:s}
		if(this[2].isSubchunk) yield* this[2].iterateConv(whatFor,x,y+s,z); else yield {data:this[2],x:x+s,y,z:z+s,size:s}
		if(this[3].isSubchunk) yield* this[3].iterateConv(whatFor,x,y+s,z+s); else yield {data:this[3],x,y:y+s,z:z+s,size:s}
		if(this[4].isSubchunk) yield* this[4].iterateConv(whatFor,x+s,y,z); else yield {data:this[4],x:x+s,y,z,size:s}
		if(this[5].isSubchunk) yield* this[5].iterateConv(whatFor,x+s,y,z+s); else yield {data:this[5],x:x+s,y,z:z+s,size:s}
		if(this[6].isSubchunk) yield* this[6].iterateConv(whatFor,x+s,y+s,z); else yield {data:this[6],x:x+s,y:y+s,z,size:s}
		if(this[7].isSubchunk) yield* this[7].iterateConv(whatFor,x+s,y+s,z+s); else yield {data:this[7],x:x+s,y:y+s,z:z+s,size:s}
	}
	iterateActive(cb,x,y,z){
		const s = 1<<(this.depth)
		if(this[0].isActive){if(this[0].isSubchunk) this[0].iterateActive(cb,x,y,z); else cb(this[0],x,y,z,this,x,y,z,s)}
		if(this[1].isActive){if(this[1].isSubchunk) this[1].iterateActive(cb,x,y,z+s); else cb(this[1],x,y,z+s,this,x,y,z,s)}
		if(this[2].isActive){if(this[2].isSubchunk) this[2].iterateActive(cb,x,y+s,z); else cb(this[2],x+s,y,z+s,this,x,y,z,s)}
		if(this[3].isActive){if(this[3].isSubchunk) this[3].iterateActive(cb,x,y+s,z+s); else cb(this[3],x,y+s,z+s,this,x,y,z,s)}
		if(this[4].isActive){if(this[4].isSubchunk) this[4].iterateActive(cb,x+s,y,z); else cb(this[4],x+s,y,z,this,x,y,z,s)}
		if(this[5].isActive){if(this[5].isSubchunk) this[5].iterateActive(cb,x+s,y,z+s); else cb(this[5],x+s,y,z+s,this,x,y,z,s)}
		if(this[6].isActive){if(this[6].isSubchunk) this[6].iterateActive(cb,x+s,y+s,z); else cb(this[6],x+s,y+s,z,this,x,y,z,s)}
		if(this[7].isActive){if(this[7].isSubchunk) this[7].iterateActive(cb,x+s,y+s,z+s); else cb(this[7],x+s,y+s,z+s,this,x,y,z,s)}
	}
	/* *iterateObj(x=0,y=0,z=0){
		const s = 1<<(this.depth)
		if(typeof this[0] === "object" && ("depth" in this[0])) yield* this[0].iterateObj(x,y,z); else yield [this,0]
		if(typeof this[1] === "object" && ("depth" in this[1])) yield* this[1].iterateObj(x,y,z+s); else yield [this,1]
		if(typeof this[2] === "object" && ("depth" in this[2])) yield* this[2].iterateObj(x,y+s,z); else yield [this,2]
		if(typeof this[3] === "object" && ("depth" in this[3])) yield* this[3].iterateObj(x,y+s,z+s); else yield [this,3]
		if(typeof this[4] === "object" && ("depth" in this[4])) yield* this[4].iterateObj(x+s,y,z); else yield [this,4]
		if(typeof this[5] === "object" && ("depth" in this[5])) yield* this[5].iterateObj(x+s,y,z+s); else yield [this,5]
		if(typeof this[6] === "object" && ("depth" in this[6])) yield* this[6].iterateObj(x+s,y+s,z); else yield [this,6]
		if(typeof this[7] === "object" && ("depth" in this[7])) yield* this[7].iterateObj(x+s,y+s,z+s); else yield [this,7]
	}*/
	mergeAll(){
		if(this[0] instanceof SubchunkOctree){this[0].mergeAll(); if(this[0].canMerge()){this[0] = this[0][0]}}
		if(this[1] instanceof SubchunkOctree){this[1].mergeAll(); if(this[1].canMerge()){this[1] = this[1][0]}}
		if(this[2] instanceof SubchunkOctree){this[2].mergeAll(); if(this[2].canMerge()){this[2] = this[2][0]}}
		if(this[3] instanceof SubchunkOctree){this[3].mergeAll(); if(this[3].canMerge()){this[3] = this[3][0]}}
		if(this[4] instanceof SubchunkOctree){this[4].mergeAll(); if(this[4].canMerge()){this[4] = this[4][0]}}
		if(this[5] instanceof SubchunkOctree){this[5].mergeAll(); if(this[5].canMerge()){this[5] = this[5][0]}}
		if(this[6] instanceof SubchunkOctree){this[6].mergeAll(); if(this[6].canMerge()){this[6] = this[6][0]}}
		if(this[7] instanceof SubchunkOctree){this[7].mergeAll(); if(this[7].canMerge()){this[7] = this[7][0]}}
		this.active[0] = this[0].isSubchunk ? this[0].isActive() : PartsNodeFncts.isActive(this[0])
		this.active[1] = this[1].isSubchunk ? this[1].isActive() : PartsNodeFncts.isActive(this[1])
		this.active[2] = this[2].isSubchunk ? this[2].isActive() : PartsNodeFncts.isActive(this[2])
		this.active[3] = this[3].isSubchunk ? this[3].isActive() : PartsNodeFncts.isActive(this[3])
		this.active[4] = this[4].isSubchunk ? this[4].isActive() : PartsNodeFncts.isActive(this[4])
		this.active[5] = this[5].isSubchunk ? this[5].isActive() : PartsNodeFncts.isActive(this[5])
		this.active[6] = this[6].isSubchunk ? this[6].isActive() : PartsNodeFncts.isActive(this[6])
		this.active[7] = this[7].isSubchunk ? this[7].isActive() : PartsNodeFncts.isActive(this[7])
	}
	static from(that){
		let t,x,y,z
		let newC = new this(that.depth)
		const newsize = 1<<(newC.depth+1)
		for(let n of that.iterateConv("octree")){//only works for aligned things
			if(n.size === newsize) return PartsNodeFncts.clone(n.data)//filled with one thing
			t = newC
			;({x,y,z} = n)
			while((1<<t.depth) > n.size){
				const i = (x>>>t.depth&1)<<2 | (y>>>t.depth&1)<<1 | z>>>t.depth&1
				if(!(typeof t[i] === "object" && ("depth" in t[i])) && t.depth){//if leaf node, split
					t[i] = new SubchunkOctree(t.depth-1, t[i])
				}
				t = t[i]
			}
			t[(x>>>t.depth&1)<<2 | (y>>>t.depth&1)<<1 | z>>>t.depth&1] = PartsNodeFncts.clone(n.data)
		}
		newC.mergeAll()
		if(newC.canMerge()) newC = newC[0]
		return newC
	}
}
/**
 * Max size: 2^31
 * Last bit need to be empty for conversion
 */
class SubchunkArray{
	static{
		this.prototype.isSubchunk = true
	}
	/**
	 * @param {PartsNode} fillWith - it can not be the array type
	 */
	constructor(depth, fillWith=EMPTYCELL){
		this.active = new Set()
		this.depth = depth
		this.sizebits = depth+1
		this.size = 1<<(depth+1)
		this.data = new Array(1<<(this.sizebits*3)).fill(fillWith)
	}
	set(x,y,z,offx,offy,offz){
		const i = (x<<this.sizebits | y)<<this.sizebits | z
		const a = PartsNodeFncts.valueOfThat
		a.data = this.data[i]
		PartsNodeFncts.setOn(offx,offy,offz)
		this.data[i] = a.data
		if(a.active) this.active.add(i); else this.active.delete(i)
	}
	delete(x,y,z,offx,offy,offz){
		const i = (x<<this.sizebits | y)<<this.sizebits | z
		const a = PartsNodeFncts.valueOfThat
		a.data = this.data[i]
		PartsNodeFncts.deleteOn(offx,offy,offz)
		this.data[i] = a.data
		if(a.active) this.active.add(i); else this.active.delete(i)
	}
	isActive(){
		return this.active.size?1:0
	}
	static from(that){
		let x,y,z
		let newC = new this(that.depth)
		const sh = newC.sizebits
		for(let n of that.iterateConv("array")){
			if(n.data === EMPTYCELL) continue
			const w = n.size
			if(n.size === 1) newC.data[(n.x<<sh|n.y)<<sh|n.z] = PartsNodeFncts.clone(n.data)
			else{//fill up an area
				x=0,y=0,z=0
				while(x !== w){
					newC.data[((x+n.x)<<sh|(y+n.y))<<sh|(z+n.z)] = PartsNodeFncts.clone(n.data)
					if(++z === w){
						z=0
						if(++y === w) y=0, x++
					}
				}
			}
		}
		return newC
	}
	/**
	 * some code from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
	 *//*
algorithm 1:
use z-order curve to find run of same stuff from current position
go back to the last biggest node

algorithm 2:
use z-order curve to find run of same stuff
figure out what octree leafs there are in this run
	*/
	*iterateConv(whatFor, ox=0,oy=0,oz=0){
		const {size,sizebits:sh} = this, indexend = size*size*size+1
		let yieldo = {data:undefined,x:undefined,y:undefined,z:undefined,size:undefined}
		if(whatFor === "octree"){
			let rx=0, ry=0, rz=0, prx = 0, pry = 0, prz = 0, ri = 0, pri = 0 //run
			let carry, undepthPow8, undepthMask, undepthMaskLeft, undepth, notReachEnd = true
			while(notReachEnd){
				const startStuff = this.data[(rx<<sh|ry)<<sh|rz]
				prx = rx, pry = ry, prz = rz, pri = ri
				do{//find run of same stuff
					carry = 1;
					do{//from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
						carry = carry & ~(rz ^= carry)
						carry = carry & ~(ry ^= carry)
						carry = (carry & ~(rx ^= carry))<<1
					} while (carry);
					ri++
					if(ri === indexend){
						notReachEnd = false
						break
					}
				}while(PartsNodeFncts.compare(startStuff,this.data[(rx<<sh|ry)<<sh|rz]))
				//rx,ry,rz are the coords of the one after the last one in the run
				undepthMask = 7, undepthPow8 = 1, undepthMaskLeft = ~0, undepth = 1
				//first half (get bigger)
				while(!(pri & undepthMask) && undepth !== size) undepthMask <<= 3, undepthPow8 <<= 3, undepthMaskLeft <<= 3, undepth <<= 1
				while((pri&undepthMaskLeft) !== (ri&undepthMaskLeft)){
					yieldo.data = startStuff, yieldo.x = prx+ox, yieldo.y = pry+oy, yieldo.z = prz+oz, yieldo.size = undepth
					yield yieldo
					pri += undepthPow8
					carry = undepth;
					do{//from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
						carry = carry & ~(prz ^= carry)
						carry = carry & ~(pry ^= carry)
						carry = (carry & ~(prx ^= carry))<<1
					} while (carry);
					while(!(pri & undepthMask)) undepthMask <<= 3, undepthPow8 <<= 3, undepthMaskLeft <<= 3, undepth <<= 1
				}

				//second half (get smaller)
				while(pri !== ri){
					if((pri&undepthMaskLeft) === (ri&undepthMaskLeft)){
						//undepthMaskLeft should have sign bit set (negative) or it will break
						do undepthMask >>>= 3, undepthPow8 >>>= 3, undepth >>>= 1, undepthMaskLeft >>= 3
						while(!(ri & undepthMask) && undepth)
					}
					yieldo.data = startStuff, yieldo.x = prx+ox, yieldo.y = pry+oy, yieldo.z = prz+oz, yieldo.size = undepth
					yield yieldo
					pri += undepthPow8
					carry = undepth;
					do{//from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
						carry = carry & ~(prz ^= carry)
						carry = carry & ~(pry ^= carry)
						carry = (carry & ~(prx ^= carry))<<1
					} while (carry);
				}
			}
		}/*{//slower than above (tested with simple terrain)
			let carry, x=0,y=0,z=0, sx,sy,sz, startStuff, cx,cy,cz, hi2Pow, notReachedEnd = true
			while(notReachedEnd){
				sx = cx = x, sy = cy = y, sz = cz = z //s start, c current, p previous
				startStuff = this.data[x*size*size+y*size+z]
				hi2Pow = 0.5
				findChunk:do{
					if(cx-sx === cy-sy && cy-sy === cz-sz && (cx-sx+1) === hi2Pow*2){//found new biggest cube with pow of 2 width
						hi2Pow *= 2
						if(cx+1 === size && cy+1 === size && cz+1 === size){
							notReachedEnd = false
							break findChunk
						}
						carry = 1;
						do{//from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
							carry = carry & ~(cz ^= carry)
							carry = carry & ~(cy ^= carry)
							carry = (carry & ~(cx ^= carry))<<1
						} while (carry);
						x = cx, y = cy, z = cz//save new starting position
						continue findChunk
					}
					if(cx+1 === size && cy+1 === size && cz+1 === size){
						notReachedEnd = false
						break findChunk
					}
					carry = 1;
					do{//from https://stackoverflow.com/questions/10745733/next-iteration-in-z-order-curve
						carry = carry & ~(cz ^= carry)
						carry = carry & ~(cy ^= carry)
						carry = (carry & ~(cx ^= carry))<<1
					} while (carry);
				}while(PartsNodeFncts.compare(startStuff,this.data[(cx<<sh|cy)<<sh|cz]) && cx>=sx && cy>=sy && cz>=sz)
				yieldo.data = startStuff, yieldo.x = sx, yieldo.y = sy, yieldo.z = sz, yieldo.size = hi2Pow
				yield yieldo
			}
			/*
			carry = 1;
			do{
				newcarry = i & carry;
				i ^= carry;
				carry = newcarry<<sh;
				newcarry = i & carry;
				i ^= carry;
				carry = newcarry<<sh;
				newcarry = i & carry;
				i ^= carry;
				carry = newcarry>>sh>>sh<<1;
			} while (carry);
			
			do{
				newcarry = cz & carry;
				cz ^= carry;
				carry = newcarry;
				newcarry = cy & carry;
				cy ^= carry;
				carry = newcarry;
				newcarry = (cx & carry) << 1;
				cx ^= carry;
				carry = newcarry;
			} while (carry);*-/
		}*/else{
			const sh = this.sizebits, an = (1<<sh)-1
			yieldo.size = 1
			for(let i=0; i<this.size*this.size*this.size; i++){
				yieldo.data = this.data[i]
				yieldo.x = (i>>sh>>sh)+ox, yieldo.y = (i>>sh&an)+oy, yieldo.z = (i&an)+oz
				yield yieldo
			}
		}
	}
	iterateActive(cb,x,y,z){
		const sh = this.depth+1, an = (1<<sh)-1, size = this.size
		for(let i of this.active){
			cb(this.data[i],(i>>sh>>sh)+x,(i>>sh&an)+y,(i&an)+z,this,x,y,z,size)
		}
	}
}
/*For testing generate speed
a=performance.now()
c=serverWorld.requireChunk(0,0,0);c.generate()
serverWorld.players[0].updates.push(0,0,0,c.tree.depth,c.tree)
performance.now()-a
*/
class Chunk{
	/**
	 * @type {Object.<string,AttributeFormat>}
	 */
	attrFormat = {}
	lastAttrOffset = 0
	generated = false
	active = 0
	loadedPlayers = new Set()
	cachedPartsNode; cachedPartsNodeX = NaN; cachedPartsNodeY = NaN; cachedPartsNodeZ = NaN
	cachedParenNode; cachedParenNodeX = NaN; cachedParenNodeY = NaN; cachedParenNodeZ = NaN; cachedParenNodeSize = 0
	/**
	 * @param {ServerWorld} world
	 */
	constructor(world,x,y,z){
		/**@type {ServerWorld} */
		this.world = world
		this.tree = world.partIds.air << this.requireAttr("id").offset
		this.x = x
		this.y = y
		this.z = z
	}
	/**
	 * when useCache is true, problems may occur like not merging
	 */
	set(x,y,z,data,offx,offy,offz,active=0, useCache){
		changedThing = null
		PartsNodeFncts.valueOfThat.newValue = data
		PartsNodeFncts.valueOfThat.newActive = active
		if(useCache) this.cachedParenNode.set(x-this.cachedParenNodeX,y-this.cachedParenNodeY,z-this.cachedParenNodeZ,offx,offy,offz)
		else thingblock:{
			if(this.tree.isSubchunk){
				const didMerge = this.tree.set(x,y,z,offx,offy,offz)
				this.active = this.tree.isActive()
				if(!didMerge) break thingblock//don't check for merge
			}else{//if leaf node, split
				const didMerge = (this.tree = new SubchunkOctree(this.world.chunkBits-1, this.tree)).set(x,y,z,offx,offy,offz)
				this.active = this.tree.isActive()
				changedThing = this.tree, changedThingDepth = this.world.chunkBits-1
				if(!didMerge) break thingblock//don't check for merge
			}
			if(this.tree instanceof SubchunkOctree && this.tree.canMerge()){
				this.tree = this.tree[0]
				changedThing = this.tree, changedThingDepth = this.world.chunkBits-1
			}
		}
		this.updated(x,y,z)
	}
	get(x,y,z,offx,offy,offz){
		if(x === this.cachedPartsNodeX && y === this.cachedPartsNodeY && z === this.cachedPartsNodeZ) return PartsNodeFncts.getOn(this.cachedPartsNode,offx,offy,offz)
		let t = this.tree
		while(true){
			if(t instanceof SubchunkOctree) t = t[(x>>>t.depth&1)<<2 | (y>>>t.depth&1)<<1 | z>>>t.depth&1]
			else if(t instanceof SubchunkArray) t = t[(x>>>t.depth)*this.size*this.size+(y>>>t.depth)*this.size+(z>>>t.depth)]
			else break
		}
		return PartsNodeFncts.getOn(t,offx,offy,offz)
	}
	/**
	 * when useCache is true, problems may occur like not merging
	 */
	delete(x,y,z,offx,offy,offz,useCache){
		changedThing = null
		if(useCache) this.cachedParenNode.set(x-this.cachedParenNodeX,y-this.cachedParenNodeY,z-this.cachedParenNodeZ,offx,offy,offz)
		else{
			if(this.tree.isSubchunk){
				const didMerge = this.tree.delete(x,y,z,offx,offy,offz)
				this.active = this.tree.isActive()
				if(!didMerge) return//don't check for merge
			}else{//if leaf node, split
				const didMerge = (this.tree = new SubchunkOctree(this.depth-1, this.tree)).delete(x,y,z,offx,offy,offz)
				changedThing = this.tree, changedThingDepth = this.depth-1
				this.active = this.tree.isActive()
				if(!didMerge) return//don't check for merge
			}
			if(this.tree instanceof SubchunkOctree && this[i].canMerge()){
				this.tree = this.tree[0]
				changedThing = this.tree, changedThingDepth = this.depth-1
			}
		}
		this.updated(x,y,z)
	}
	/**@returns {AttributeFormat} */
	requireAttr(attrname){
		if(this.attrFormat[attrname]) return this.attrFormat[attrname]
		else{
			const ret = this.attrFormat[attrname] = {...this.world.attrTypes[attrname],offset:this.lastAttrOffset,used:0}
			this.lastAttrOffset = ret.offset+ret.size
			return ret
		}
	}
	getAttr(x,y,z,offx,offy,offz,attrname){
		if(!this.attrFormat[attrname]) return 0
		const {[attrname]:{offset,mask}} = this.attrFormat
		return this.get(x,y,z,offx,offy,offz)>>offset & mask
	}
	setAttr(x,y,z,offx,offy,offz,attrname,value){
		const {offset,mask} = this.requireAttr(attrname)
		const prev = this.get(x,y,z,offx,offy,offz)
		/*const maskshift = mask<<offset
		if(value){
			if(!(prev&maskshift)) this.attrFormat[attrname].used++
		}else if(prev&(~maskshift)) this.attrFormat[attrname].used--*/
		this.set(x,y,z,prev&(~(mask<<offset))|((value&mask)<<offset))
	}
	toAll(data){
		let ret = {}
		for(let attrname in this.attrFormat){
			const {size,offset,mask} = this.attrFormat[attrname]
			const v = data>>offset & mask
			if(v) ret[attrname] = v
		}
		return ret
	}
	getAll(x,y,z,offx,offy,offz){
		return this.toAll(this.get(x,y,z,offx,offy,offz))
	}
	setAll(x,y,z,offx,offy,offz,o,active){
		let data = 0
		for(let attrname in o){
			data |= o[attrname]<<this.requireAttr(attrname).offset
		}
		this.set(x,y,z,data,offx,offy,offz,active)
	}
	move(x,y,z,offx,offy,offz,changeX,changeY,changeZ){//todo: optimize when in same leaf node
		const chunkPosMask = this.world.chunkPosMask
		let noffx = offx + changeX, noffy = offy + changeY, noffz = offz + changeZ
		let nx = x + floor(noffx), ny = y + floor(noffy), nz = z + floor(noffz)
		noffx -= floor(noffx), noffy -= floor(noffz), noffz -= floor(noffz)
		const inCache = x>=this.cachedParenNodeX && x<this.cachedParenNodeX+this.cachedParenNodeSize && y>=this.cachedParenNodeY && y<this.cachedParenNodeY+this.cachedParenNodeSize && z>=this.cachedParenNodeZ && z<this.cachedParenNodeZ+this.cachedParenNodeSize
		const newInCache = nx>=this.cachedParenNodeX && nx<this.cachedParenNodeX+this.cachedParenNodeSize && ny>=this.cachedParenNodeY && ny<this.cachedParenNodeY+this.cachedParenNodeSize && nz>=this.cachedParenNodeZ && nz<this.cachedParenNodeZ+this.cachedParenNodeSize
		const newValue = this.get(x,y,z,offx,offy,offz)
		const newActive = PartsNodeFncts.valueOfThat.newActive
		if((nx&(~chunkPosMask)) || (ny&(~chunkPosMask)) || (nz&(~chunkPosMask))){//in different chunk?
			this.world.getChunk(nx,ny,nz).setAll(nx&chunkPosMask,ny&chunkPosMask,nz&chunkPosMask,noffx,noffy,noffz,newValue,newActive)
		}else{
			this.set(nx,ny,nz,newValue,noffx,noffy,noffz,newActive,newInCache)
		}
		this.delete(x,y,z,offx,offy,offz,inCache&&newInCache/*when not in same one, merging may happen*/)
	}
	/** add changed thing to player's updates*/
	updated(x,y,z){
		x += this.x, y += this.y, z += this.z
		for(let p of this.loadedPlayers)addUpdate:{
			for(let i=0; i<p.updates.length; i+=5){
				let b = p.updates[i+4]
				const bigger = changedThingDepth<p.updates[i+3] ? b : changedThing//check for overlap
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
	tickVerMask; tickVer = 0
	tick(){
		if(!this.active) return
		const a = this.requireAttr("tickVer")
		this.tickVerMask = a.mask
		this.tickVer ^= a.mask
		this.tree.iterateActive(this.tickPartsNode,0,0,0)
		this.cachedParenNodeX = NaN//invalidate cache
		this.cachedPartsNodeX = NaN
	}
	/**
	 * data should be the array type because only active ones should be ticked
	 * @param {PartsNode} data
	 */
	tickPartsNode = (data,x,y,z,parent,parentX,parentY,parentZ,parentSize) => {
		this.cachedPartsNode = data
		this.cachedPartsNodeX = x
		this.cachedPartsNodeY = y
		this.cachedPartsNodeZ = z
		this.cachedParenNode = parent
		this.cachedParenNodeX = parentX
		this.cachedParenNodeY = parentY
		this.cachedParenNodeZ = parentZ
		this.cachedParenNodeSize = parentSize
		for(let i=data.length-PartsNodeStride; i>=0; i-=PartsNodeStride){
			if(data[i+4] && (data[i+3]&this.tickVerMask) === this.tickVer){
				data[i+3] ^= this.tickVerMask
				//todo: do something (like move it)
			}
		}
	}
	generate(){
		const addHeight = 4*this.world.chunkSize-this.y
		const {partIds} = this.world
		const idoffset = this.requireAttr("id").offset
		const scale = 1/this.world.chunkSize
		if(addHeight*scale>=-1 || addHeight<=0){
			const noise = this.world.noise.noise2D
			const newC = new SubchunkArray(this.world.chunkBits-1,this.world.partIds.air<<idoffset)
			const width = this.world.chunkSize
			for(let x=0; x<width; x++) for(let z=0; z<width; z++){
				const h = noise((x+this.x)*scale,(z+this.z)*scale)*this.world.chunkSize+addHeight
				for(let y=0; y<min(h,this.world.chunkSize); y++){
					newC.set(x,y,z,partIds.stone<<idoffset,0,0,0)
				}
			}
			this.tree = SubchunkOctree.from(newC)
		}else if(addHeight<0) this.tree = partIds.stone<<idoffset
		else this.tree = partIds.air<<idoffset
		this.generated = true
		changedThing = this.tree
		changedThingDepth = this.tree.depth
		this.updated(this.x,this.y,this.z)
	}
}
/**
 * @typedef {{size:number,mask:number,offset?:number}} AttributeFormat
 */
class ServerWorld{
	chunkSize = 256
	/**
	if not dynamic, it does not move freely
	*/
	partTypes = [
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
	/**@type {Object.<string,AttributeFormat>} */
	attrTypes = {id:{size:16},texture:{size:4},tickVer:{size:1}}
	/**@type {Map.<string,Chunk>} */
	chunks = new Map()
	/**@type {Set.<Chunk>} */
	loadedChunks = new Set()
	players = new Set()
	constructor(){
		this.partIds = {}
		for(let i=0; i<this.partTypes.length; i++){
			this.partIds[this.partTypes[i].name] = i
		}
		for(let attrname in this.attrTypes){
			const a = this.attrTypes[attrname]
			a.mask = (1<<a.size)-1
		}
		//Object.defineProperty(this,"chunkSize",{writable:false})
		this.chunkPosMask = this.chunkSize-1, this.chunkBits = Math.log2(this.chunkSize)

		this.workers = workers.map(w => {
			const c = new MessageChannel()
			w.postMessage("", c.port2)
			return c.port1
		})

		let rnd = new Marsaglia()
		this.noise = SimplexNoise(rnd.nextDouble.bind(rnd))
	}
	/**@returns {Chunk=} */
	getChunk(x,y,z){
		return this.chunks.get(`${floor(x) >> this.chunkBits},${floor(y) >> this.chunkBits},${floor(z) >> this.chunkBits}`)
	}
	/**@returns {Chunk} */
	requireChunk(x,y,z){
		const k = `${floor(x) >> this.chunkBits},${floor(y) >> this.chunkBits},${floor(z) >> this.chunkBits}`
		let newChunk
		return this.chunks.get(k) || (this.chunks.set(newChunk = new Chunk(this, floor(x)&(~this.chunkPosMask), floor(y)&(~this.chunkPosMask), floor(z)&(~this.chunkPosMask))), newChunk)
	}
	setAll(x,y,z,o){
		const c = this.requireChunk(x,y,z), xr = floor(x), yr = floor(y), zr = floor(z)
		c.setAll(xr&this.chunkPosMask,yr&this.chunkPosMask,zr&this.chunkPosMask, x-xr,y-yr,z-zr, o)
	}
	getAll(x,y,z){
		const c = this.getChunk(x,y,z), xr = floor(x), yr = floor(y), zr = floor(z)
		if(c) return c.getAll(xr&this.chunkPosMask,yr&this.chunkPosMask,zr&this.chunkPosMask, x-xr,y-yr,z-zr)
	}
	setAttr(x,y,z,attrname,data){
		const c = this.requireChunk(x,y,z), xr = floor(x), yr = floor(y), zr = floor(z)
		c.setAttr(xr&this.chunkPosMask,yr&this.chunkPosMask,zr&this.chunkPosMask, x-xr,y-yr,z-zr, attrname,data)
	}
	getAttr(x,y,z,attrname){
		const c = this.getChunk(x,y,z)
		if(c) return c.getAttr(xr&this.chunkPosMask,yr&this.chunkPosMask,zr&this.chunkPosMask, x-xr,y-yr,z-zr, attrname)
	}
	tick(){
		for(const p of this.players){
			if(p.loadDist !== undefined){
				const {loadDist} = p, offsetX = (p.x>>this.chunkBits)-loadDist, offsetY = (p.y>>this.chunkBits)-loadDist, offsetZ = (p.z>>this.chunkBits)-loadDist
				if(p.offsetX !== offsetX || p.offsetY !== offsetY || p.offsetZ !== offsetZ || loadDist !== p.prevLoadDist){
					const prevLoadWidth = p.loadWidth || 0
					const offsetXChange = (offsetX-p.offsetX)||0
					const offsetYChange = (offsetY-p.offsetY)||0
					const offsetZChange = (offsetZ-p.offsetZ)||0
					const pOffsetX = p.offsetX||0
					const pOffsetY = p.offsetY||0
					const pOffsetZ = p.offsetZ||0
					p.offsetX = offsetX
					p.offsetY = offsetY
					p.offsetZ = offsetZ
					p.chunkX = p.x>>this.chunkBits
					p.chunkY = p.y>>this.chunkBits
					p.chunkZ = p.z>>this.chunkBits
					p.prevLoadDist = loadDist
					const loadWidth = p.loadWidth = loadDist*2+1
					for(let cx=0; cx<prevLoadWidth; cx++) for(let cy=0; cy<prevLoadWidth; cy++) for(let cz=0; cz<prevLoadWidth; cz++){
						//unload old chunks
						const cxm = (cx+pOffsetX)<<this.chunkBits, cym = (cy+pOffsetY)<<this.chunkBits, czm = (cz+pOffsetZ)<<this.chunkBits
						const chunk = this.getChunk(cxm,cym,czm)
						if(chunk && (max(cx-offsetXChange,cy-offsetYChange,cz-offsetZChange)>=loadWidth || min(cx-offsetXChange,cy-offsetYChange,cz-offsetZChange)<0)){
							chunk.loadedPlayers.delete(p)
							if(!chunk.loadedPlayers.size) this.loadedChunks.delete(chunk)
						}
					}
					let chunkGenI = 0
					for(let cx=0; cx<loadWidth; cx++) for(let cy=0; cy<loadWidth; cy++) for(let cz=0; cz<loadWidth; cz++){
						//load new chunks
						const cxm = (cx+offsetX)<<this.chunkBits, cym = (cy+offsetY)<<this.chunkBits, czm = (cz+offsetZ)<<this.chunkBits
						const chunk = this.requireChunk(cxm,cym,czm)
						if(max(cx+offsetXChange,cy+offsetYChange,cz+offsetZChange)>=prevLoadWidth || min(cx+offsetXChange,cy+offsetYChange,cz+offsetZChange)<0){
							p.updates.push(cxm,cym,czm,this.chunkBits-1,chunk.tree)
							if(!chunk.loadedPlayers.size) this.loadedChunks.add(chunk)
							chunk.loadedPlayers.add(p)
						}
						if(!chunk.generated) p.chunkGenQueue[chunkGenI++] = chunk
					}
					sortChunks.argsP = p
					p.chunkGenQueue.sort(sortChunks)
				}
			}
			if(p.canSendChunkUpdates && p.updates.length){
				//let sendStart = performance.now()
				for(let i=0; i<p.updates.length; i+=5){
					const x = p.updates[i], y = p.updates[i+1], z = p.updates[i+2], depth = p.updates[i+3], tree = p.updates[i+4]
					const format = this.getChunk(x,y,z).attrFormat
					let arr = [x,y,z,depth,0,0]
					arr.fromAttrFormat = format
					arr.allAttrFormat = this.attrTypes
					const basePtr = typeof tree === "object" && ("depth" in tree) ? tree.flatten(arr) : PartsNodeFncts.flatten(tree,arr)
					arr.fromAttrFormat = null
					arr[4] = basePtr, arr[5] = arr.length-6
					p.connection.send({type:"chunkUpdate",data:arr})
				}
				p.updates.length = 0
				p.canSendChunkUpdates = false
				p.connection.send({type:"chunkUpdatesEnd"})
			}
		}
		for(let chunk of this.loadedChunks){
			chunk.tick()
		}
		if(!this.doingChunkStuff) this.doChunkStuff()
	}
	async doChunkStuff(){return//tesst
		this.doingChunkStuff = true
		let start = performance.now(), now = start
		let nextP = -1
		main:while(true){
			let pItd = 0
			do{//give each player a turn for chunk gen
				if(pItd >= this.players.size) break main //all players have nothing in queues
				nextP++
				if(nextP === this.players.size) nextP = 0
				pItd++
			}while(!this.players.get(nextP).chunkGenQueue.length)
			const p = this.players.get(nextP)
			if(p.chunkGenQueue.length){
				const chunk = p.chunkGenQueue.pop()
				if(!chunk.generated) chunk.generate()
			}
			await yieldThread()
		}
		this.doingChunkStuff = false
	}
	addPlayer(c){
		let p = {connection:c,entity:null,canSendChunkUpdates:false,chunkGenQueue:[],updates:[]}
		this.players.add(p)
		c.addEventListener("message", e => {
			const pkt = e.data
			switch(pkt.type){
				case "connect":
					c.send({type:"partTypes",data:this.partTypes.map(r => r.name)})
					c.send({type:"worldInfo",chunkSize:this.chunkSize,chunkBits:this.chunkBits})
					c.send({type:"connect"})
					break
				case "pos":
					p.x = pkt.x
					p.y = pkt.y
					p.z = pkt.z
					p.loadDist = pkt.loadDist
					c.send({type:"canSendPos"})
				case "canSendChunkUpdates":
					p.canSendChunkUpdates = true
					break
			}
		})
		c.addEventListener("close", () => {
			this.players.delete(p)
		})
	}
}
serverExports.ServerWorld = ServerWorld

const workerURL = URL.createObjectURL(new Blob([`(${LFBDSW.toString()})()`], { type: "text/javascript" }))
const workers = []
for(let i=0;i<workerCount;i++){
	const w = new Worker(workerURL)
	workers.push(w)

}

/**decompress from https://dev.to/lucasdamianjohnson/compress-decompress-an-arraybuffer-client-side-in-js-2nf6*/
async function decompress(e,t){const n=new DecompressionStream(e),r=n.writable.getWriter();r.write(t),r.close();const o=[],s=n.readable.getReader();let a=0;for(;;){const{value:e,done:t}=await s.read();if(t)break;o.push(e),a+=e.byteLength}const c=new Uint8Array(a);let i=0;for(const e of o)c.set(e,i),i+=e.byteLength;return(new TextDecoder).decode(c)}
async function compress(e,t){const n=new CompressionStream(e),r=n.writable.getWriter();r.write((new TextEncoder).encode(t)),r.close();const o=[],s=n.readable.getReader();let a=0;for(;;){const{value:e,done:t}=await s.read();if(t)break;o.push(e),a+=e.byteLength}const c=new Uint8Array(a);let i=0;for(const e of o)c.set(e,i),i+=e.byteLength;return c}
serverExports.decompress = decompress, serverExports.compress = compress
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
serverExports.strtohash = strtohash
function arrtoa() {
	let str = ""
	for (let i = 0; i < this.length; i++) {
		str += String.fromCharCode(this[i])
	}
	return btoa(str)
}
serverExports.arrtoa = arrtoa
function atoarr(data){
	let bytes = atob(data)
	let arr = new Uint8Array(bytes.length)
	for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
	return arr
}
serverExports.atoarr = atoarr

// The random function are copied from the processing.js source code
function createXxHash(seed = Math.random() * 2100000000 | 0){
	const PRIME32_2 = 1883677709;
	const PRIME32_3 = 2034071983;
	const PRIME32_4 = 668265263;
	const PRIME32_5 = 374761393;

	const { imul } = Math;

	const hash = (x, y) => {
		let h32 = 0;

		h32 = seed + PRIME32_5 | 0;
		h32 += 8;

		h32 += imul(x, PRIME32_3);
		h32 = imul(h32 << 17 | h32 >> 32 - 17, PRIME32_4);
		h32 += imul(y, PRIME32_3);
		h32 = imul(h32 << 17 | h32 >> 32 - 17, PRIME32_4);

		h32 ^= h32 >> 15;
		h32 *= PRIME32_2;
		h32 ^= h32 >> 13;
		h32 *= PRIME32_3;
		h32 ^= h32 >> 16;

		return h32 / 2147483647;
	};
	const hash3 = (x, y, z) => {
		let h32 = 0;

		h32 = seed + PRIME32_5 | 0;
		h32 += 8;

		h32 += imul(x, PRIME32_3);
		h32 = imul(h32 << 17 | h32 >> 32 - 17, PRIME32_4);
		h32 += imul(y, PRIME32_3);
		h32 = imul(h32 << 17 | h32 >> 32 - 17, PRIME32_4);
		h32 += imul(z, PRIME32_3);
		h32 = imul(h32 << 17 | h32 >> 32 - 17, PRIME32_4);

		h32 ^= h32 >> 15;
		h32 *= PRIME32_2;
		h32 ^= h32 >> 13;
		h32 *= PRIME32_3;
		h32 ^= h32 >> 16;

		return h32 / 2147483647;
	};

	return {
		hash, hash3
	};
}

/** from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c*/
class Marsaglia {
	nextInt() {
		const { z, w } = this;
		this.z = 36969 * (z & 65535) + (z >>> 16) & 0xFFFFFFFF;
		this.w = 18000 * (w & 65535) + (w >>> 16) & 0xFFFFFFFF;
		return ((this.z & 0xFFFF) << 16 | this.w & 0xFFFF) & 0xFFFFFFFF;
	}
	nextDouble() {
		const i = this.nextInt() / 4294967296;
		const is_less_than_zero = (i < 0) | 0; // cast to 1 or 0
		return is_less_than_zero + i;
	}
	constructor(i1, i2) { // better param names
		this.z = i1 | 0;
		this.w = i2 || createXxHash(i1).hash(521288629, this.z) * 2147483647 | 0;
	}
}

/**from https://gist.github.com/esimov/9be66c7c9d02cf6fc1cb*/
function SimplexNoise(random){
	// Skewing and unskewing factors for 2, 3, and 4 dimensions
	var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
	var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
	var F3 = 1.0 / 3.0;
	var G3 = 1.0 / 6.0;

	var perm = new Uint8Array(512);
	var permMod12 = new Uint8Array(512);

	var p = new Uint8Array(256);
	

	// Prepopulate the permutation table with values from lookup table
	// To remove the need for index wrapping, double the permutation table length
	var grad3 = new Float32Array([
			1,1,0, -1,1,0, 1,-1,0, -1,-1,0,
			1,0,1, -1,0,1, 1,0,-1, -1,0,-1,
			0,1,1, 0,-1,1, 0,1,-1, 0,-1,-1
	]);

	for (var i = 0; i < 256; i++) {
			p[i] = (random()*256)|0;
	}

	// To remove the need for index wrapping, double the permutation table length 
	for (var i=0; i < 512; i++) {
			perm[i] = p[i & 255];
			permMod12[i] = perm[i] % 12;
	}

	return {
		noise2D (xin, yin) {
			xin *= 0.5, yin *= 0.5
			var n0, n1, n2, i1, j1;

			// Skew the input space to determine which simplex cell we're in
			var s = (xin + yin) * F2;
			var i = Math.floor(xin + s);
			var j = Math.floor(yin + s);

			var t = (i + j) * G2; // Simple skew factor for 2D
			// Unskew the cell origin back to (x, y) space
			var X0 = i - t;
			var Y0 = j - t;
			// The x,y distances from the cell origin
			var x0 = xin - X0;
			var y0 = yin - Y0;

			// For the 2D case, the simplex shape is an equilateral triangle.
			// Determine which simplex we are in.
			if (x0 > y0) { i1 = 1; j1 = 0} // lower triangle, XY order: (0,0)->(1,0)->(1,1)
			else {i1 = 0; j1 = 1}	// upper triangle, YX order: (0,0)->(0,1)->(1,1)

			// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
			// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
			// c = (3-sqrt(3))/6

			var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
			var y1 = y0 - j1 + G2;
			var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
			var y2 = y0 - 1.0 + 2.0 * G2;

			// Work out the hashed gradient indices of the three simplex corners
			var ii = i & 255;
			var jj = j & 255;

			// Calculate the contribution from the three corners
			var t0 = 0.5 - x0*x0 - y0*y0;
			if(t0 < 0) n0 = 0.0;
			else {
					var gi0 = permMod12[ii+perm[jj]];
					t0 *= t0;
					n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0+1] * y0);
			}

			var t1 = 0.5 - x1*x1 - y1*y1;
			if (t1 < 0 ) n1 = 0.0;
			else {
					var gi1 = permMod12[ii + i1 + perm[jj+j1]];
					t1 *= t1;
					n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1+1] * y1);
			}

			var t2 = 0.5 - x2*x2 - y2*y2;
			if (t2 < 0 ) n2 = 0.0;
			else {
					var gi2 = permMod12[ii + 1 + perm[jj+1]];
					t2 *= t2;
					n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2+1] * y2);
			}

			// Add contributions from each corner to get the final noise value.
			// The result is scaled to return values in the interval [-1,1].
			return 70.0 * (n0 + n1 + n2);
		},
		noise3D (xin, yin, zin) {
			xin *= 0.5, yin *= 0.5, zin *= 0.5
			// Noise contribution from the four corners
			var n0, n1, n2, n3;

			// Skew the input space to determine which simplex cell we are in
			var s = (xin+yin+zin) * F3; // Simple skew factor for 3D
			var i = Math.floor(xin + s);
			var j = Math.floor(yin + s);
			var k = Math.floor(zin + s);
			var t = (i + j + k) * G3;
			var X0 = i - t;
			var Y0 = j - t;
			var Z0 = k - t;

			// The x, y, z distances from the cell origin
			var x0 = xin - X0;
			var y0 = yin - Y0;
			var z0 = zin - Z0;

			// For the 3D case, the simplex shape is a slightly irregular tetrahedron.
			// Determine which simplex we are in.
			var i1, j1, k1,
					i2, j2, k2;

			if (x0 >= y0) {
					if (y0 >= z0) {
							i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; // XYZ order
					} else if (x0 >= z0) {
							i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; // XZY order
					} else {
							i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; // ZXY order
					}
			} else {// x0<y0
					if (y0 < z0) {
							i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; // ZYX order
					} else if (x0 < z0) {
							i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; // YZX order
					} else {
							i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; // YXZ order
					}
			}

			// A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
			// a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
			// a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
			// c = 1/6.

			var x1 = x0 - i1 + G3;
			var y1 = y0 - j1 + G3;
			var z1 = z0 - k1 + G3;

			var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
			var y2 = y0 - j2 + 2.0 * G3;
			var z2 = z0 - k2 + 2.0 * G3;

			var x3 = x0 - 1.0 + 3.0 * G3;
			var y3 = y0 - 1.0 + 3.0 * G3;
			var z3 = z0 - 1.0 + 3.0 * G3;

			// Work out the hashed gradient indices of the four simplex corners
			var ii = i & 255;
			var jj = j & 255;
			var kk = k & 255;

			var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
			if (t0 < 0) n0 = 0.0;
			else {
					t0 *= t0;
					var gi0 = permMod12[ii+perm[jj+perm[kk]]];
					n0 = t0 * t0 * (grad3[gi0]*x0 + grad3[gi0+1]*y0 + grad3[gi0+2]*z0);
			}
			var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
			if (t1 < 0) n1 = 0.0;
			else {
					t1 *= t1;
					var gi1 = permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]];
					n1 = t1 * t1 * (grad3[gi1]*x1 + grad3[gi1+1]*y1 + grad3[gi1+2]*z1);
			}
			var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
			if (t2 < 0) n2 = 0.0;
			else {
					t2 *= t2;
					var gi2 = permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]];
					n2 = t2 * t2 * (grad3[gi2]*x2 + grad3[gi2+1]*y2 + grad3[gi2+2]*z2);
			}
			var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
			if (t3 < 0) n3 = 0.0;
			else {
					t3 *= t3;
					var gi3 = permMod12[ii+1+perm[jj+1+perm[kk+1]]];
					n3 = t3 * t3 * (grad3[gi3]*x3 + grad3[gi3+1]*y3 + grad3[gi3+2]*z3);
			}

			// Add contributions from each corner to get the final noise value.
			// The result is scaled to stay just inside [-1,1]
			return 32.0 * (n0 + n1 + n2 + n3);
		}
	}
}
serverExports.SimplexNoise = SimplexNoise
function map(v, min, max, min2, max2){
	return min2 + (max2 - min2) * ((v - min) / (max - min));
}
function lerp(t, a, b) {
	return a + t * (b - a);
}
function dist2(x,y,x2,y2){
	const xDist = x - x2
	const yDist = y - y2
	return sqrt((xDist*xDist)+(yDist*yDist))
}
function dist3(x,y,z,x2,y2,z2){
	const xDist = x - x2
	const yDist = y - y2
	const zDist = z - z2
	return sqrt((xDist*xDist)+(yDist*yDist)+(zDist*zDist))
}
function chunkDist(p,c,chunkBits){
	return max(abs((c.x>>chunkBits)-p.chunkX),abs((c.y>>chunkBits)-p.chunkY),abs((c.z>>chunkBits)-p.chunkZ))
}
function sortChunks(a,b){
	const xa = a.x-sortChunks.argsP.x
	const ya = a.y-sortChunks.argsP.y
	const za = a.z-sortChunks.argsP.z
	const xb = b.x-sortChunks.argsP.x
	const yb = b.y-sortChunks.argsP.y
	const zb = b.z-sortChunks.argsP.z
	return xb*xb+yb*yb+zb*zb-(xa*xa+ya*ya+za*za)
}
function yieldThread(){
	return new Promise(resolve => setTimeout(resolve, 1000))
}
/*class Queue{
	a = []
	r = []
	enq(i){this.a.push(i)}
	deq(){
		if(!this.r.length){
			while(this.a.length>1) this.r.push(this.a.pop())
			return this.a.pop()
		}
		return this.r.pop()
	}
	has(i){return this.a.includes(i)||this.r.includes(i)}
}*/

return serverExports

/**Code for worker*/
function LFBDSW(){
	onmessage = function(e){
		const c = e.ports[0]
		const chunks = new Map()
		c.onmessage = function(e){
			switch(e.data.type){

			}
		}
	}
}
}