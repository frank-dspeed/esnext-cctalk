import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import { CCTalkParser } from './cctalk-parser.js';
import { getSendCommand, getMessage } from './cctalk-crc.js';
import { Transform } from 'stream';
import Debug from './debug.js'
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



//const SerialPort = require('serialport')
//const port = new SerialPort('/dev/ttyUSB0')
export const getConnection = port => {

    const CCTalk = NodeStreamParser();
    const parser = port.pipe(new CCTalk())
    let debug = Debug('esnext-cctalk::node::getConnection')
    /**
     * Async Promise Chain only for demo in production you will want to use a 
     * welll defined generator
     */

     let lastCommand = null;
     let commandChainPromise = Promise.resolve();
 
     parser.on('data', message => {
         const command = getMessage(new Uint8Array(message));
         // if destination is master or bus we accept it
         const isbufferReadingCommand = (command.command === 229 || command.command === 0)
         if (!isbufferReadingCommand) {
             Debug('esnext-cctalk::node')({command})
         }
         Debug('esnext-cctalk::node')({command})
         const isAnswer = command.dest === 1 || command.dest === 0
         if(isAnswer) {
             debug('response::',{command})
             if(lastCommand) {
                 var Command = lastCommand;
                 lastCommand = null;
                 if(command.command === 0){
                   Command.resolve(new Uint8Array(message));
                 } else {
                   Command.reject(new Uint8Array(message));
                 }
             }
           } else {
             return
           }
         
         
     })
     
     // @ts-ignore
     const sendCommandPromise = (command) => {
 
         // Send command with promised reply
         // If you use this function, use it exclusively and don't forget to call _onData() if you override onData()
         const promise = new Promise((resolve, reject) => {
          command.resolve = resolve;
          command.reject = reject;
         }).catch((err) => {
            Debug('COMMANDCHAIN::PROMISE::ERROR')(err,{command})
         });
   
         // use the command chain to send command only when previous commands have finished
         // this way replies can be correctly attributed to commands
         commandChainPromise = commandChainPromise
           .then(() => {
              lastCommand = command;
              Debug('COMMANDCHAIN::PROMISE')('SET LAST COMMAND')
              return new Promise((resolve,reject)=> {
                Debug('COMMANDCHAIN::PROMISE')({command})
                  
                port.write(command, err =>{
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
        write: sendCommandPromise,
    }

}    

export const getDeviceWriter = (connection,address,crcType) => {
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
            return connection.write(getSendCommand(1,address,crcType)(...command));
        }
        
        // @ts-ignore
        if (isUint8 && command.length > 2) {
            return connection.write(command);
        }
        return connection.write(getSendCommand(1,address,crcType)(command,data));
    }
    return deviceWriter
}