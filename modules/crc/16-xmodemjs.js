import './types.js';
import Debug from '../debug.js';
import { errorUint8 } from '../error-uint8.js';


/** start https://unpkg.com/browse/crc@3.8.0/crc16xmodem.js */  
/**
 * CRC 16 xmodem in pure JS
 * @param { Uint8Array } buf  
 * @param { number } [previous] Uint8
 * @returns {number} crc16checksums as byteOffsets use toString(16)
 */
 const crc16xmodem = (buf, previous) => {
    if (!(buf instanceof Uint8Array)) {
        //We need to work with int8 while nodeJS Works with int16
        throw new Error('buf is not Uint8Array')
    }
    
    let crc = typeof previous !== 'undefined' ? ~~previous : 0x0;
    
    for (let index = 0; index < buf.length; index++) {
        const byte = buf[index];
        let code = (crc >>> 8) & 0xff;
    
        code ^= byte & 0xff;
        code ^= code >>> 4;
        crc = (crc << 8) & 0xffff;
        crc ^= code;
        code = (code << 5) & 0xffff;
        crc ^= code;
        code = (code << 7) & 0xffff;
        crc ^= code;
    }
    
    return crc >>> 0;
}
/** End https://unpkg.com/browse/crc@3.8.0/crc16xmodem.js */

export const crc16xmodemJs = {
    /** @param {Uint8Array} unsignedButCompletPayload */
    sign(unsignedButCompletPayload) {
        errorUint8(unsignedButCompletPayload);
        Debug('esnext-cctalk/crc/crcMethods/crc16xmodemJs/debug')({ unsignedButCompletPayload });
        
        /** @param {*} rawChecksums */
        const crc16xmodemJsToArray = rawChecksums => rawChecksums
            .toString(16).match(/.{1,2}/g)
            ?.map((/** @type {string} */ val) => parseInt(val, 16));

        const crc16xmodemJsImpl = (/** @type {Uint8Array} */ checksumLessPayload) => crc16xmodemJsToArray(crc16xmodem(checksumLessPayload));
        
        const payloadWithoutChecksumAtEnd = unsignedButCompletPayload.slice(0,-1);
        const destAndDataLengthAsArray = payloadWithoutChecksumAtEnd.slice(0,2);
        const headerAndDataAsArray = payloadWithoutChecksumAtEnd.slice(3);
        const checksumLessPayload =  Uint8Array.from([ ...destAndDataLengthAsArray, ...headerAndDataAsArray ])
        const checksumAsArray = crc16xmodemJsImpl(checksumLessPayload).reverse();
        
        const signedPayload = Uint8Array.from([
            ...destAndDataLengthAsArray, checksumAsArray[0], 
            ...headerAndDataAsArray, checksumAsArray[1]
        ])
        
        return signedPayload;
    },
    /**
     *
     * @param {*} payloadToVerify
     * @returns
     */
    verify(payloadToVerify) {
        errorUint8(payloadToVerify);
        const verificationPayloadAsString = crc16xmodemJs.sign(payloadToVerify).toString();
        const payloadToVerifyAsString = payloadToVerify.toString();
       
        Debug('esnext-cctalk::crc')({ verificationPayloadAsString, payloadToVerifyAsString, methodName: 'crc16xmodemJs' });
        return (payloadToVerifyAsString === verificationPayloadAsString);
    }
};