"use strict"
export function LFBDS({workerCount}){
let serverExports = {}
const {
	Worker,MessageChannel,setTimeout,Map,Set,URL,Object,Array,Blob,String,Uint8Array,Promise,Uint32Array,Uint16Array,Int16Array,Int32Array,Int8Array,Symbol,NaN,Infinity,undefined,ArrayBuffer,Boolean,Date,setInterval
} = globalThis// prevent it modified from outside
const {round,floor,ceil,abs,max,min,sqrt,PI,random} = Math
const PI2 = PI*0.5, PId = PI*2

const workerURL = URL.createObjectURL(new Blob([`(${LFBDSW.toString()})()`], { type: "text/javascript" }))
const wIdS = Symbol("it is the id for the worker. symbol prevent collision.")
class Chunk{
	loadedPlayers = new Set()
	/**
	 * @param {ServerWorld} world
	 */
	constructor(world,x,y,z){
		/**@type {ServerWorld} */
		this.world = world
		//this.tree = world.partIds.air << this.requireAttr("id").offset
		this.x = x
		this.y = y
		this.z = z
		this.wId = world.chooseW(x,y,z)
		world.workersChunkCount[this.wId]++
		this.assignedWorker = world.workers[this.wId]
		for(let w of world.workers) w.postMessage({type:"assignChunk",x,y,z,ownerId:this.assignedWorker[wIdS]})
	}
	addLoadedPlayer(p){
		this.loadedPlayers.add(p)
		this.assignedWorker.postMessage({type:"addLoadedPlayer",id:p.id,x:this.x,y:this.y,z:this.z})
	}
	removeLoadedPlayer(p){
		this.loadedPlayers.delete(p)
		this.assignedWorker.postMessage({type:"removeLoadedPlayer",id:p.id,x:this.x,y:this.y,z:this.z})
	}
}
let wasmModule
async function sendWASM(workers){
	if(!wasmModule){
		wasmModule = await WebAssembly.compileStreaming(fetch("wasm/theformats.wasm"))
	}
	for(let w of workers){
		w.postMessage({type:"wasmModule",wasmModule})
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
			name:"air",
			texture:0x00000000,
			solid:false
		},
		{
			name:"stone",
			texture:0x888888ff,
			solid:true
		},
		{
			name:"blue",
			texture:0x0088ffff,
			solid:true
		},
		{
			name:"faller",
			texture:0xffff00ff,
			solid:true
		},
		{
			name:"grass",
			texture:[0x008800ff,0x009000ff,0x009800ff,0x00a000ff,0x00a800ff,0x00b000ff,0x00b800ff,0x00c000ff],
			windBlow:true,
			color:true
		}
	]
	/**@type {Map.<string,Chunk>} */
	chunks = new Map()
	/**@type {Set.<Chunk>} */
	loadedChunks = new Set()
	players = new Map()
	tickMsgVer = 0
	constructor(){
		this.partIds = {}
		for(let i=0; i<this.partTypes.length; i++){
			this.partIds[this.partTypes[i].name] = i
		}
		/*for(let attrname in this.attrTypes){
			const a = this.attrTypes[attrname]
			a.mask = (1<<a.size)-1
		}*/
		//Object.defineProperty(this,"chunkSize",{writable:false})
		this.chunkPosMask = this.chunkSize-1, this.chunkBits = Math.log2(this.chunkSize)

		let channels = new Map()
		for(let i=0; i<workerCount; i++){
			for(let j=i+1; j<workerCount; j++){
				let c = new MessageChannel()
				channels.set(i+","+j,c.port1)
				channels.set(j+","+i,c.port2)
			}
		}
		const worldInfo = {
			chunkSize:this.chunkSize,chunkPosMask:this.chunkPosMask,chunkBits:this.chunkBits,partTypes:this.partTypes,partIds:this.partIds
		}
		this.workers = []
		this.workersWasmModuleInitializedPromisesResolve = []
		let workersWasmModuleInitializedPromises = []
		for(let i=0;i<workerCount;i++){
			const w = new Worker(workerURL)
			this.workers.push(w)
			let otherC = []
			for(let j=0; j<workerCount; j++){
				otherC.push(channels.get(i+","+j))
			}
			w.postMessage({otherC,wId:i,worldInfo}, [...otherC.filter(x=>x)])
			w[wIdS] = i
			w.onmessage = this.#workerOnMessage(i)
			let ic = i
			workersWasmModuleInitializedPromises.push(new Promise(resolve => this.workersWasmModuleInitializedPromisesResolve[ic] = resolve))
		}
		this.waitInit = Promise.all(workersWasmModuleInitializedPromises)
		this.waitInit.then(() => {
			this.workersWasmModuleInitializedPromisesResolve = null
			this.waitInit = null
		})
		sendWASM(this.workers)
		this.workersChunkCount = new Array(this.workers.length).fill(0)
		this.workersTickPromisesResolve = []
		this.workersTickPromises = []
	}
	#workerOnMessage(id){
		return e => {
			const pkt = e.data
			switch(pkt.type){
				case "doneTick":
					this.workersTickPromisesResolve[id]()
					break
				case "chunkUpdate":
					this.players.get(pkt.id).connection.send(pkt,[pkt.data.buffer])
					break
				case "chunkUpdatesEnd":
					this.players.get(pkt.id).chunkUpdatesEndPromisesResolve[id]()
					break
				case "wasmModuleInitialized":
					this.workersWasmModuleInitializedPromisesResolve[id]()
					break
				default:
					throw new Error("unknown "+pkt.type)
			}
		}
	}
	/**@returns {Chunk=} */
	getChunk(x,y,z){
		return this.chunks.get(`${floor(x) >> this.chunkBits},${floor(y) >> this.chunkBits},${floor(z) >> this.chunkBits}`)
	}
	/**@returns {Chunk} */
	requireChunk(x,y,z){
		const k = `${floor(x) >> this.chunkBits},${floor(y) >> this.chunkBits},${floor(z) >> this.chunkBits}`
		let c = this.chunks.get(k)
		if(!c){
			c = new Chunk(this, floor(x)&(~this.chunkPosMask), floor(y)&(~this.chunkPosMask), floor(z)&(~this.chunkPosMask))
			this.chunks.set(k,c)
		}
		return c
	}
	//#chooseWTempCounts = []
	chooseW(x,y,z){
		let maxChunks = 0, minChunks = Infinity
		for(let i=0; i<this.workers.length; i++){
			if(this.workersChunkCount[i]>maxChunks) maxChunks = this.workersChunkCount[i]
			if(this.workersChunkCount[i]<minChunks) minChunks = this.workersChunkCount[i]
		}
		if(maxChunks === minChunks) maxChunks++
		let tempCount = []
		tempCount.length = this.workers.length
		tempCount.fill(0)
		for(let cx=-this.chunkSize; cx<=this.chunkSize; cx+=this.chunkSize) for(let cy=-this.chunkSize; cy<=this.chunkSize; cy+=this.chunkSize) for(let cz=-this.chunkSize; cz<=this.chunkSize; cz+=this.chunkSize){
			let chunk = this.getChunk(x+cx,y+cy,z+cz)
			if(chunk) tempCount[chunk.wId]++
		}
		let bestW = -1, bestWCount = -1
		for(let i=0; i<tempCount.length; i++){
			if(tempCount[i]>bestWCount && this.workersChunkCount[i]<maxChunks){
				bestWCount = tempCount[i]
				bestW = i
			}
		}
		return bestW
	}
	#unloadChunksP(p){
		const prevLoadWidth = p.loadWidth || 0
		const pOffsetX = p.offsetX||0
		const pOffsetY = p.offsetY||0
		const pOffsetZ = p.offsetZ||0
		for(let cx=0; cx<prevLoadWidth; cx++) for(let cy=0; cy<prevLoadWidth; cy++) for(let cz=0; cz<prevLoadWidth; cz++){
			//unload old chunks
			const cxm = (cx+pOffsetX)<<this.chunkBits, cym = (cy+pOffsetY)<<this.chunkBits, czm = (cz+pOffsetZ)<<this.chunkBits
			const chunk = this.getChunk(cxm,cym,czm)
			if(chunk){
				chunk.removeLoadedPlayer(p)
				if(!chunk.loadedPlayers.size) this.loadedChunks.delete(chunk)
			}
		}
	}
	async tick(tickEndTime){
		if(this.toInit) return //not done initializing
		for(let [pId,p] of this.players){
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
					for(let w of this.workers) w.postMessage({type:"playerChunkPos",x:p.offsetX<<this.chunkBits,y:p.offsetY<<this.chunkBits,z:p.offsetZ<<this.chunkBits,id:p.id})
					const loadWidth = p.loadWidth = loadDist*2+1
					for(let cx=0; cx<prevLoadWidth; cx++) for(let cy=0; cy<prevLoadWidth; cy++) for(let cz=0; cz<prevLoadWidth; cz++){
						//unload old chunks
						const cxm = (cx+pOffsetX)<<this.chunkBits, cym = (cy+pOffsetY)<<this.chunkBits, czm = (cz+pOffsetZ)<<this.chunkBits
						const chunk = this.getChunk(cxm,cym,czm)
						if(chunk && (max(cx-offsetXChange,cy-offsetYChange,cz-offsetZChange)>=loadWidth || min(cx-offsetXChange,cy-offsetYChange,cz-offsetZChange)<0)){
							chunk.removeLoadedPlayer(p)
							if(!chunk.loadedPlayers.size) this.loadedChunks.delete(chunk)
						}
					}
					//let chunkGenI = 0
					for(let cx=0; cx<loadWidth; cx++) for(let cy=0; cy<loadWidth; cy++) for(let cz=0; cz<loadWidth; cz++){
						//load new chunks
						const cxm = (cx+offsetX)<<this.chunkBits, cym = (cy+offsetY)<<this.chunkBits, czm = (cz+offsetZ)<<this.chunkBits
						const chunk = this.requireChunk(cxm,cym,czm)
						if(max(cx+offsetXChange,cy+offsetYChange,cz+offsetZChange)>=prevLoadWidth || min(cx+offsetXChange,cy+offsetYChange,cz+offsetZChange)<0){
							//p.updates.push(cxm,cym,czm,this.chunkBits-1,chunk.tree)
							if(!chunk.loadedPlayers.size) this.loadedChunks.add(chunk)
							chunk.addLoadedPlayer(p)
						}
						//if(!chunk.generated) p.chunkGenQueue[chunkGenI++] = chunk
					}
					sortChunks.argsP = p
					//p.chunkGenQueue.sort(sortChunks)
				}
			}
		}
		this.tickMsgVer = this.tickMsgVer?0:1
		for(let i=0; i<this.workers.length; i++){
			this.workersTickPromises[i] = new Promise(resolve => this.workersTickPromisesResolve[i] = resolve)
			this.workers[i].postMessage({type:"tick",tickMsgVer:this.tickMsgVer, tickEndTime})
		}
		await Promise.all(this.workersTickPromises)
	}
	async addPlayer(c){
		if(this.waitInit) await this.waitInit
		let p = {connection:c,id:generateID(),entity:null,updates:[],chunkUpdatesEndPromisesResolve:[]}
		this.players.set(p.id,p)
		for(let i=0; i<this.workers.length; i++){
			this.workers[i].postMessage({type:"addPlayer",id:p.id})
		}
		c.addEventListener("message", e => {
			const pkt = e.data
			switch(pkt.type){
				case "pos":
					p.x = pkt.x
					p.y = pkt.y
					p.z = pkt.z
					p.loadDist = pkt.loadDist
					c.send({type:"canSendPos"})
				case "canSendChunkUpdates":
					let promises = []
					for(let i=0; i<this.workers.length; i++){
						promises.push(new Promise(resolve => p.chunkUpdatesEndPromisesResolve[i] = resolve))
						this.workers[i].postMessage({type:"canSendChunkUpdates",id:p.id})
					}
					Promise.all(promises).then(() => c.send("chunkUpdatesEnd"))
					break
			}
		})
		c.addEventListener("close", () => {
			this.players.delete(p.id)
			this.#unloadChunksP(p)
			for(let i=0; i<this.workers.length; i++){
				this.workers[i].postMessage({type:"removePlayer",id:p.id})
			}
		})
		c.send({type:"worldInfo",chunkSize:this.chunkSize,chunkBits:this.chunkBits, partTextures: this.partTypes.map(r => r.texture)})
	}
	async close(){
		if(this.waitInit) await this.waitInit
		for(let i=0; i<this.players.length; i++){
			this.players[i].connection.close()
		}
		for(let i=0; i<this.workers.length; i++){
			//this.workers[i].postMessage({type:"close"})
			this.workers[i].terminate()
		}
	}
}
serverExports.ServerWorld = ServerWorld

/**decompress from https://dev.to/lucasdamianjohnson/compress-decompress-an-arraybuffer-client-side-in-js-2nf6*/
async function decompress(e,t){const n=new DecompressionStream(e),r=n.writable.getWriter();r.write(t),r.close();const o=[],s=n.readable.getReader();let a=0;for(;;){const{value:e,done:t}=await s.read();if(t)break;o.push(e),a+=e.byteLength}const c=new Uint8Array(a);let i=0;for(const e of o)c.set(e,i),i+=e.byteLength;return(new TextDecoder).decode(c)}
async function compress(e,t){const n=new CompressionStream(e),r=n.writable.getWriter();r.write((new TextEncoder).encode(t)),r.close();const o=[],s=n.readable.getReader();let a=0;for(;;){const{value:e,done:t}=await s.read();if(t)break;o.push(e),a+=e.byteLength}const c=new Uint8Array(a);let i=0;for(const e of o)c.set(e,i),i+=e.byteLength;return c}
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
function arrtoa() {
	let str = ""
	for (let i = 0; i < this.length; i++) {
		str += String.fromCharCode(this[i])
	}
	return btoa(str)
}
function atoarr(data){
	let bytes = atob(data)
	let arr = new Uint8Array(bytes.length)
	for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
	return arr
}

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
const generateID = () => "" + Date.now().toString(36) + (Math.random() * 1000000 | 0).toString(36)
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
"use strict"
const {round,floor,ceil,abs,max,min,sqrt,PI,random} = Math
let wasmStuff, wasmFuncs, wasmMemory, wasmMemoryUint32
function updateWasmMemory(){
	if(!wasmMemory || wasmMemory.buffer !== wasmFuncs.memory.buffer){
		wasmMemory = new Uint8Array(wasmFuncs.memory.buffer)
		wasmMemoryUint32 = new Uint32Array(wasmFuncs.memory.buffer)
	}
}
function wasmCreateString(str){
	let arr = new TextEncoder().encode(str)
	let p = wasmFuncs.allocString(arr.length)
	updateWasmMemory()
	wasmMemory.set(arr, p)
	return p
}
function wasmCreateByteArray(arr){// remember to delete allocated things
	let ba=wasmFuncs.byteArrayAlloc(arr.length*0.25)
	updateWasmMemory()
	wasmMemory.set(arr,wasmFuncs.byteArrayData(ba))
	return ba
}
onmessage = e => {
	if(e.data.worldInfo) initWorld(e)
	else throw new Error("worldInfo must be first")
}
/** The random function are copied from the processing.js source code */
function createXxHash(seed = Math.random() * 2100000000 | 0){
	const PRIME32_2 = 1883677709;
	const PRIME32_3 = 2034071983;
	const PRIME32_4 = 668265263;
	const PRIME32_5 = 374761393;

	const { imul } = Math;

	return {
		hash(x, y){
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
		},
		hash3(x, y, z){
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
		},
		hash3Int(x, y, z){
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
	
			return h32;
		}
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

class ArrayReader{
	#idx = 0
	#arr
	constructor(arr){
		this.#arr = arr
	}
	read(){
		return this.#arr[this.#idx++]
	}
	readMany(n){
		const pidx = this.#idx
		this.#idx+=n
		return this.#arr.slice(pdix, this.#idx)
	}
	get next(){
		return this.#arr[this.#idx]
	}
}
	/*readUint8(){
		return this.#arr[this.#idx++]
	}
	readUint32(){
		return this.#arr[this.#idx++]|this.#arr[this.#idx++]<<8|this.#arr[this.#idx++]<<16|this.#arr[this.#idx++]<<24
	}
	writeUint8(a){
		this.#arr[this.#idx++] = a
	}
	writeUint32(a){
		this.#arr[this.#idx++] = a&255
		this.#arr[this.#idx++] = (a>>>8)&255
		this.#arr[this.#idx++] = (a>>>16)&255
		this.#arr[this.#idx++] = (a>>>24)
	}
	get nextUint8(){
		return this.#arr[this.#idx]
	}*/
function yieldThread(){
	return new Promise(resolve => setTimeout(resolve, 0))
}
function initWorld(e){
const {
	otherC, wId:thisWId,
	worldInfo:{
		chunkBits,chunkSize,chunkPosMask,
		partTypes,partIds
	}
} = e.data
let worldPtr
function initWasmModule(wasmModule){
	WebAssembly.instantiate(wasmModule,{
		wasi_snapshot_preview1:{
			proc_exit:()=>{throw new Error("import not defined")},
			fd_close:()=>{throw new Error("import not defined")},
			fd_write:()=>{throw new Error("import not defined")},
			fd_seek:()=>{throw new Error("import not defined")},
			fd_read:()=>{throw new Error("import not defined")}
		},
		env:{
			_throw:ptr=>{
				ptr = wasmMemoryUint32[ptr/4+1]
				let str = ""
				while(wasmMemory[ptr]){
					str+=String.fromCharCode(wasmMemory[ptr++])
				}
				throw new Error("from wasm: "+str)
			},
			printy:(ptr,objectify)=>{
				updateWasmMemory()
				let str='',i=ptr
				while(wasmMemory[i]){
					str+=String.fromCharCode(wasmMemory[i++])
				}
				if(objectify)str=eval("("+str+")")
				console.log(str)
			},
			getNow:Date.now,
			emscripten_notify_memory_growth:x=>{},
			externYieldThread: hptr => {
				yieldThread().then(() => wasmFuncs.externYieldThreadDone(hptr))
			},
			clientSendChunkUpdatesData:(world,cptr,begin,end,x,y,z)=>{
				updateWasmMemory()
				const p = ptrClients.get(cptr)
				let arr = new Uint32Array(wasmMemory.slice(begin,end).buffer)
				postMessage({type:"chunkUpdate",data:arr,id:p.id,x,y,z},[arr.buffer])
			},
			externSyncSend:(world,toW,x,y,z,typecode,ab,ae,bb,be)=>{
				updateWasmMemory()
				let a=wasmMemory.slice(ab,ae),b=wasmMemory.slice(bb,be)
				otherC[toW].postMessage({a,b,x,y,z,typecode,tickMsgVer},[a.buffer,b.buffer])
			},
			noOpt:x=>globalThis.noOptX=x
		}
	}).then(instance => {
		wasmStuff = instance
		wasmFuncs = instance.exports

		wasmFuncs._initialize()

		/*let attrArr = wasmFuncs.attrArrCreate()
		for(let attr in attrTypes){
			wasmFuncs.attrArrAdd(attrArr,wasmCreateString(attr),attrTypes[attr].size)
		}*/
		let parttTypesArr = wasmFuncs.partTypesArrCreate()
		for(let pt of partTypes){
			wasmFuncs.partTypesArrAdd(parttTypesArr,pt.solid,pt.windBlow,pt.color)
		}
		worldPtr = wasmFuncs.worldNew(chunkBits,otherC.length,thisWId,parttTypesArr)
	})
}
const players = new Map(), ptrClients = new Map()
const tickMsgVerWaits = []
let tickMsgVer
onmessage = function(e){
	const pkt = e.data
	switch(pkt.type){
		case "wasmModule":
			initWasmModule(pkt.wasmModule)
			postMessage({type:"wasmModuleInitialized"})
			break
		case "assignChunk":
			wasmFuncs.worldChunkNew(worldPtr,pkt.x,pkt.y,pkt.z,pkt.ownerId)
			if(pkt.ownerId === thisWId){
				if(curGeneratingChunk){
					curGeneratingChunk.then(() => {
						curGeneratingChunk = generateChunk(pkt.x,pkt.y,pkt.z)
					})
				}else curGeneratingChunk = generateChunk(pkt.x,pkt.y,pkt.z)
			}
			break
		case "tick":
			tickMsgVer = pkt.tickMsgVer
			wasmFuncs.worldTick(worldPtr, pkt.tickEndTime)
			if(tickMsgVerWaits[pkt.tickMsgVer]){
				for(let i=0;i<tickMsgVerWaits[pkt.tickMsgVer];i++) tickMsgVerWaits[pkt.tickMsgVer][i]()
				tickMsgVerWaits[pkt.tickMsgVer] = null
			}
			for(let [pId,p] of players){
				if(p.canSendChunkUpdates){
					wasmFuncs.clientSendChunkUpdates(worldPtr,p.ptr)
					postMessage({type:"chunkUpdatesEnd",id:p.id})
					p.canSendChunkUpdates = false
				}
			}
			//if((self.we=(self.we||0)+1) % 20 === 0)console.log(wasmMemory.length)//console.log(wasmFuncs.allocdslen());
			postMessage({type:"doneTick"})
			break
		case "addLoadedPlayer":{
			wasmFuncs.chunkAddClient(worldPtr,pkt.x,pkt.y,pkt.z,players.get(pkt.id).ptr)
			break
		}
		case "removeLoadedPlayer":{
			wasmFuncs.chunkRemoveClient(worldPtr,pkt.x,pkt.y,pkt.z,players.get(pkt.id).ptr)
			break
		}
		case "canSendChunkUpdates":
			players.get(pkt.id).canSendChunkUpdates = true
			break
		case "addPlayer":{
			const p = {id:pkt.id,canSendChunkUpdates:false, ptr:wasmFuncs.clientNew()}
			players.set(pkt.id,p)
			ptrClients.set(p.ptr,p)
			break
		}
		case "removePlayer":{
			const p = players.get(pkt.id).ptr
			wasmFuncs.clientDelete(p)
			players.delete(pkt.id)
			ptrClients.delete(p.ptr)
			break
		}
		case "playerChunkPos":
			wasmFuncs.clientSetChunkPos(ptrClients.get(pkt.id),pkt.x,pkt.y,pkt.z)
			break
		/*case "close":
			wasmFuncs.worldDelete(worldPtr)
			for(let [id,p] of players){
				wasmFuncs.clientDelete(p)
			}
			break*/
		default:
			throw new Error("unknown "+pkt.type)
	}
}
for(let i=0; i<otherC.length; i++){
	if(i === thisWId) continue
	const wId = i
	otherC[wId].onmessage = async function(e){
		const pkt = e.data
		if(pkt.tickMsgVer !== tickMsgVer){
			await new Promise(resolve => {
				(tickMsgVerWaits[tickMsgVer] || (tickMsgVerWaits[tickMsgVer] = [])).push(resolve)
			})
		}
		wasmFuncs.externSyncRecieve(worldPtr,pkt.x,pkt.y,pkt.z,pkt.typecode,wasmCreateByteArray(pkt.a),wasmCreateByteArray(pkt.b))
	}
}

const seed = 1
const noises = SimplexNoise(Marsaglia.prototype.nextDouble.bind(new Marsaglia(seed)))
const hashes = createXxHash(seed)
function idxInC(x,y,z){
	return (x<<chunkBits | y)<<chunkBits | z
}
let curGeneratingChunk = null
async function generateChunk(x,y,z){if(abs(x)>0/*&&x!==256*/||abs(y)>0||abs(z)>0)return//todo
	console.log("gen in "+thisWId+" "+x+","+y+","+z)
	let ptr = wasmFuncs.worldTerrainAlloc(worldPtr)
	updateWasmMemory()
	const adjPtr = ptr/4, ptrEnd = ptr+chunkSize*chunkSize*chunkSize
	/*arr[ 0 *chunkSize*chunkSize+ 0 *chunkSize+ 0 ]=2
	arr[ 0 *chunkSize*chunkSize+ 0 *chunkSize+ 1 ]=2
	arr[ 0 *chunkSize*chunkSize+ 1 *chunkSize+ 0 ]=2
	arr[ 0 *chunkSize*chunkSize+ 1 *chunkSize+ 1 ]=2
	arr[ 1 *chunkSize*chunkSize+ 0 *chunkSize+ 0 ]=2
	arr[ 1 *chunkSize*chunkSize+ 0 *chunkSize+ 1 ]=2
	arr[ 1 *chunkSize*chunkSize+ 1 *chunkSize+ 0 ]=2
	arr[ 1 *chunkSize*chunkSize+ 1 *chunkSize+ 1 ]=2*/
	//console.time("terrain gen")
	const addHeight = (0*4)*chunkSize-y
	const scale = 1/chunkSize*0.25
	if(addHeight*scale>=-1 || addHeight<=0){
		wasmMemoryUint32.fill(partIds.air,adjPtr,ptrEnd)
		const noise = noises.noise2D
		const width = chunkSize
		for(let x2=0; x2<width; x2++){
			updateWasmMemory()
			for(let z2=0; z2<width; z2++){
				const h = round(noise((x2+x)*scale,(z2+z)*scale)*chunkSize+addHeight)
				for(let y2=0; y2<min(h,chunkSize); y2++){
					wasmMemoryUint32[adjPtr+idxInC(x2,y2,z2)] = partIds.stone
				}
				if(!(x2%2) && !(z2%2) && h<chunkSize){//0 10 40 80 120 160
					const col = hashes.hash3Int(x2+x,h+y,z2+z)&7
					wasmMemoryUint32[adjPtr+idxInC(x2,h,z2)] = partIds.grass | 0<<29 | col<<16
					wasmMemoryUint32[adjPtr+idxInC(x2,h+1,z2)] = partIds.grass | 1<<29 | col<<16
					wasmMemoryUint32[adjPtr+idxInC(x2,h+2,z2)] = partIds.grass | 2<<29 | col<<16
					wasmMemoryUint32[adjPtr+idxInC(x2,h+3,z2)] = partIds.grass | 3<<29 | col<<16
					wasmMemoryUint32[adjPtr+idxInC(x2,h+4,z2)] = partIds.grass | 4<<29 | col<<16
					wasmMemoryUint32[adjPtr+idxInC(x2,h+5,z2)] = partIds.grass | 5<<29 | col<<16
				}
			}
			await yieldThread()
		}
	}else if(addHeight<0) wasmMemoryUint32.fill(partIds.stone,adjPtr,ptrEnd)
	else wasmMemoryUint32.fill(partIds.air,adjPtr,ptrEnd)
	//wasmMemoryUint32[adjPtr]=2//testt
	console.log("done gen "+x+","+y+","+z)
	wasmFuncs.worldTerrainLoad(worldPtr,ptr,x,y,z)
	//console.timeEnd("terrain gen")
	curGeneratingChunk = null
}
/*function generateChunk(x,y,z){if(x||y||z)return
	let ptr = wasmFuncs.worldTerrainAlloc(worldPtr)
	updateWasmMemory()
	let arr = new Uint32Array(wasmMemory.buffer,ptr,chunkSize*chunkSize*chunkSize)
	arr.fill(0)
	arr[0*256*256]=3
	wasmFuncs.worldTerrainLoad(worldPtr,ptr,x,y,z)
}*/

}
}//end worker code
}