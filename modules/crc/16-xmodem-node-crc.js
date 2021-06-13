import { crc16xmodem as crc16xmodemImpl } from 'node-crc';
import { getChecksumFromPayloadAsString } from './16-shared-modules.js';
import Debug from '../debug.js';
import { errorUint8 } from '../error-uint8.js';

export const crc16xmodem = {
    /** @param {Uint8Array} unsignedButCompletPayload */ 
    sign(unsignedButCompletPayload) {
        errorUint8(unsignedButCompletPayload);
        
        const payloadWithoutChecksumAtEnd = unsignedButCompletPayload.slice(-1);
        const destAndDataLengthAsArray = payloadWithoutChecksumAtEnd.slice(0,2);
        const headerAndDataAsArray = payloadWithoutChecksumAtEnd.slice(3);

        const checksumLessPayload =  Uint8Array.from([ ...destAndDataLengthAsArray, ...headerAndDataAsArray ])
        // @ts-ignore
        const checksumAsArray = crc16xmodemImpl(checksumLessPayload).reverse();
        
        const signedPayload = Uint8Array.from([
            ...destAndDataLengthAsArray, checksumAsArray[0], 
            ...headerAndDataAsArray, checksumAsArray[1]
        ])
        Debug('esnext-cctalk/crc/crcMethods/crc16xmodem/debug')({ unsignedButCompletPayload, signedPayload, checksumLessPayload, checksumAsArray });        
        return signedPayload;
    },
    /**
     * @param {Uint8Array} signedPayload
     */
    verify(signedPayload) {
        errorUint8(signedPayload);
        const verificationPayload = crc16xmodem.sign(signedPayload);
        
        const expectedChecksum = getChecksumFromPayloadAsString(verificationPayload);
        const checksum = getChecksumFromPayloadAsString(signedPayload);
       
        Debug('esnext-cctalk::crc')({ checksum, expectedChecksum });
        return (checksum === expectedChecksum);
    }
}