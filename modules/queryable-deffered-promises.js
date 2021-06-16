import Debug from "./debug.js";

// @ts-nocheck
let dataId = 0

export const createDefferedPromise = id => {    
    /** @type {Promise<Uint8Array>} */
    let defferedPromise;
    const defferedHandlers = {}
    
    defferedPromise = new Promise( 
        ( resolve, reject ) => Object.assign(
            defferedHandlers, {
                resolve(value) {
                    Debug('resolve:')({ value, id })
                    
                    defferedPromise.isFulfilled = true;
                    defferedPromise.isPending = false;
                    defferedPromise.value = value;
                    resolve(value); 
                },
                reject(reason) {
                    Debug('reject:')({ reason, id })
                    defferedPromise.isRejected = true;
                    defferedPromise.isPending = false;
                    defferedPromise.reason = reason;
                    reject(reason)
                }
            }
        ) 
    );
    
    const queryAbleDefferedPromise = createQuerablePromise(
        defferedPromise
    );
    Object.assign(
        defferedPromise,
        queryAbleDefferedPromise, 
        defferedHandlers, 
        { id, createdAt: Date.now() }
    );
    return defferedPromise;
}

/**
 * This function allow you to modify a JS Promise by adding some status properties.
 * Based on: http://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * But modified according to the specs of promises : https://promisesaplus.com/
 */
 const createQuerablePromise = promise => {
    
    if (promise.isResolved) { return promise; };

    // Set initial state
    // var isPending = true;
    // var isRejected = false;
    // var isFulfilled = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    var result = Object.assign( promise.then(
        value => {
            result.isFulfilled = true;
            result.isPending = false;
            result.value = value;
            return value; 
        }, 
        reason => {
            result.isRejected = true;
            result.isPending = false;
            result.reason = reason;
            //throw reason; 
        }
    ), { 
        isPending: true,
        isRejected :false,
        isFulfilled :false,
        // isFulfilled: () => { return isFulfilled; },
        // isPending: () => { return isPending; },
        // isRejected: () => { return isRejected; },
    } );

    return result;
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
