const NoOpDebug = () => () => { /** */ };
const isNode = (typeof process !== 'undefined' && process.env);

/** @param {*} message */
const debugConsoleLog = message => 
    /** @param {*} msg */
    (...msg) => console.log(message,...msg)

const tryGetNpmDebugElseDebugLog = () => import('debug')
    .then(m=>m.default)
    .catch(e=>debugConsoleLog)

/** @param {*} msg */
const dbgLog = msg => 
    /** @param  {...any} args */    
    (...args) => {
        tryGetNpmDebugElseDebugLog()
            .then( D => D(msg)(...args) )
}

/**
 * Conditional Debug
 * @param {string} msg
 */
export const conditionalDebug = msg => {
    
    if (isNode) {
        const { DEBUG, NODE_ENV } = process.env;
        if (DEBUG) { return dbgLog; };
        if (NODE_ENV === 'production') { return NoOpDebug };
        return debugConsoleLog;
    }

    return NoOpDebug
}
//export default Debug;

// Using TLA Node > 14.8 So Resolving this at runtime
export const Debug = await (async ()=>{

    if (isNode) {
        const { DEBUG, NODE_ENV } = process.env;
        if (DEBUG) { return await tryGetNpmDebugElseDebugLog(); }
        if (NODE_ENV === 'production') { return NoOpDebug; }
        return debugConsoleLog;
    }

    return NoOpDebug;

})();

export default Debug;