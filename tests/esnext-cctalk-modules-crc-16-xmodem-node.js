import { crc16xmodem as crc16xmodemImpl } from 'node-crc';
//import Debug from '../debug.js';
import { errorUint8 } from 'esnext-cctalk/modules/error-uint8.js';
/**This exists for verification reasons only */
export const crc16xmodem = {
    /** @param {Uint8Array} unsignedButCompletPayload */ 
    sign(unsignedButCompletPayload) {
        errorUint8(unsignedButCompletPayload);
        
        const payloadWithoutChecksumAtEnd = unsignedButCompletPayload.slice(0,-1);
        const destAndDataLengthAsArray = payloadWithoutChecksumAtEnd.slice(0,2);
        const headerAndDataAsArray = payloadWithoutChecksumAtEnd.slice(3);

        const checksumLessPayload =  Uint8Array.from([ ...destAndDataLengthAsArray, ...headerAndDataAsArray ])
        //@ts-ignore
        const checksumAsArray = crc16xmodemImpl(checksumLessPayload).reverse();
        
        const signedPayload = Uint8Array.from([
            ...destAndDataLengthAsArray, checksumAsArray[0], 
            ...headerAndDataAsArray, checksumAsArray[1]
        ])
        
        return signedPayload;
    },
    /**
     * @param {Uint8Array} payloadToVerify
     */
    verify(payloadToVerify) {
        errorUint8(payloadToVerify);
        const verificationPayloadAsString = crc16xmodem.sign(payloadToVerify).toString();
        const payloadToVerifyAsString = payloadToVerify.toString();
       
        //Debug('esnext-cctalk::crc')({ verificationPayloadAsString, payloadToVerifyAsString, methodName: 'crc16xmodemJs' });
        return (payloadToVerifyAsString === verificationPayloadAsString);
    }
};