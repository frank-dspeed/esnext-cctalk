import Debug from './debug.js'
import { getDestHeaderDataFromPayloadAsObject } from './payload-helpers.js';
/**
 * const SerialPort = require('serialport')
 * const port = new SerialPort('/dev/ttyUSB0')
 * @returns 
 */
 export const OnCCTalkCommandPairResponse = () => {
    let writeLock = false;
    /** @type {*} */
    let task = null;

    /** type {Promise<Uint8Array>[]} */
    /** @type {*} */
    const tasks = [];

    // @ts-ignore
    /**
     * This Parser Tracks state of read and write events
     * and asserts the replys to the writePromises.
     * @param {*} message 
     * @returns 
     */
     const onCCTalkCommandPairResponse = message => {
        if(task) {
            //Debug('PROMISE')(task)
            const messageAsUint8Array = Uint8Array.from(message);  
            // Note task stays the same if less then 2 commands got send
            tasks.push({ task, messageAsUint8Array })
            Debug('esnext-cctalk/parse-command-reply-pairs/onCCTalkCommandPairResponse/task/debug')({ messageAsUint8Array })
            const completPair = tasks.length === 2;
            
            //Debug('tasks')({ tasks, messageAsUint8Array})
            if (completPair) {

                // @ts-ignore
                tasks.forEach( p =>{
                    Debug('onCCTalkCommandPairResponse/completPair')(p.task.input)          
                })
                const messageObject = getDestHeaderDataFromPayloadAsObject(messageAsUint8Array); 
                const isForMasterOrBus = messageObject.dest === 1 || messageObject.dest === 0

                if(isForMasterOrBus) {       
                    task = null;
                    Debug('esnext-cctalk/node/connection/parser/onData/completPair/isForMasterdebug/debug')('completPair')
                    const { task: processedPromise} = tasks.pop();
                    const { task: currentPromise } = tasks.pop();
                    // @ts-ignore
                    processedPromise.resolve(messageAsUint8Array);
                    currentPromise.resolve(messageAsUint8Array);
                    writeLock = false;
                    return 
                }
                
                
                // throw error here is something wrong.
                Debug('esnext-cctalk/node/connection/parser/onData/completPair/error')('!completPair')
                Debug('esnext-cctalk/node/connection/parser/onData/completPair/error')({ task, messageAsUint8Array })
                const totalPromises = tasks.length;
                console.log('XXXXX', { tasks, totalPromises })
                console.log('XXXXX', { totalPromises })
                tasks.splice(0,2);
                writeLock = false;
                //task = null;
                throw new Error('Maybe Something Wrong')
            }
        } 
        // we got no promise but we got data we need to error and exit  
        Debug('esnext-cctalk/parse-command-reply-pairs/onCCTalkCommandPairResponse/messageWithoutTask/error?')({ message }) 
     }

    // @ts-ignore
    const CreateCCTalkRequest = portToWrite => 
        // cctalkRequest
        /** @param {Uint8Array} input */
        async input => {
            
            if (writeLock) {
                return Promise.reject('writeLock')
            }
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
                        tasks.forEach ( (task, idx )=> {
                            if (task.task.input === input) {
                                tasks.splice(idx, 1);
                                writeLock = false;
                            }
                        } )                        
                        // @ts-ignore
                        resolve(Promise.reject(`timeout: ${command.input}`));
                    }, 200))
            ]).catch( err => {
                Debug('esnext-cctalk/node/connection/CreateCCTalkRequest/error')(err,{input})
                throw err;
            });
            Debug('esnext-cctalk/node/connection/CreateCCTalkRequest/debug')({input})
            Promise.resolve()
                .then(() => {
                    // @ts-ignore
                    task = command;
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

            writeLock = true;
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