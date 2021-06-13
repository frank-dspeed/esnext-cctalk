//import getDevices from 'esnext-cctalk/src/device-detection.js';
let i = 0;

/*
const tryPoll = write => delayPromise(1000).then(write(254).catch(()=>tryPoll(write)));
let promiseChain = Promise.resolve();
getDevices(async dev=>{
    console.log('Found', { dev })
    //if (i++ === 1) {
        // We have a perfect loop
        promiseChain = promiseChain
        .then()
        .then(()=> tryPoll(dev.write).then(x=>console.log('connected:',x, { dev })) ) 
        //
    //}
    
})
*/

const delayResolvePromise = ms => new Promise(resolve => 
    setTimeout(()=>resolve(), ms)
);

const delayRejectPromise = ms => new Promise( resolve => 
    setTimeout( ()=> 
        resolve(Promise.reject(`timeout: ${ms}`)), ms
    )
);

const call = fn => fn();

let reject = false;
let start = 0
let start1 = 0
let end = 0
/**
 * 
 * @param {*} fn 
 * @param {*} ms 
 * @returns {Promise<Uint8Array>}
 */
const cancelAbleTryAndRetry = async (fn, ms) => 
    delayResolvePromise(ms)
        .then(()=> {
            if (!start1) {
                start1 = Date.now()
            }
            if (reject) {
                console.log(Date.now(),reject ? 'canceled' : 'try' )        
                end = Date.now()
                console.log('ending', { start, start1, end, diff: end - start1 })
                return
            }
            console.log(Date.now(),'try' )
            return fn();
        })
        .catch(()=>cancelAbleTryAndRetry(fn));

const cancelTryAndRetry = () => reject = true

//trys it unti it Rejects
cancelAbleTryAndRetry(
    () => Promise.reject( 
        call( () => console.log('reject') ) 
    )
, 100)
start = Date.now()
setTimeout(()=>{
    cancelTryAndRetry()

},500)
