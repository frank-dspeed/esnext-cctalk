import Debug from './debug.js'
import { getCommandPromiseMethods } from './promise-utils.js';

export const OnCCTalkCommandPairResponse = getCommandPromiseMethods;

const additionalParserLogic = () => {
    /*
    if(messageObject.command === 0){
        console.log('resolve')
        resolve(messageAsUint8Array);
        console.log(Promise.allSettled([task]))
    } else {
        console.log('reso')
        reject(messageAsUint8Array);
        console.log(Promise.allSettled([task])) 
    } 
    
    if (lastInput.toString() === messageAsUint8Array.toString()) {
        console.log('ECHO',message)
        return
    } else {          
        const isbufferReadingCommand = (messageObject.command === 229 || messageObject.command === 0)
        if (!isbufferReadingCommand) {
            // Log everything that is not Buffer Reading
            Debug('esnext-cctalk/node/connection/parser/onData')({messageObject})
        } else {
            Debug('esnext-cctalk/node/connection/parser/onData/debug')({messageObject})
        }
        reject(messageAsUint8Array);
        return
    }
    */
}