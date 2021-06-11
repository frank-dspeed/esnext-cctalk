import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import { OnCompletePayload } from './cctalk-parser.js';
import { getSendCommand, getMessage, CreatePayload, crcMethods } from './cctalk-crc.js';
import { Transform } from 'stream';
import Debug from './debug.js';
export const timeoutPromise = () => new Promise((resolve, reject)=>setTimeout(()=>reject('timeout'),50))

/**
 * 
 * Serial communication was derivated from RS232 standard.
It is low data rate NRZ (Non Return to Zero) asyncronous communication with:
Baud rate 9600, 1 start bit, 8 data bits, no parity, 1 stop bit.
RS232 handshaking signals (RTS, CTS, DTR, DCD, DSR) are not suported.
Mesage integrity is controled by means of checksum calculation. 
 */
export const NodeCCTalkConnection = () =>{
    /**
     * 
     */
}
export const NodeStreamParser = (maxDelayBetweenBytesMs = 50 ) => {
    const parser = OnCompletePayload(maxDelayBetweenBytesMs);
    /**
    * Parse the CCTalk protocol
    * @extends Transform
    * @summary A transform stream that emits CCTalk packets as they are received.
    * @example
       const SerialPort = require('serialport')
       const CCTalk = require('@serialport/parser-cctalk')
       const port = new SerialPort('/dev/ttyUSB0')
       const parser = port.pipe(new CCtalk())
       parser.on('data', Debug('esnext-cctalk::node'))
   */
   class NodeTransformStream extends Transform {
       /**
        * 
        * @param {Buffer} chunk 
        * @param {BufferEncoding} encoding
        * @param {*} cb 
        */
       _transform(chunk, encoding, cb) {
           parser._transform(chunk, (/** @type {Uint8ArrayType} */ payload) => this.push(payload));
           cb();
       }
   }
   return NodeTransformStream;
}

export const lazyNodeStreamParser = ( maxDelayBetweenBytesMs = 50 ) => {
    const parser = OnCompletePayload(maxDelayBetweenBytesMs);
    /*
    const CCTalkPayload = parser.buffers.pop();
    if (CCTalkPayload) {
        this.push(parser.buffers)
    }
    */
    //require('stream/promises')
    return import('stream').then( ({ Transform }) =>
        /**
         * Parse the CCTalk protocol
         * @extends Transform
         * @summary A transform stream that emits CCTalk packets as they are received.
         * @example
            const SerialPort = require('serialport')
            const CCTalk = require('@serialport/parser-cctalk')
            const port = new SerialPort('/dev/ttyUSB0')
            const parser = port.pipe(new CCtalk())
            parser.on('data', Debug('esnext-cctalk::node'))
        */
        class NodeTransformStream extends Transform {
            /**
             * 
             * @param {*} chunk 
             * @param {BufferEncoding} encoding
             * @param {*} cb 
             */
            _transform(chunk, encoding, cb) {
                parser._transform(chunk, this.push);
                cb();
            }
        }
    ).then( NodeTransformStream => new NodeTransformStream() );
}

/**
 * Async Promise Chain only for demo in production you will want to use a
 welll defined generator
 * @typedef {null|Promise<Uint8ArrayType>} defferedPromise
*/

/**
 * const SerialPort = require('serialport')
 * const port = new SerialPort('/dev/ttyUSB0')
 * @param {*} port 
 * @returns 
 */
export const getConnection = port => {
    const CCTalk = NodeStreamParser();
    const parser = port.pipe(new CCTalk());

    // State
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
     const onCCTalkResponse = message => {
        if(currentProcessingPromise) {
            Debug('PROMISE')(currentProcessingPromise)
            const messageAsUint8Array = Uint8Array.from(message);  
            // Note currentProcessingPromise stays the same if less then 2 commands got send
            currentProcessingPromises.push({ currentProcessingPromise, messageAsUint8Array })
            Debug('esnext-cctalk/node/connection/parser/onData/processingPromise/debug')({ messageAsUint8Array })
            const completPair = currentProcessingPromises.length === 2;
            currentProcessingPromises.forEach(p=>Debug('currentProcessingPromises')(p.messageAsUint8Array))
            //Debug('currentProcessingPromises')({ currentProcessingPromises, messageAsUint8Array})
            if (completPair) {
                currentProcessingPromise = null;
                const messageObject = getMessage(messageAsUint8Array); 
                const isForMasterOrBus = messageObject.dest === 1 || messageObject.dest === 0

                if(isForMasterOrBus) {       
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
            }
        } 
        // we got no promise but we got data we need to error and exit   
     }

    parser.on('data', onCCTalkResponse)

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
            const promise = Promise.race([
                commandPromise,
                new Promise((resolve) => 
                    // @ts-ignore
                    setTimeout(() => { resolve(Promise.reject(`timeout: ${command.input}`)) }, 15000))
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
            return promise;
    }
    
    return {
        write: CreateCCTalkRequest(port),
        parserWrite: CreateCCTalkRequest(parser),//CreateCCTalkRequestParser,
        port,
        parser,
        on: parser.on
    }

}    

export const getDeviceWriter = (
    /** @type {{ write: any; parserWrite?: (input: any) => Promise<any>; port?: any; parser?: any; }} */ 
    connection,/** 
    @type {any} */ 
    address,/** 
    @type {string | number} */ 
    methodName) => {
    if (typeof address !== 'number') {
        throw new Error(`TypeError address needs to be number got: ${typeof address}`)
    }
    if (typeof methodName !== 'string') {
        throw new Error(`TypeError methodName needs to be string got: ${typeof methodName}`)
    }
    const deviceSpec = { 
        // @ts-ignore
        src: 1, dest: address, crcSigningMethod: crcMethods[methodName].sign
    };
    const createPayload = CreatePayload(deviceSpec);
    Debug('esnext-cctalk/node/getDeviceWriter/info')({ deviceSpec, methodName })
    //const coinSendCommand = getSendCommand(1,2,8)
    //const billSendCommand = getSendCommand(1,40,16)
    //const sendMethod = (methodName, arg ) => coinSendCommand(...coinAcceptor.methods[methodName](arg));
    /** 
     * @param {number| Uint8Array | Array<number| Array<number>>} command
     * @param {Uint8ArrayType} data
     */
    const deviceWriter = (command, data= new Uint8Array(0)) => {
        const isArrayLike = (typeof command).indexOf('Array') > 0;

        // @ts-ignore
        if (isArrayLike && command.length === 2) {
            // Support calling as ([cmd,data])
            if (data.length !== 0) {
                throw new Error('TypeError: call (number,data) or ([cmd,data])');
            }
            
            // @ts-ignore
            return connection.write(createPayload(...command));
        }
        
        return connection.write(CreatePayload({ 
            // @ts-ignore
            src: 1, dest: address, crcSigningMethod: crcMethods[methodName].sign
        })(command,data));
    }
    return deviceWriter
}