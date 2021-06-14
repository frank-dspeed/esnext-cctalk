import { crcMethods } from '../../src/cctalk-crc.js';

/**
 * 
 * @param {*} payload 
 * @returns 
 */
export const isVerifyedPayload = payload => {
       
    const srcFild = payload[2];
    
    if (srcFild === 2) {
        if (crcMethods.crc8.verify(payload)) {
            return true;
        };
    };
    
    if (crcMethods.crc16xmodemJs.verify(payload)){
        return true
    };

    return false
}
/**
 * 
 * @param {*} payload 
 * @param {*} emit 
 */
export const onCrcVerifyed = (payload, emit) => {
    
    if ( isVerifyedPayload(payload) ) {
        emit(payload);
    }
    
}