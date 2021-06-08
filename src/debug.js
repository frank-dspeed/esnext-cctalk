const NoOp = () => { /** */ };

/** @param {*} message */
const debugLog = message => 
    /** @param {*} msg */
    (...msg) => console.log(message,...msg)

/**
 * Conditional Debug
 * @param {string} msg
 */
export const Debug = msg => {
    const isNode = typeof process !== 'undefined' && process.env;
    let fn = () => NoOp;
    if (isNode) {
        
        const { DEBUG, NODE_ENV } = process.env;
        if (NODE_ENV === 'production') {
            return fn
        }
        
        // @ts-ignore
        return async (...args) => {
            if (fn === NoOp){
             
                // @ts-ignore
                fn = await import('debug').then(m=>m.default(msg)).catch(e=>debugLog(msg));
            }
            // @ts-ignore
            return fn(...args);
        }
    }
    return fn;
}
//export default Debug;

// Using TLA Node > 14.8
export const getDebug = await (async ()=>{
    const isNode = typeof process !== 'undefined' && process.env;
    if (isNode) {
        const { DEBUG, NODE_ENV } = process.env;
        if (NODE_ENV === 'production') {
            return () => NoOp
        }
        if (DEBUG) {
            return await import('debug').then(m=>m.default).catch(e=>debugLog);    
        }
        return debugLog;
    }
    return () => NoOp;
})();

export default getDebug;