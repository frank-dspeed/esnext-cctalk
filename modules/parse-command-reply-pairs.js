import Debug from './debug.js'
import { getDestHeaderDataFromPayloadAsObject } from './payload-helpers.js';
import { delayResolvePromise } from './promises-delayed.js';
import { createDefferedPromise } from './queryable-deffered-promises.js';
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

    /**
     * This Parser Tracks state of read and write events
     * and asserts the replys to the writePromises.
     * @param {*} message 
     * @returns 
     */
     const onCCTalkCommandPairResponse = message => {
        const messageAsUint8Array = Uint8Array.from(message);
        if(task && task.id !== `${messageAsUint8Array}`) {
            //Debug('PROMISE')(task)

            // Note task stays the same if less then 2 commands got send

            Debug('esnext-cctalk/parse-command-reply-pairs/onCCTalkCommandPairResponse/task/debug')({ messageAsUint8Array })

            
            //Debug('tasks')({ tasks, messageAsUint8Array})


            // @ts-ignore
            const messageObject = getDestHeaderDataFromPayloadAsObject(messageAsUint8Array); 
            const isForMasterOrBus = messageObject.dest === 1 || messageObject.dest === 0

            if(isForMasterOrBus) {       
                Debug('esnext-cctalk/node/connection/parser/onData/completPair/isForMasterdebug/debug')('completPair')

                // @ts-ignore
                task.resolve(messageAsUint8Array)
                writeLock = false;
                return 
            }
            

        } 
        if(task && task.id !== `${messageAsUint8Array}`) {
            // we got no promise but we got data we need to error and exit  
            Debug('esnext-cctalk/parse-command-reply-pairs/onCCTalkCommandPairResponse/messageWithoutTask/error?')({ messageAsUint8Array }) 
            return
        }
        // is most time then our own message
     }

    // @ts-ignore
    const CreateCCTalkRequest = portToWrite => 
        // cctalkRequest
        /** @param {Uint8Array} input */
        async input => {
            if (writeLock && task && task.isPending) {
                // Only Apply writeLock if isPending
                return Promise.reject({ err: 'writeLock', task, input })
            }
            
            // @ts-ignore
            const defferedcommandPromise = createDefferedPromise(`${input}`);
            
            writeLock = true;
            // Try positioning the task assignment inside the writePromise could leed
            // to a more solid result
            task = defferedcommandPromise;
            
            await delayResolvePromise(850);

            portToWrite.write(input, err => {
                if(err) { task.reject({err, task }) } 
            });

            setTimeout(() => {
                task.reject({ 
                    err: 'timeoutAfter650ms',
                    task
                })
            }, 650)
            /*
            // @ts-ignore
            const writePromise = Promise.race([
                new Promise((resolve,reject)=> {
                    Debug('esnext-cctalk/node/connection/CreateCCTalkRequest/debug')({ 
                        /** @type {Uint8Array} *
                        input
                    })
                    // @ts-ignore
                    portToWrite.write(input, async err => {
                        if(err) { reject(err) } 
    
                        resolve(defferedcommandPromise)

                    });
                }),
                // Timeout is expected to get canceled by race
                new Promise(resolve=>{
                        setTimeout(() => {

                            //resolve(Promise.reject({ err, input, commandPromiseStatus }))
                            resolve(true);
                                                        
                        }, 650)
                }).then(()=>{
                    // CleanUp and throw
                    const err = 'timeout650ms'
                            
                    // @ts-ignore
                    defferedcommandPromise.reject({ err, input })
                    Debug('esnext-cctalk/node/connection/CreateCCTalkRequest/error')({ err, input, defferedcommandPromise })
                    throw new Error(JSON.stringify({ err, input, defferedcommandPromise }))
                })
            ])
            */
            return await task;

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