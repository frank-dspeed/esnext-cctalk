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

export const getCCTalkCommandPromiseHandler = scope => {
    /**
     * This Parser Tracks state of read and write events
     * and asserts the replys to the writePromises.
     * @param {*} message 
     * @returns 
     */
    return message => {
        const messageAsUint8Array = Uint8Array.from(message);
        if(scope.task && scope.task.id === `${messageAsUint8Array}`) {
            // Start Thicking
            //startTimeout();
            scope.task.setTimeout(100);
            return
        }

        if(scope.task && scope.task.id !== `${messageAsUint8Array}`) {

            const isForMasterOrBus = messageAsUint8Array[0] === 1 || messageAsUint8Array[0] === 0

            if(isForMasterOrBus) {       
                Debug('esnext-cctalk/cctalkCommandPromiseHandler/isForMaster/debug')('completPair',scope.task.id, `${messageAsUint8Array}`);
                scope.task.resolve(messageAsUint8Array);
                Debug('esnext-cctalk/cctalkCommandPromiseHandler/isForMaster/debug')('completPair', `${scope.task}`)
                
                //writeLock = false;
                return 
            }
            
            // Note scope.task stays the same if less then 2 commands got send
            Debug('esnext-cctalk/cctalkCommandPromiseHandler/isNotForMaster/debug')({ messageAsUint8Array: `${messageAsUint8Array}` })
        } 

        if(scope.task && scope.task.id !== `${messageAsUint8Array}`) {
            // we got no promise but we got data we need to error and exit  
            Debug('esnext-cctalk/cctalkCommandPromiseHandler/messageWithoutTask/error?')( `${messageAsUint8Array}`, scope.task.id ) 
            return
        }
        // is most time then our own message
    }
}

export const getCreateCommandPromise = scope => {
    
    /** @param {Uint8Array} input */
    return async (input, write )=> {
        if (scope.task && scope.task.isPending) {
            Debug('writeLock')({ err: 'writeLock', task: `${scope.task}`, input })
            return Promise.reject('writeLock')
        }
                
        scope.task = createDefferedPromise(`${input}`);
        scope.task.setTimeout(100);   
        
        write(input, (/** @type {any} */ err) => {
            if(err) { scope.task.reject(err) }          
        });

        return await scope.task;

    }
}

export const getInitalCommandPromiseScope = () => {
    const scope = { task: createDefferedPromise(`inital`) }
    scope.task.resolve('init')
    return scope;    
}

/**
 * const SerialPort = require('serialport')
 * const port = new SerialPort('/dev/ttyUSB0')
 * @returns 
 */
 export const getCommandPromiseMethods = () => {

    const scope = getInitalCommandPromiseScope()
    
    const cctalkCommandPromiseHandler = getCCTalkCommandPromiseHandler(scope)
    const createCommandPromise = getCreateCommandPromise(scope)
    const getPortWritMethod = port => input => createCommandPromise(input,x=>port.write(x))
    return {
        cctalkCommandPromiseHandler,
        createCommandPromise,
        getPortWritMethod
    }

}
