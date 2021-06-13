import Debug from './debug.js'
import { getDestHeaderDataFromPayloadAsObject } from './payload-helpers.js';
/**
 * const SerialPort = require('serialport')
 * const port = new SerialPort('/dev/ttyUSB0')
 * @returns 
 */
 export const OnCCTalkCommandPairResponse = () => {

    /** @type {*} */
    let currentProcessingPromise = null;

    /** type {Promise<Uint8Array>[]} */
    /** @type {*} */
    const currentProcessingPromises = [];

    // @ts-ignore
    /**
     * This Parser Tracks state of read and write events
     * and asserts the replys to the writePromises.
     * @param {*} message 
     * @returns 
     */
     const onCCTalkCommandPairResponse = message => {
        if(currentProcessingPromise) {
            //Debug('PROMISE')(currentProcessingPromise)
            const messageAsUint8Array = Uint8Array.from(message);  
            // Note currentProcessingPromise stays the same if less then 2 commands got send
            currentProcessingPromises.push({ currentProcessingPromise, messageAsUint8Array })
            Debug('esnext-cctalk/node/connection/parser/onData/processingPromise/debug')({ messageAsUint8Array })
            const completPair = currentProcessingPromises.length === 2;
            
            // @ts-ignore
            currentProcessingPromises.forEach( p =>{
                Debug('currentProcessingPromises')(p.currentProcessingPromise)          
            })
            //Debug('currentProcessingPromises')({ currentProcessingPromises, messageAsUint8Array})
            if (completPair) {
                
                const messageObject = getDestHeaderDataFromPayloadAsObject(messageAsUint8Array); 
                const isForMasterOrBus = messageObject.dest === 1 || messageObject.dest === 0

                if(isForMasterOrBus) {       
                    currentProcessingPromise = null;
                    Debug('esnext-cctalk/node/connection/parser/onData/completPair/isForMasterdebug/debug')('completPair')
                    const { currentProcessingPromise: processedPromise} = currentProcessingPromises.pop();
                    const { currentProcessingPromise: currentPromise } = currentProcessingPromises.pop();
                    // @ts-ignore
                    processedPromise.resolve(messageAsUint8Array);
                    currentPromise.resolve(messageAsUint8Array);
                    return 
                }

                // throw error here is something wrong.
                Debug('esnext-cctalk/node/connection/parser/onData/completPair/error')('!completPair')
                Debug('esnext-cctalk/node/connection/parser/onData/completPair/error')({ currentProcessingPromise, messageAsUint8Array })
                throw new Error('Maybe Something Wrong')
            }
        } 
        // we got no promise but we got data we need to error and exit   
     }

    // @ts-ignore
    const CreateCCTalkRequest = portToWrite => 
        // cctalkRequest
        /** @param {Uint8Array} input */
        async input => {
            // @ts-ignore
            const command = {}
            const commandPromise = new Promise((resolve, reject) => {
                Object.assign(command, { resolve, reject, input })
            });
            command.commandPromise = commandPromise;
            const promise = Promise.race([
                commandPromise,
                new Promise((resolve) => 
                    // @ts-ignore
                    setTimeout(() => { 
                        // find the promise in current
                        // @ts-ignore
                        currentProcessingPromises.forEach ( (tasks, idx )=> {
                            if (tasks.currentProcessingPromise.input === input) {
                                currentProcessingPromises.splice(idx, 1);
                            }
                        } )                        
                        // @ts-ignore
                        resolve(Promise.reject(`timeout: ${command.input}`));
                    }, 800))
            ]).catch( err => {
                Debug('esnext-cctalk/node/connection/CreateCCTalkRequest/error')(err,{input})
                throw err;
            });
            Debug('esnext-cctalk/node/connection/CreateCCTalkRequest/debug')({input})
            Promise.resolve()
                .then(() => {
                    // @ts-ignore
                    currentProcessingPromise = command;
                    return new Promise((resolve,reject)=> {
                        Debug('esnext-cctalk/node/connection/CreateCCTalkRequest/debug')({ 
                            /** @type {Uint8Array} */ 
                            input
                        })
                        // @ts-ignore
                        portToWrite.write(command.input, err =>{
                            if(err) { reject(err) } 
                            resolve(true);    
                        });
                    });                
                });
            const totalPromises = currentProcessingPromises.length;
            console.log('XXXXX', { currentProcessingPromises, totalPromises })
            return promise;
    }
    
    return {
        onCCTalkCommandPairResponse,
        CreateCCTalkRequest
    }

}

const additionalParserLogic = () => {
    /*
    if(messageObject.command === 0){
        console.log('resolve')
        resolve(messageAsUint8Array);
        console.log(Promise.allSettled([currentProcessingPromise]))
    } else {
        console.log('reso')
        reject(messageAsUint8Array);
        console.log(Promise.allSettled([currentProcessingPromise])) 
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