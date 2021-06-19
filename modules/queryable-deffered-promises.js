import Debug from "./debug.js";

// @ts-nocheck
let dataId = 0
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




/*
const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);
const observAblePromise = fn => Promise.allSettled([fn()]).then(r=>r[0]);

let currentPromise = Promise.resolve();

let writeLock = true;

const writeState = [
//    "40,0,0,254,0",
//     "1,0,0,254,0",
//    "40,0,0,254,0",
//     "1,0,0,254,0",
]

const readState = [
//     "0,0,0,254,0",
//     "0,0,0,254,0",
//     "0,0,0,254,0",
//    "40,0,0,254,0",
//     "1,0,0,254,0",
//    "40,0,0,254,0",
//     "1,0,0,254,0",
]

const switchWriteLock = () => {
    
    if (!writeLock) {
        writeLock = true;
        setTimeout(()=> { 
            writeLock = false;
            // Resolve           
        })
    }
    return 
}

const port = {
    write: () => {
        // Triggers Read Evaluation for 50ms
        writeState.push(); // .toString()
    },
    on: () => {
        // Reads What got written
        readState.push([]) // .toString()
        dataId++
    }
}

const readUntilTimeout = createDefferedPromise();
// the .toString() makes the state compare able
const resolveState = state => {
    // Pair Reduce 
    
    writeState.forEach( (cctalkSended, writeStateIdx) => {
        
        const all = indexOfAll(readState, cctalkSended)
        /*
        const currentCCTalkTransaction = readState
            .indexOf(cctalkSended);
        
        if (currentCCTalkTransaction || currentCCTalkTransaction === 0) {
            console.log(currentCCTalkTransaction)
        };
        *    
    })
    

}

await observAblePromise(()=>writeState.push("40,0,0,254,0","1,0,0,254,0"))

writeState.push("40,0,0,254,0","1,0,0,254,0")
readState.push("40,0,0,254,0","1,0,0,254,0")
resolveState()

// Case 1 we send a write command and expect proper response in time
// We do not Accept a secund Write request what can happen?
// Case 1.1 We get the right response and fullFill
// Case 1.3 We get no response and timeout
// The following cases are bad
// Case 1.2 We get the right response and there comes additional data (so not really valid response eg: 253
// Case 1.4 We get somehow a command that got send by a device eg master to slave 

// Case 1.5 Not tested but expected we 
// We write to the port and wait 50ms if something came back 
    // if yes we wait again 50ms 
    // if not we resolve 
        // if there is data we resolve with that data and clean up 
        // if not reject timeout if nothing got resolved

// Case 1.6 If there is no waiting command we emit the data.
*/
export {}
