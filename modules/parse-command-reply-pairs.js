import { truncateSync } from 'fs';
import Debug from './debug.js'
import { getDestHeaderDataFromPayloadAsObject } from './payload-helpers.js';
import { createDefferedPromise } from './promise-utils.js';

/**
 * const SerialPort = require('serialport')
 * const port = new SerialPort('/dev/ttyUSB0')
 * @returns 
 */
 export const OnCCTalkCommandPairResponse = () => {
    //let writeLock = false;
    /** @type {*} */
    let task = null;

    /** @type {NodeJS.Timeout} */
    let currentTimeout;
    /*
    const startTimeout = () => currentTimeout = setTimeout(() => {
        //writeLock = false
        task.reject({ 
            err: 'timeoutAfter200ms',
            task
        })
    }, 200)
    */
    /**
     * This Parser Tracks state of read and write events
     * and asserts the replys to the writePromises.
     * @param {*} message 
     * @returns 
     */
     const onCCTalkCommandPairResponse = message => {
        const messageAsUint8Array = Uint8Array.from(message);
        if(task && task.id === `${messageAsUint8Array}`) {
            // Start Thicking
            //startTimeout();
            task.setTimeout(100);
            return
        }

        if(task && task.id !== `${messageAsUint8Array}`) {

            // @ts-ignore
            const messageObject = getDestHeaderDataFromPayloadAsObject(messageAsUint8Array); 
            const isForMasterOrBus = messageObject.dest === 1 || messageObject.dest === 0

            if(isForMasterOrBus) {       
                Debug('esnext-cctalk/node/connection/parser/onData/completPair/isForMaster/debug')('completPair',task.id, `${messageAsUint8Array}`)
                clearTimeout(currentTimeout)
                // @ts-ignore
                task.resolve(messageAsUint8Array);
                Debug('esnext-cctalk/node/connection/parser/onData/completPair/isForMaster/debug')('completPair', `${task}`)
                
                //writeLock = false;
                return 
            }
            
            // Note task stays the same if less then 2 commands got send
            Debug('esnext-cctalk/parse-command-reply-pairs/onCCTalkCommandPairResponse/isNotForMaster/debug')({ messageAsUint8Array: `${messageAsUint8Array}` })
        } 
        if(task && task.id !== `${messageAsUint8Array}`) {
            // we got no promise but we got data we need to error and exit  
            Debug('esnext-cctalk/parse-command-reply-pairs/onCCTalkCommandPairResponse/messageWithoutTask/error?')( `${messageAsUint8Array}`, task.id ) 
            return
        }
        // is most time then our own message
     }

    // @ts-ignore
    const CreateCCTalkRequest = portToWrite => 
        // cctalkRequest
        /** @param {Uint8Array} input */
        async input => {
            if (task && task.isPending) {
                Debug('writeLock')({ err: 'writeLock', task: `${task}`, input })
                return Promise.reject('writeLock')
            }
            
            // @ts-ignore
            const defferedcommandPromise = createDefferedPromise(`${input}`);
           
            task = defferedcommandPromise;
            task.setTimeout(100);   
            
            portToWrite.write(input, (/** @type {any} */ err) => {
                if(err) { task.reject(err) } 
                
            });

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