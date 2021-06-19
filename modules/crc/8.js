import './types.js';
//import Debug from '../debug.js';
import { errorUint8 } from '../error-uint8.js';

/**
 * 
 * @param {Uint8Array} checksumLessPayload 
 * @returns {number} Uint8 CRC Checksum as number
 */
const getCrc8ChecksumFor = checksumLessPayload => {
    errorUint8(checksumLessPayload);
    
    let sum = 0;
    
    checksumLessPayload.forEach(
        /** @param {*} byte */
        byte => {
            sum += (byte);
        }
    )
    // Clamp the sum to fit into 256
    return 0x100 - sum % 0x100; //256 - sum % 256
}

/** @param {Uint8Array} signedPayload */
const getCr8ChecksumFromPayload = signedPayload => signedPayload.slice(-1)[0];

export const crc8 = {
    getChecksumFromPayload: getCr8ChecksumFromPayload,
    /**
     * @param {Uint8Array} unsignedButCompletPayload
     * @returns {Uint8Array} chunk with inserted checksum on the right position
     */
    sign(unsignedButCompletPayload) {
        errorUint8(unsignedButCompletPayload);
        const checksumLessPayload = unsignedButCompletPayload.slice(0, -1);
        const checksum = getCrc8ChecksumFor(checksumLessPayload);
        const signedPayload = Uint8Array.from( [...checksumLessPayload, checksum] );
        //Debug('esnext-cctalk/crc/crcMethods/crc8/debug')({ unsignedButCompletPayload, signedPayload, checksumLessPayload, checksum })
        return signedPayload
    },
    /**
     * @param {Uint8Array} signedPayload
     * @returns {boolean}
     */
    verify(signedPayload) {
        errorUint8(signedPayload);
        const verificationPayload = crc8.sign(signedPayload);
        const expectedChecksum = getCr8ChecksumFromPayload(verificationPayload);
        const checksum = getCr8ChecksumFromPayload(signedPayload);

        return (checksum === expectedChecksum);
    }
}

export default crc8;