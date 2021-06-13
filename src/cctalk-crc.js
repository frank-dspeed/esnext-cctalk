import './types.js'
import Debug from '../modules/debug.js';
import { CreatePayload } from '../modules/payload-helpers.js';
import { crc8 } from '../modules/crc/8.js';
import { crc16xmodemJs } from '../modules/crc/16-xmodemjs.js';
import { crc16xmodem } from '../modules/crc/16-xmodem-node-crc.js';

/** @typedef {Uint8Array} unsignedButCompletPayload*/

export const crcMethods = {
    crc16xmodem,
    crc16xmodemJs,
    crc8
}

/**
 * call({ src, dest, crcSigningMethod })(header,data)
 * @param {*} dest { src, dest, crcSigningMethod }
 * @param {*} src { src, dest, crcSigningMethod }
 * @param {string} crcMethodName crc16xmodem, crc16xmodemJs, crc8
 * @returns 
 */
 export const getCreatePayloadUsingCrcMethodName = (dest, src, crcMethodName) => {
    
    /**
     * 
     * @param {number} header 
     * @param {Uint8Array} [data]
     * @returns 
     */
    const createPayload = ( header, data = new Uint8Array(0) ) => {
        const CCTalkPayload = Uint8Array.from(
            [dest, data.length, src, header, ...data,0]
        );
        // @ts-ignore
        return crcMethods[crcMethodName].sign( CCTalkPayload );
    }
    return createPayload;
}

/**
 * call({ src, dest, crcSigningMethod })(header,data)
 * is aliad for  crcMethods[crcMethodName].sign( Uint8Array[40,....] );
 * @param {*} dest { src, dest, crcSigningMethod }
 * @param {*} src { src, dest, crcSigningMethod }
 * @param {string} crcMethodName crc16xmodem, crc16xmodemJs, crc8
 * @returns 
 */
 export const CreatePayloadUsingCrcMethodName = (dest, src, crcMethodName) => {
    
    /**
     * 
     * @param {number} header 
     * @param {Uint8Array} [data]
     * @returns 
     */
    const createPayload = ( header, data = new Uint8Array(0) ) => {
        const CCTalkPayload = Uint8Array.from(
            [dest, data.length, src, header, ...data,0]
        );
        // @ts-ignore
        return crcMethods[crcMethodName].sign( CCTalkPayload );
    }
    return createPayload;
}


/**
 * 
 * @param {*} signedPayload
 * @returns 
 */
 export const verifyCCTalkMessage = signedPayload => {
    Debug('esnext-cctalk/verifyCCTalkMessage/info')({ signedPayload });
   
    for (const [methodName, methods] of Object.entries(crcMethods)) {
        if (methods.verify(signedPayload)) {       
            Debug('esnext-cctalk/crc/verifyCCTalkMessage/verifyedWith/debug')({ methodName });
            return signedPayload;
        }
    }

    const tryedMethods = Object.keys(crcMethods).join(', ');
    Debug('esnext-cctalk/crc/verifyCCTalkMessage/warning')({ signedPayload ,tryedMethods });
    throw new Error(`CRC is none valid checked ${tryedMethods}`)
}

