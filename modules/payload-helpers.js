import { errorUint8 } from '../modules/error-uint8.js';
import { crc8 } from '../modules/crc/8.js';
import { crc16xmodemJs } from '../modules/crc/16-xmodemjs.js';
import { crc16xmodem } from '../modules/crc/16-xmodem-node-crc.js';
//import { crc16xmodem } from '../modules/crc/16-xmodem-node-crc.js';

/** @typedef {Uint8Array} unsignedButCompletPayload*/

export const crcMethods = {
    crc16xmodem,
    crc16xmodemJs,
    crc8
}

/**
 * 
 * @param {*} arr 
 * @returns 
 */
 export const getMessage = arr => {
    errorUint8(arr);
    
    const { destPosition, headerPosition } = getPayloadPositionData(arr);
    const header = arr[headerPosition]
    const data = getDataFildFromPayload(arr);
    const dest = arr[destPosition];
    return { dest, header, data }
}

export { getMessage as getDestHeaderDataFromPayloadAsObject }
/**
 * 
 * @param {Uint8Array} signedPayload 
 * @returns 
 */
 export const getDataFildFromPayload = signedPayload => {
    errorUint8(signedPayload);
    const { dataStartPosition , checksumPosition} = getPayloadPositionData(signedPayload);
    return Uint8Array.from(signedPayload.slice(dataStartPosition , checksumPosition));
}

/**
 * 
 * @param {Uint8Array} signedPayload 
 * @returns 
 */
 export const getPayloadPositionData = signedPayload => {
    errorUint8(signedPayload);
    const destPosition = 0;
    const dataLengthPosition = 1;
    const srcPosition = 2;
    const headerPosition = 3;
    const dataStartPosition = 4;
    
    const dataLength = signedPayload[dataLengthPosition];
    const dataEndPosition = headerPosition + dataLength;
    const checksumPosition = dataEndPosition + 1; // is Maybe dateEndPosition
    return { 
        destPosition, dataLengthPosition, srcPosition, 
        headerPosition, dataStartPosition, dataEndPosition,
        checksumPosition, dataLength 
    }
}

//new 254
/**
 * maybe deprecated look into array2Object
 * also we use getMessage(buffer)
 * @param {Uint8Array} signedPayload
 * @returns 
 */
const fromUint8Array = signedPayload => {
    errorUint8(signedPayload);
    const { 
        checksumPosition,srcPosition, dataLengthPosition ,destPosition, headerPosition 
    } = getPayloadPositionData(signedPayload);
    
    const header = signedPayload[headerPosition]
    
    const cctalkPayloadObject = {
        _dest: signedPayload[destPosition],
        _dataLength: signedPayload[dataLengthPosition],
        _src: signedPayload[srcPosition],
        _header: header,
        _data: getDataFildFromPayload(signedPayload),
        _checksum: signedPayload[checksumPosition],
    }
    
    return cctalkPayloadObject;
}


/**
 * 
 * @param {*} arr 
 * @returns 
 */
const array2Object = arr => {
    const [ dest, dataLength, srcOrCrc16, header ] = arr;
    
    const { checksumPosition } = getPayloadPositionData(arr);
    const data = getDataFildFromPayload(arr);
    const crc = arr[checksumPosition];
    
    //object2Array(messageObj)
    const Message = { 
        dest,
        dataLength,
        src: srcOrCrc16,
        header,
        data,
        crc,
    }
    return Message
}

/**
 * 
 * @param {*} arr 
 * @returns 
 */
 const array2ObjectWithVerify = arr => {
    const [ dest, dataLength, srcOrCrc16, header ] = arr;
    
    const { checksumPosition } = getPayloadPositionData(arr);
    const data = getDataFildFromPayload(arr);
    const crc = arr[checksumPosition];
    
    //object2Array(messageObj)
    const Message = { 
        dest,
        dataLength,
        src: srcOrCrc16,
        header,
        data,
        crc,
    }
    return Message
}

/**
 * object2Array({ header , ?dataUint8Array, })
 * @param {*} messageObj 
 * @returns 
 */
export const object2Array = messageObj => {
    const { 
        dest = 2, 
        src = 1, /* This can also be checksum_1 of a crc16 signed package */
        header, 
        data = new Uint8Array(0), /* Buffer.from([]) */
        crc, 
        crcType = 8
    } = messageObj;

    const _buffer = Uint8Array.from([ dest, data.length , src, header, ...data, crc ]);
    
    return _buffer
}

/**
 * call({ src, dest, crcSigningMethod })(header,data)
 * @param {*} dest { src, dest, crcSigningMethod }
 * @param {*} src { src, dest, crcSigningMethod }
 * @param {string} crcMethodName crc16xmodem, crc16xmodemJs, crc8
 * @returns 
 */
 export const getCreatePayloadUsingCrcMethodName = (dest, src, crcMethodName) =>
    // @ts-ignore
    CreatePayload(dest, src, crcMethods[crcMethodName].sign )

/**
 * call({ src, dest, crcSigningMethod })(header,data)
 * @param {*} destAdr { src, dest, crcSigningMethod }
 * @param {*} src { src, dest, crcSigningMethod }
 * @param {*} crcSigningMethod crc16xmodem, crc16xmodemJs, crc8
 * @returns 
 */
 export const CreatePayload = (destAdr, src, crcSigningMethod) => {
    if (typeof destAdr !== 'number') {
        throw new Error(`TypeError destAdr needs to be number got: ${typeof destAdr}`)
    }
    if (typeof src !== 'number') {
        throw new Error(`TypeError methodName needs to be string got: ${typeof src}`)
    }
    /**
     * 
     * @param {*} header 
     * @param {*} data 
     * @returns 
     */
    const createPayload = ( header, data = new Uint8Array(0) ) => {
        const CCTalkPayload = Uint8Array.from(
            [destAdr, data.length, src, header, ...data,0]
        );
        
        return crcSigningMethod(CCTalkPayload);
    }
    return createPayload;
}

/**
 * 
 * @param {number} src / crc16 verifyer
 * @param {number} dest 
 * @param {number} header 
 * @param {Uint8Array} data 
 * @param {number} crcType 
 * @returns 
 */
export const CCTalkMessageCompat = (
    src = 0, // CCTalkBus default 0
    dest = 1, 
    header=254, // simplePoll
    data = new Uint8Array(0), 
    crcType = 8
) => {
    
    if (typeof header === 'undefined') {
        throw new Error('NO_COMMAND');
    } else if (typeof data === 'undefined') {
        throw new Error('NO_DATA');
    }
    
    const messageObj = { src, dest, header, data, crcType };

    const CompatMessage = {
        ...messageObj,
        _buffer: object2Array(messageObj),
    }
    
    return CompatMessage;

};

const methods = {
    // returns the first CCTalkToken in the payload
    getNextToken() {
        //isMoreThen2Bytes
            //isPossibleCCTalkToken payload => 5 + data.length 
                //hasChecksums
                    //isVerofyedCCTalkToken
        //!isMoreThen2Bytes preservedDataBuffer
            //!isPossibleCCTalkToken slice data out next
                //!hasChecksums slice data out next
                    //!isVerifyedCCTalkTOken slice data out next


    }
}

// isHelper
const isHelper = {
    isNotOlderThen50ms() {},
    isWritePromiseReply() {},
    isSamePayload() {},
    isMoreThen2Bytes() {},
    isPossibleCCTalkToken() {}, // is Complet
    hasChecksums() {},
    isVerifyedCCTalkToken() {},
    isEventMessage() {},
}