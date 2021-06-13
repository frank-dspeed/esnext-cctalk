import './types.js';
import Debug from '../debug.js';
import { errorUint8 } from '../error-uint8.js';
import { getPayloadPositionData, getDataFildFromPayload } from '../payload-helpers.js';

/** @param {Uint8Array} signedPayload */
export const getChecksumFromPayloadAsString = signedPayload => {
    const { srcPosition , checksumPosition } = getPayloadPositionData(signedPayload);
    return [ signedPayload[srcPosition], signedPayload[checksumPosition] ].join('');
}

/**
 * deprecated see new calculateCrc16ChecksumsWith
 * Turns a CCTalk parser chunk and returns crc16 verfiyable Uint8Array
 * that contains only the relevant parts.
 * Allows us to use a already signed chunk for verification
 * Returns a striped payload without src and crc filds
 * @param {Uint8Array} signedPayload already signed or unsigned 
 * @returns 
 */
 const getCrc16Unit8Array = signedPayload => {
    errorUint8(signedPayload);
    const _data = getDataFildFromPayload(signedPayload);
    return Uint8Array.from([signedPayload[0],signedPayload[1],signedPayload[3],..._data])
}

/**
 * deprecated this is wrong look into getCrc16Ui* its correct new impl in the own files
 * returns checksums as reversed array crcImplementation needs to return
 * unreversed array
 * @param {*} completPayload 
 * @param {*} crcImplementation 
 * @returns 
 */
/*
export const calculateCrc16ChecksumsWith = (completPayload, crcImplementation ) => {
    errorUint8(completPayload);
    const payloadWithoutChecksumAtEnd = completPayload.slice(-1);
    return crcImplementation(payloadWithoutChecksumAtEnd).reverse();
}
*/
/**
 * 
 * @param {Uint8Array} unsignedButCompletPayload
 * @param {Uint8Array} CRCArray
 * @returns {Uint8Array}
 */
export const crc16sign = ( unsignedButCompletPayload,  CRCArray )=> {

    if (!CRCArray) {
        console.log({unsignedButCompletPayload})
        throw new Error('Could not Sign CRC16');
    }
    
    const [ dest, dataLength, crcPart1, command] = Uint8Array.from(unsignedButCompletPayload);
    
    //crc16sign(unsignedButCompletPayload, crc16xmodem)
    const signedPayload = Uint8Array.from([
        dest, dataLength,
        CRCArray[0],
        command,
        ...getDataFildFromPayload(unsignedButCompletPayload),
        CRCArray[1],
    ])
    
    Debug('esnext-cctalk/crc/crcMethods/crc16sign/debug')({ signedPayload })
    return signedPayload;
}

/**
 * 
 * @param {Uint8Array} signedPayload
 * @param {*} verificationPayload
 * @returns {boolean}
 */
export const verifiyAsString = (signedPayload, verificationPayload )=> {    
    const expectedChecksum = getChecksumFromPayloadAsString(verificationPayload);
    const checksum = getChecksumFromPayloadAsString(signedPayload);
   
    Debug('esnext-cctalk::crc')({ checksum, expectedChecksum });
    return (checksum === expectedChecksum);
}