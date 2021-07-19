import './types.js'
import Debug from '../modules/debug.js';
import { CreatePayload } from '../modules/payload-helpers.js';
import { crc8 } from '../modules/crc/8.js';
import { crc16xmodemJs } from '../modules/crc/16-xmodemjs.js';
//import { crc16xmodem } from '../modules/crc/16-xmodem-node-crc.js';
const crc16xmodem = crc16xmodemJs;
/** @typedef {Uint8Array} unsignedButCompletPayload*/

export const crcMethods = {
    crc16xmodem,
    crc16xmodemJs,
    crc8
}

/**
 * call({ src, dest, crcSigningMethod })(header,data)
 * is aliad for  crcMethods[crcMethodName].sign( Uint8Array[40,....] );
 * @param {*} destAdr { src, dest, crcSigningMethod }
 * @param {*} src { src, dest, crcSigningMethod }
 * @param {string} crcMethodName crc16xmodem, crc16xmodemJs, crc8
 * @returns 
 */
 export const CreatePayloadUsingCrcMethodName = (destAdr, src, crcMethodName) => {
    if (typeof destAdr !== 'number') {
        throw new Error(`TypeError destAdr needs to be number got: ${typeof destAdr}`)
    }
    if (typeof crcMethodName !== 'string') {
        throw new Error(`TypeError crcMethodName needs to be string got: ${typeof crcMethodName}`)
    }
    // @ts-ignore
    return CreatePayload(destAdr, src, crcMethods[crcMethodName].sign )
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

