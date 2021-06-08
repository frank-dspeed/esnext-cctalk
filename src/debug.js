const NoOp = () => { /** */ };
/** @param {*} message */
const debugLog = message => 
    /** @param {*} msg */
    (...msg) => console.log(message,...msg)

/**
 * Conditional Debug
 * @param {string} msg
 */
const Debug = msg => {
    if (process?.env) {
        const { DEBUG, NODE_ENV } = process.env;
        if (NODE_ENV === 'production') {
            return NoOp;    
        }
        return import('debug').then(m=>m.default(msg)).catch(e=>debugLog(msg));
    }
}


