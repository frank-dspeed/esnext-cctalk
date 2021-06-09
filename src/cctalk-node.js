import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import { CCTalkParser } from './cctalk-parser.js';
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
    const parser = CCTalkParser(maxDelayBetweenBytesMs);
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
export const lazyNodeStreamParser = (maxDelayBetweenBytesMs = 50 ) => {
    const parser = CCTalkParser(maxDelayBetweenBytesMs);
            /*
            const CCTalkPayload = parser.buffers.pop();
            if (CCTalkPayload) {
                this.push(parser.buffers)
            }
            */
            //require('stream/promises')
    return import('stream')
        .then( ({ Transform }) =>
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
        )
        .then( NodeTransformStream => new NodeTransformStream() );
}




/**
 * Async Promise Chain only for demo in production you will want to use a
 welll defined generator
@type {null|Promise<Uint8ArrayType>}
*/
let lastCommand = null;
let commandChainPromise = Promise.resolve();
/**
 * const SerialPort = require('serialport')
 * const port = new SerialPort('/dev/ttyUSB0')
 * @param {*} port 
 * @returns 
 */
export const getConnection = port => {

    const CCTalk = NodeStreamParser();
    const parser = port.pipe(new CCTalk())
    

 
     // @ts-ignore
     parser.on('data', message => {
         const command = getMessage(new Uint8Array(message));
         
         // if destination is master or bus we accept it
         const isAnswer = command.dest === 1 || command.dest === 0
         
         if(isAnswer) {
            Debug('esnext-cctalk/node/connection/parser/onData/isAnswer/debug')({command})
             if(lastCommand) {
                 let Command = lastCommand;
                 lastCommand = null;
                 if(command.command === 0){
                   Command.resolve(new Uint8Array(message));
                 } else {
                   Command.reject(new Uint8Array(message));
                 }
             }
           } else {
                const isbufferReadingCommand = (command.command === 229 || command.command === 0)
                if (!isbufferReadingCommand) {
                    // dont log buffer reading Commands
                    Debug('esnext-cctalk/node/connection/parser/onData')({command})
                } else {
                    Debug('esnext-cctalk/node/connection/parser/onData/debug')({command})
                }
                return
           }
         
         
     })
     
     // @ts-ignore
     const sendCommandPromise = portToWrite => input => {
        // @ts-ignore
        const command = {}
         // Send command with promised reply
         // If you use this function, use it exclusively and don't forget to call _onData() if you override onData()
         const promise = new Promise((resolve, reject) => {
            Object.assign(command, { resolve, reject, input })
         }).catch((err) => {
            Debug('esnext-cctalk/node/connection/sendCommandPromise/error')(err,{input})
            throw err;
         });
   
         // use the command chain to send command only when previous commands have finished
         // this way replies can be correctly attributed to commands
         commandChainPromise = commandChainPromise
           .then(() => {
              lastCommand = command;
              return new Promise((resolve,reject)=> {
                Debug('esnext-cctalk/node/connection/sendCommandPromise/debug')({input})
                // @ts-ignore
                portToWrite.write(command.input, err =>{
                    if(err) {
                      reject(err)
                    } else {
                      resolve(true)
                    }
                  });
                });
           })
           .then(() => promise)
   
         return promise
    }
 

    // @ts-ignore
    const sendCommandPromiseParser = (command) => {

        // Send command with promised reply
        // If you use this function, use it exclusively and don't forget to call _onData() if you override onData()
        const promise = new Promise((resolve, reject) => {
            command.resolve = resolve;
            command.reject = reject;
        }).catch((err) => {
            Debug('esnext-cctalk/node/connection/sendCommandPromise/error')(err,{command})
            throw err;
        });
    
        // use the command chain to send command only when previous commands have finished
        // this way replies can be correctly attributed to commands
        commandChainPromise = commandChainPromise
            .then(() => {
                lastCommand = command;
                Debug('esnext-cctalk/node/connection/sendCommandPromise/debug')('SET LAST COMMAND')
                return new Promise((resolve,reject)=> {
                Debug('esnext-cctalk/node/connection/sendCommandPromise/debug')({command})
                    
                parser.write(command, err =>{
                    if(err) {
                        reject(err)
                    } else {
                        resolve(true)
                    }
                    });
                });
            })
            .then(() => promise)
    
        return promise
    }
    
    return {
        write: sendCommandPromise(port),
        parserWrite: sendCommandPromise(parser),//sendCommandPromiseParser,
        port,
        parser
    }

}    

export const getDeviceWriter = (connection,address,methodName) => {
    const deviceSpec = { 
        src: 1, dest: address, crcSigningMethod: crcMethods[methodName].sign
    };
    const createPayload = CreatePayload(deviceSpec);
    Debug('esnext-cctalk/node/getDeviceWriter/info')({ deviceSpec })
    //const coinSendCommand = getSendCommand(1,2,8)
    //const billSendCommand = getSendCommand(1,40,16)
    //const sendMethod = (methodName, arg ) => coinSendCommand(...coinAcceptor.methods[methodName](arg));
    /** 
     * @param {number|Uint8ArrayType} command
     * @param {Uint8ArrayType} data
     */
    const deviceWriter = (command, data) => {
        const isUint8 = (typeof command).indexOf('Uint8') === 0;
        
        // @ts-ignore
        if (isUint8 && command.length === 2) {
            // @ts-ignore
            return connection.write(createPayload(...command));
        }
        
        // @ts-ignore
        if (isUint8 && command.length > 2) {
            return connection.write(command);
        }
        return connection.write(CreatePayload({ 
            src: 1, dest: address, crcSigningMethod: crcMethods[methodName].sign
        })(command,data));
    }
    return deviceWriter
}