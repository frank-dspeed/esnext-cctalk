import './types.js'
import Debug from './debug.js';
import { crc16xmodem } from 'node-crc';
//import { method } from 'bluebird';

/**
 * errorUint8 Errors if its not a Uint8*
 * @param { Uint8ArrayType } chunk 
 */
 const errorUint8 = chunk => {
    const isUint8 = chunk.constructor.name.indexOf('Uint8') === 0;
    if (isUint8) { return; };
    //We need to work with Uint8 while ECMAScript uses Uint16 by default
    throw new Error('_buffer is not Uint8Array')
}

/**
 * 
 * @param {Uint8ArrayType} chunk 
 * @returns 
 */
const getPayloadPositionData = chunk => {
    errorUint8(chunk);
    const destPosition = 0;
    const dataLengthPosition = 1;
    const srcPosition = 2;
    const commandPosition = 3;
    const dataStartPosition = 4;
    
    const dataLength = chunk[dataLengthPosition];
    const dataEndPosition = commandPosition + dataLength;
    const checksumPosition = dataEndPosition + 1; // is Maybe dateEndPosition
    return { 
        destPosition, dataLengthPosition, srcPosition, 
        commandPosition, dataStartPosition, dataEndPosition,
        checksumPosition, dataLength 
    }
}

/**
 * 
 * @param {Uint8ArrayType} chunk 
 * @returns 
 */
const getDataFromChunk = chunk => {
    errorUint8(chunk);
    const { dataStartPosition , checksumPosition} = getPayloadPositionData(chunk);
    return Uint8Array.from(chunk.slice(dataStartPosition , checksumPosition));
}

/** start https://unpkg.com/browse/crc@3.8.0/crc16xmodem.js */  
/**
 * CRC
 * @param { Uint8Array } buf  
 * @param { number } [previous] Uint8
 * @returns {number} crc16checksums as byteOffsets use toString(16)
 */
export const crc16xmodemJs = (buf, previous) => {
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

/**
 * 
 * @param {Uint8ArrayType} chunk 
 * @returns {number} Uint8 CRC Checksum as number
 */
const calcCrc8 = chunk => {
    errorUint8(chunk);
    const { checksumPosition } = getPayloadPositionData(chunk);

    let sum = 0;
    
    chunk.forEach(
        /**
         * 
         * @param {*} byte 
         * @param {*} index 
         * @returns 
         */
        (byte, index) => {
            // Allows us to use a already signed chunk for verification
            if (index === checksumPosition) { return };
            sum += (byte);
        }
    )

    return 0x100 - sum % 0x100; //256 - sum % 256
}

/**
 * 
 * @param {Uint8ArrayType} completPayload
 * @returns {Uint8ArrayType} chunk with inserted checksum on the right position
 */
const crc8sign = completPayload => {
    errorUint8(completPayload);
    const checksum = calcCrc8(completPayload)
    const { checksumPosition } = getPayloadPositionData(completPayload);
    completPayload[checksumPosition] = checksum;
    return completPayload
}

/**
 * Turns a CCTalk parser chunk and returns crc16 verfiyable Uint8Array
 * that contains only the relevant parts.
 * Allows us to use a already signed chunk for verification
 * Returns a striped payload without src and crc filds
 * @param {Uint8ArrayType} chunk already signed or unsigned 
 * @returns 
 */
const getCrc16Unit8Array = chunk => {
    errorUint8(chunk);
    /** Historical */
    /*
    const _dest = _buffer[0];
    const dataLength = _buffer[1];
    const _command = _buffer[3];
    const _data = _buffer.slice(4, dataLength)
    var UArray = new Uint8Array(3 + dataLength);
    UArray[0] = _dest;
    UArray[1] = dataLength;
    UArray[2] = _command;
    UArray.set(_data, 3);
    */
    const _data = getDataFromChunk(chunk);
    return Uint8Array.from([chunk[0],chunk[1],chunk[3],..._data])
}

/**
 * returns checksums as reversed array crcImplementation needs to return
 * unreversed array
 * @param {*} completPayload 
 * @param {*} crcImplementation 
 * @returns 
 */
const calculateCrc16ChecksumsWith = (completPayload,crcImplementation ) => {
    errorUint8(completPayload);
    const bufferForChecksumCalculation = Uint8Array.from(
        [completPayload[0],completPayload[1],completPayload[3],...getDataFromChunk(completPayload)
    ]);
    return crcImplementation(bufferForChecksumCalculation).reverse();
}

/**
 * 
 * @param {Uint8ArrayType} completPayload 
 * @returns {Array<number> | undefined}
 */
export const calcCrc16Js = completPayload => {

    errorUint8(completPayload);
    /**
     * 
     * @param {*} rawChecksums 
     * @returns 
     */
    const crc16xmodemJsToArray = rawChecksums => rawChecksums
        .toString(16).match(/.{1,2}/g)
        ?.map( (/** @type {string} */ val) => parseInt(val, 16));

    const crc16xmodemJsImpl = (/** @type {Uint8Array} */ raw) => crc16xmodemJsToArray(crc16xmodemJs(raw))
    
    return calculateCrc16ChecksumsWith(completPayload, crc16xmodemJsImpl);
    
}

/**
 * 
 * @param {Uint8ArrayType} unsignedButCompletPayload
 * @param {Uint8Array} CRCArray
 * @returns {Uint8ArrayType}
 */
const crc16sign = ( unsignedButCompletPayload,  CRCArray )=> {
    /*
    const CRCArray = calculateCrc16ChecksumsWith(completPayload,crcImplementation); //calcCrc16(completPayload) 
    if (!CRCArray) {
        console.log(completPayload)
        throw new Error('Could not Sign CRC16');
    }
    const { srcPosition, checksumPosition} = getPayloadPositionData(completPayload);
    completPayload[srcPosition] = CRCArray[0];
    completPayload[checksumPosition] = CRCArray[1];
    
    return completPayload;
    */
    if (!CRCArray) {
        console.log({unsignedButCompletPayload})
        throw new Error('Could not Sign CRC16');
    }
    
    const [ dest, dataLength, crcPart1, command] = unsignedButCompletPayload;
    
    //crc16sign(unsignedButCompletPayload, crc16xmodem)
    const signedPayload = Uint8Array.from([
        dest, dataLength,
        CRCArray[0],
        command,
        ...getDataFromChunk(unsignedButCompletPayload),
        CRCArray[1],
    ])
    
    Debug('esnext-cctalk/crc/crcMethods/crc16xmodem/debug')({ signedPayload })
    return signedPayload;
}

/**
 * 
 * @param {Uint8ArrayType} signedPayload
 * @param {*} signingMethod
 * @returns {boolean}
 */
const crc16verify = (signedPayload, signingMethod )=> {
    const { srcPosition, checksumPosition} = getPayloadPositionData(signedPayload);
    // NOTE: was dataEndPosition historicaly
    
    const crc16ChecksumsFromPayload = [signedPayload[srcPosition], signedPayload[checksumPosition]];
    
    const crc16VeriferPayload = signingMethod(signedPayload);
    const crc16ChecksumsFromVeriferPayload = [crc16VeriferPayload[srcPosition], crc16VeriferPayload[checksumPosition]];
    const isValid = (
        (crc16ChecksumsFromPayload[0] == crc16ChecksumsFromVeriferPayload[0]) && (crc16ChecksumsFromPayload[1] == crc16ChecksumsFromVeriferPayload[1])
    )
    
    Debug('esnext-cctalk::crc')(`
        ${crc16ChecksumsFromPayload[0]} == ${crc16ChecksumsFromVeriferPayload[0]}, 
        ${crc16ChecksumsFromPayload[1]} == ${crc16ChecksumsFromVeriferPayload[1]}
    `);
    return isValid;
    /*
    const crc16Checksums = calculateCrc16ChecksumsWith(signedPayload,crc16Implementation); //crc16Implementation(completPayload) //calcCrc16(completPayload);
    Debug('esnext-cctalk::crc')(`${crc16ChecksumsFromPayload[0]} == ${crc16Checksums[0]}, ${crc16ChecksumsFromPayload[1]} == ${crc16Checksums[1]}`);
    return crc16Checksums ? ((crc16ChecksumsFromPayload[0] == crc16Checksums[0]) && (crc16ChecksumsFromPayload[1] == crc16Checksums[1])) : false;
    */
}


//new 254
/**
 * maybe deprecated look into array2Object
 * also we use getMessage(buffer)
 * @param {Uint8ArrayType} _buffer 
 * @returns 
 */
const fromUint8Array = _buffer => {
    errorUint8(_buffer);
    const { 
        checksumPosition,srcPosition, dataLengthPosition ,destPosition, commandPosition 
    } = getPayloadPositionData(_buffer);
    
    const command = _buffer[commandPosition]
    
    const cctalkPayloadObject = {
        _dest: _buffer[destPosition],
        _dataLength: _buffer[dataLengthPosition],
        _src: _buffer[srcPosition],
        _command: command,
        _data: getDataFromChunk(_buffer),
        _checksum: _buffer[checksumPosition],
        _crcType: 0
    }
    
    return cctalkPayloadObject;
}

/**
 * 
 * @param {*} arr 
 * @returns 
 */
 export const getMessage = arr => {
    errorUint8(arr);
    
    const { destPosition, commandPosition } = getPayloadPositionData(arr);
    const command = arr[commandPosition]
    const data = getDataFromChunk(arr);
    const dest = arr[destPosition];
    
    //object2Array(messageObj)
    const Message = { 
        dest,
        command,
        data,
    }
    return Message
}

/**
 * 
 * @param {*} arr 
 * @returns 
 */
const array2Object = arr => {
    const [ dest, dataLength, srcOrCrc16, command ] = arr;
    
    const { checksumPosition } = getPayloadPositionData(arr);
    const data = getDataFromChunk(arr);
    const crc = arr[checksumPosition];
    
    //object2Array(messageObj)
    const Message = { 
        dest,
        dataLength,
        src: srcOrCrc16,
        command,
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
    const [ dest, dataLength, srcOrCrc16, command ] = arr;
    
    const { checksumPosition } = getPayloadPositionData(arr);
    const data = getDataFromChunk(arr);
    const crc = arr[checksumPosition];
    
    //object2Array(messageObj)
    const Message = { 
        dest,
        dataLength,
        src: srcOrCrc16,
        command,
        data,
        crc,
        get crcType() {
            if (crcMethods.crc8.verify(arr)) {
                return 8
            } 
            if (crcMethods.crc16xmodemJs.verify(arr)) {
                return 16
            }
            return
        },
        get verifyed() {
            return (!Message.crcType)
        }
    }
    return Message
}

/**
 * object2Array({ command , ?dataUint8Array, })
 * @param {*} messageObj 
 * @returns 
 */
export const object2Array = messageObj => {
    const { 
        dest = 2, 
        src = 1, /* This can also be checksum_1 of a crc16 signed package */
        command, 
        data = new Uint8Array(0), /* Buffer.from([]) */
        crc, 
        crcType = 8
    } = messageObj;

    const _buffer = Uint8Array.from([ dest, data.length , src, command, ...data, crc ]);
    
    // Sign the resulting _buffer if needed
    if (!crc && crcType) {
        const signingMethod = ( crcType === 8 ) ? crcMethods.crc8.sign : ( crcType === 16 ) ? crcMethods.crc16xmodemJs.sign : ()=>{/* NoOp */};
        signingMethod(_buffer);
    }
    verifyCCTalkMessage(_buffer)
    return _buffer
}




/**
 * 
 * @param {*} src number 0 = bus 1 = master
 * @param {*} dest number 40 is most time a billAcceptor
 * @param {number} crcType 16 or 8
 * @returns 
 */
export const getSendCommand = (
    src = 1, 
    dest = 2,  
    crcType = 8,
) => {
    const signingMethod = 
        ( crcType === 8 ) 
            ? crcMethods.crc8.sign
            : ( crcType === 16 ) 
                ? crcMethods.crc16xmodemJs.sign
                : ()=>{/* NoOp */};
    
    /**
     * 
     * @param {*} command 
     * @param {*} data 
     * @returns 
     */
    const sendCommand = ( command, data = new Uint8Array(0) ) => {
        const CCTalkPayload = Uint8Array.from(
            [dest, data.length, src, command, ...data,0]
        );
        signingMethod(CCTalkPayload);
        return CCTalkPayload;
    }
    return sendCommand
    
}

/**
 * 
 * @param {*} targetSpec { src, dest, crcSigningMethod }
  * @returns 
 */
 export const CreatePayload = (targetSpec) => {
    const { src, dest, crcSigningMethod } = targetSpec || { src: 1, des: 2, crcSigningMethod: crcMethods.crc8.sign };
    /**
     * 
     * @param {*} command 
     * @param {*} data 
     * @returns 
     */
    const createPayload = ( command, data = new Uint8Array(0) ) => {
        const CCTalkPayload = Uint8Array.from(
            [dest, data.length, src, command, ...data,0]
        );
        
        return crcSigningMethod(CCTalkPayload);
    }
    return createPayload;
}

/**
 * 
 * @param {number} src / crc16 verifyer
 * @param {number} dest 
 * @param {number} command 
 * @param {Uint8ArrayType} data 
 * @param {number} crcType 
 * @returns 
 */
export const CCTalkMessageCompat = (
    src = 0, // CCTalkBus default 0
    dest = 1, 
    command=254, // simplePoll
    data = new Uint8Array(0), 
    crcType = 8
) => {
    
    if (typeof command === 'undefined') {
        throw new Error('NO_COMMAND');
    } else if (typeof data === 'undefined') {
        throw new Error('NO_DATA');
    }
    
    const messageObj = { src, dest, command, data, crcType };

    const CompatMessage = {
        ...messageObj,
        _buffer: object2Array(messageObj),
    }
    
    return CompatMessage;

};

/** @typedef {Uint8Array} unsignedButCompletPayload*/

export const crcMethods = {
    crc16xmodem: {
        /**
         * @param {Uint8Array} unsignedButCompletPayload
         */
        sign(unsignedButCompletPayload) {            
            Debug('esnext-cctalk/crc/crcMethods/crc16xmodem/debug')({ unsignedButCompletPayload })
             //calcCrc16(completPayload) 
            const signedPayload = crc16sign( 
                unsignedButCompletPayload, 
                calculateCrc16ChecksumsWith(unsignedButCompletPayload, crc16xmodem) 
            );
            
            return signedPayload
        },
        /**
         * @param {Uint8Array} signedPayload
         */
        verify(signedPayload) {
            return crc16verify(signedPayload, crcMethods.crc16xmodem.sign )
        }
    },
    crc16xmodemJs: {
        /**
         * @param {Uint8Array} unsignedButCompletPayload
         */
        sign(unsignedButCompletPayload) {
            errorUint8(unsignedButCompletPayload);
            Debug('esnext-cctalk/crc/crcMethods/crc16xmodemJs/debug')({ unsignedButCompletPayload })
            /**
             * 
             * @param {*} rawChecksums 
             * @returns 
             */
            const crc16xmodemJsToArray = rawChecksums => rawChecksums
                .toString(16).match(/.{1,2}/g)
                ?.map( (/** @type {string} */ val) => parseInt(val, 16));
        
            const crc16xmodemJsImpl = (/** @type {Uint8Array} */ raw) => crc16xmodemJsToArray(crc16xmodemJs(raw));
            
            const signedPayload = crc16sign( 
                unsignedButCompletPayload, 
                calculateCrc16ChecksumsWith(unsignedButCompletPayload, crc16xmodemJsImpl) 
            );
    
            return signedPayload
        },
        /**
         * 
         * @param {*} completPayload 
         * @returns 
         */
        verify(completPayload) {
            return crc16verify(completPayload, crcMethods.crc16xmodemJs.sign )
        }
    },
    crc8: {
        /**
         * @param {Uint8Array} unsignedButCompletPayload
         */
        sign(unsignedButCompletPayload) {
            const signedPayload = crc8sign(unsignedButCompletPayload)
            Debug('esnext-cctalk/crc/crcMethods/crc16xmodem/debug')({ unsignedButCompletPayload, signedPayload})
            return signedPayload
        },
        /**
         * @param {Uint8Array} signedPayload
         * @returns {boolean}
         */
        verify(signedPayload) {
            errorUint8(signedPayload);
            const verificationPayload = crcMethods.crc8.sign(signedPayload);

            const { checksumPosition } = getPayloadPositionData(signedPayload);

            const expectedChecksum = verificationPayload[checksumPosition];
            const checksum = signedPayload[checksumPosition];

            return (checksum === expectedChecksum);
        }
    }
}

/**
 * 
 * @param {*} completPayload 
 * @returns 
 */
 export const verifyCCTalkMessage = completPayload => {
    Debug('esnext-cctalk/crc/info')(completPayload);
   
    for (const [methodName, methods] of Object.entries(crcMethods)) {
        if (methods.verify(completPayload)) {       
            Debug('esnext-cctalk/crc/verifyCCTalkMessage/debug')(methodName);
            return completPayload;
        }
    }

    const tryedMethods = Object.keys(crcMethods).join(', ');
    Debug('esnext-cctalk/crc/verifyCCTalkMessage/warning')(completPayload,tryedMethods);
    throw new Error(`CRC is none valid checked ${tryedMethods}`)
}