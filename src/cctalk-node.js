import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import { CCTalkParser } from './cctalk-parser.js';
import { Transform } from 'stream';
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
       parser.on('data', console.log)
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
                parser.on('data', console.log)
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