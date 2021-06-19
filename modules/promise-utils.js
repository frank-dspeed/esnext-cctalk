// @ts-ignore
import Debug from "./debug.js";

//appendChain(Promise.resolve(())
/**
 * const chain = getPromiseChain()
 * const currentPromise = chain(Promise.resolve())
 * @returns 
 */
export const getPromiseChain = () => {
    let chain = Promise.resolve()
    // @ts-ignore
    return p => chain = chain.then(()=>p()).catch(()=>p());
}

export const delayResolvePromise = (ms=50) => new Promise(resolve => 
    setTimeout(resolve, ms)
);

export const delayRejectPromise = (ms = 50) => new Promise( resolve => 
    setTimeout( ()=> 
        resolve(Promise.reject(`timeout: ${ms}`)), ms
    )
);

//QueryAbleDefferedPromise
/**
 * 
 * @param {*} id 
 * @returns 
 */
export const createDefferedPromise = id => {    
    /**
     * The complete Triforce, or one or more components of the Triforce.
     * @typedef {Object} defferedPromise
     * @property {*} resolve - Indicates whether the Courage component is present.
     * @property {*} reject - Indicates whether the Courage component is present.
     * @property {boolean} isPending - Indicates whether the Courage component is present.
     * @property {boolean} isFulfilled - Indicates whether the Power component is present.
     * @property {boolean} isRejected - Indicates whether the Wisdom component is present.
     * @property {number} createdAt - epoch resolve reject call 
     * @property {number} settledAt - epoch resolve reject call
     * @property {number} settledAfter - epoch resolve reject call
     * @property {number|string} id - id
     * @property {*} value - Indicates whether the Wisdom component is present.
     * @property {*} reason - Indicates whether the Wisdom component is present.
     * @property {*} setTimeout - Indicates whether the Wisdom component is present.
     * @property {()=>{}} clearTimeout - Indicates whether the Wisdom component is present.
     * @property {NodeJS.Timeout} timeOut - Indicates whether the Wisdom component is present.
     */
    
    /** @type {defferedPromise} */
    let defferedPromise;
    const defferedHandlers = {}
    
    //@ts-ignore
    defferedPromise = new Promise( 
        ( resolve, reject ) =>
            Object.assign( defferedHandlers, {
                toString() {
                    const ref = defferedPromise;
                    delete ref.setTimeout
                    delete ref.clearTimeout
                    delete ref.resolve
                    delete ref.reject
                    ref.value = ref.value.join(',')
                    return JSON.stringify(ref)
                },
                setTimeout(ms=50) {
                    defferedPromise.clearTimeout();
                    defferedPromise.timeOut = setTimeout( () => {
                            const settledAfter = Date.now() - defferedPromise.createdAt
                            defferedPromise.reject(new Error(`
                            Timeout After ${ms} .settledAfter = ${settledAfter}    
                            `))
                        }, 
                        ms
                    )
                },
                clearTimeout() {
                    if (defferedPromise.timeOut) {
                        clearTimeout(defferedPromise.timeOut)
                    }
                },
                /** @param {*} value */
                resolve(value) {
                    if (defferedPromise.isPending) {
                        defferedPromise.clearTimeout();
                        //Debug('resolve:')({ value, id })                    
                        defferedPromise.isFulfilled = true;
                        defferedPromise.isPending = false;
                        defferedPromise.value = value;
                        defferedPromise.settledAt = Date.now();
                        defferedPromise.settledAfter = defferedPromise.settledAt - defferedPromise.createdAt;
                        resolve(value); 
                    }
                },
                
                /** @param {*} reason */
                reject(reason) {
                    if (defferedPromise.isPending) {
                        
                        defferedPromise.clearTimeout();
                        //Debug('reject:')({ reason, id })
                        defferedPromise.isRejected = true;
                        defferedPromise.isPending = false;
                        defferedPromise.reason = reason;
                        defferedPromise.settledAt = Date.now();
                        defferedPromise.settledAfter = Date.now();
                        reject(reason)
                    }
                },
                isPending: true,
                isRejected :false,
                isFulfilled :false,
                id,
                createdAt: Date.now(),
            }) 
    );
    
    Object.assign( defferedPromise, defferedHandlers );
    return defferedPromise;
}

//cancelableTryRetryPromise
/**
 * 
 * @param {*} fn 
 * @returns 
 */
 const call = fn => fn();
 /*
 const { 
     createCancelAbleTryAndRetryPromise, cancelTryAndRetry 
 } = CreateCancelAbleTryAndRetryPromise();
 
 //trys it unti it Rejects
 createCancelAbleTryAndRetryPromise(
     () => Promise.reject( 
         call( () => Debug('cancelAbleTryRetryPromise')('reject') ) 
     )
 , 100)
 
 setTimeout(()=>{
     cancelTryAndRetry()
 
 },500)
 */
 export const CreateCancelAbleTryAndRetryPromise = () => {
     let reject = false;
     let start = 0
     let start1 = 0
     let end = 0
     /**
      * 
      * @param {*} fn 
      * @param {number} ms 
      * @returns {Promise<Uint8Array>}
      */
     const createCancelAbleTryAndRetryPromise = async (fn, ms) => {
         start = Date.now()
         return delayResolvePromise(ms)
             .then(()=> {
                 if (!start1) {
                     start1 = Date.now()
                 }
                 if (reject) {
                     Debug('cancelAbleTryRetryPromise')(Date.now(),reject ? 'canceled' : 'try' )        
                     end = Date.now()
                     Debug('cancelAbleTryRetryPromise')('ending', { start, start1, end, diff: end - start1 })
                     return
                 }
                 Debug('cancelAbleTryRetryPromise')(Date.now(),'try' )
                 return fn();
             })
             .catch(()=>createCancelAbleTryAndRetryPromise(fn,ms));
     }
         
     
     const cancelTryAndRetry = () => reject = true
     
     return {
         cancelTryAndRetry, createCancelAbleTryAndRetryPromise
     }
 }
 /**
  * @type {(arrayOfFnReturnPromis)=>{[Symbol.asyncIterator]}}
  * @param {*} arrayAsyncFns 
  * @returns 
  */
  export const getAsyncIterableFromArrayOfAsyncFns = (arrayAsyncFns) => {
    let index = 0;
    const scope = { arrayAsyncFns }
    
    const next = async () => {
        const done = !(index in scope.arrayAsyncFns);
        if (done) { return { done }; }
        
        const nextFn = scope.arrayAsyncFns[index];
        const value = await nextFn();
        index += 1
        
        if (value) { return { value, done }; }
        return next();
        //every secund resolve with the next value
        return new Promise(
            resolve=>setTimeout(()=>resolve({ value, done }), 1000))
    }
    class AsyncIterableFromArrayOfAsyncFns {
        next() { return next(); }
        [Symbol.asyncIterator]() { return { next }; }	
    }
    return new AsyncIterableFromArrayOfAsyncFns()
}
/*
const detectDevices = async () => {
    const  arrayAsyncFns = [
        ()=> testAdr(40, 'crc8'),
        ()=> testAdr(2, 'crc8'),
        ()=> testAdr(40, 'crc16xmodem')
    ] 
	const iter = getAsyncIterableFromArrayOfAsyncFns(arrayAsyncFns)
	const devices = []
    for await (const value of iter) {
        devices.push(value)
	}
    return devices;
}
*/