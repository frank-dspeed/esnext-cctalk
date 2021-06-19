import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import { OnPayloadComplet } from './on-payload-complet.js';
import { CreatePayloadUsingCrcMethodName } from './cctalk-crc.js';
import { OnCCTalkCommandPairResponse } from '../modules/parse-command-reply-pairs.js'

import { Transform } from 'stream';
import Debug from '../modules/debug.js';

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
/**
 * @type {( maxDelayBetweenBytesMs: number ) => Transform }
 * @param {*} maxDelayBetweenBytesMs 
 * @returns 
 */
export const getNodeStreamParser = (maxDelayBetweenBytesMs = 50 ) => {
    const parser = OnPayloadComplet(maxDelayBetweenBytesMs);
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
           parser._transform(chunk, (/** @type {Uint8Array} */ payload) => this.push(payload));
           cb();
       }
   }
   return new NodeTransformStream();
}

export const lazyNodeStreamParser = ( maxDelayBetweenBytesMs = 50 ) => {
    const parser = OnPayloadComplet(maxDelayBetweenBytesMs);
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
 * @typedef {null|Promise<Uint8Array>} defferedPromise
*/

/**
 * const SerialPort = require('serialport')
 * const port = new SerialPort('/dev/ttyUSB0')
 * Creates  a connection between serialport and PairParser
 * @param {*} port 
 * @returns 
 */
export const getConnection = port => {
    const parser = port.pipe(getNodeStreamParser(50));

    const { CreateCCTalkRequest, onCCTalkCommandPairResponse } = OnCCTalkCommandPairResponse();
    const createCCTalkReqestPromise = CreateCCTalkRequest(port);
    
    parser.on('data', onCCTalkCommandPairResponse); 

    /**
     * Combines connection + getCreatePayloadUsingCrcMethodName
     * /@ param {{ write: any; parserWrite?: (input: any) => Promise<any>; port?: any; parser?: any; }} connection 
     * @param {number} destAdr 
     * @param {string} methodName 
     * @returns 
     */
    const getDeviceWriter = ( destAdr, methodName ) => {
        if (typeof destAdr !== 'number') {
            throw new Error(`TypeError destAdr needs to be number got: ${typeof destAdr}`)
        }
        if (typeof methodName !== 'string') {
            throw new Error(`TypeError methodName needs to be string got: ${typeof methodName}`)
        }

        const createPayload = CreatePayloadUsingCrcMethodName(destAdr,1,methodName);
        Debug('esnext-cctalk/node/getDeviceWriter/info')({ destAdr, src: 1, methodName })
        /** 
         * @param {number} command
         * @param {Uint8Array} data
         */
        const deviceWriter = async (command, data= new Uint8Array(0)) => {
            const ccTalkRequestPromise = await createCCTalkReqestPromise(createPayload(command,data));
            return ccTalkRequestPromise;
        }
        return deviceWriter
    }

    return {
        getDeviceWriter,
        write: CreateCCTalkRequest(port),
        parserWrite: CreateCCTalkRequest(parser), //CreateCCTalkRequestParser,
        port,
        parser,
        on: parser.on
    }

}

