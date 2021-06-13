import { delayResolvePromise } from './promises-delayed.js';
import Debug from './debug.js';

/**
 * 
 * @param {*} fn 
 * @returns 
 */
const call = fn => fn();

const CreateCancelAbleTryAndRetryPromise = () => {
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
