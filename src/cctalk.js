export const CCTalkParser = ({ preservedDataBuffer = [], lastByteFetchTime = 0, maxDelayBetweenBytesMs = 50 } = {}) => {
    const parser = { preservedDataBuffer, lastByteFetchTime, maxDelayBetweenBytesMs, 
    //    buffers: [] 
    }
    parser._transform = (buffer , destination )=> {
       
        if (parser.maxDelayBetweenBytesMs > 0) {
          const now = Date.now();
          if (now - parser.lastByteFetchTime > parser.maxDelayBetweenBytesMs) {
            parser.preservedDataBuffer = [];
          }
          parser.lastByteFetchTime = now;
        }
        
        const Uint8ArrayView = new Uint8ClampedArray([
            ...parser.preservedDataBuffer,
            ...buffer
        ]);
            
        const dataLength = Uint8ArrayView[1];
        const endOfChunk = 5 + dataLength;
        const moreThen2bytes = Uint8ArrayView.length > 1;
        const completePayload = Uint8ArrayView.length >= endOfChunk;
        // CCTalk is a serial protocol it will never send 2 full packets
        // so we need no while loop!
        if (moreThen2bytes && completePayload) {
          // full CCTalk Payload accumulated
          const CCTalkPayload = new Uint8Array(Uint8ArrayView.slice(0, endOfChunk));
          //parser.buffers.push(CCTalkPayload)
          destination(CCTalkPayload);
          const perserveData = Uint8ArrayView.slice(endOfChunk, Uint8ArrayView.length);
          parser._transform( perserveData, destination)
          //parser.preservedDataBuffer = preserveData;  
        }
        parser.preservedDataBuffer = Uint8ArrayView;
        
    }
    // Instance of parser
    return parser;
}

/**
 * Parse the CCTalk protocol
 * @extends Transform
 * @summary A transform stream that emits CCTalk packets as they are received.
 * @example
const SerialPort = require('serialport')
const CCTalk = require('@serialport/parser-cctalk')
const port = new SerialPort('/dev/ttyUSB0')
const parser = port.pipe(new CCtalk())
parser.on('data', console.log)
 */
export const NodeStreamParser = (maxDelayBetweenBytesMs = 50 ) => {
    const parser = CCTalkParser({ maxDelayBetweenBytesMs });
            /*
            const CCTalkPayload = parser.buffers.pop();
            if (CCTalkPayload) {
                this.push(parser.buffers)
            }
            */
            //require('stream/promises')
    return import('stream')
        .then( ({Transform}) =>
            class NodeTransformStream extends Transform {
                _transform(buffer, _, cb) {
                    parser._transform(buffer , this.push);
                    cb();
                }
            }
        )
        .then( () => new NodeTransformStream() );
}

export const WebStreamParser = (maxDelayBetweenBytesMs = 50 ) => {
    const parser = CCTalkParser({ maxDelayBetweenBytesMs });

    const transform = async (chunk, controller) => {
        parser._transform(chunk, controller.enqueue);
        /*
        const CCTalkPayload = parser.buffers.pop();
        if (CCTalkPayload) {
            controller.enqueue(new Uint8Array(CCTalkPayload))
        }
        */
    }
    
    return transform;    
}
//new TransformStream({ start() {/* required. */ }, transform: CCTalkTransformStreamParser() })

const errorUint8Array = chunk => {
    if (!(chunk instanceof Uint8Array)) {
        //We need to work with int8 while nodeJS Works with int16
        throw new Error('_buffer is not Uint8Array')
    }
}

/**
 * 
 * @param { number[] | Uint8Array | Uint8ClampedArray } chunk 
 * @returns 
 */
const getChunkPositions = chunk => {
    errorUint8Array(chunk);
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

const getDataFromChunk = chunk => {
    errorUint8Array(chunk);
    const { dataStartPosition , dataEndPosition} = getChunkPositions(chunk);
    return new Uint8Array(chunk.slice(dataStartPosition , dataEndPosition));
}

/** start https://unpkg.com/browse/crc@3.8.0/crc16xmodem.js */  
/**
 * CRC
 * @param { Uint8Array } buf  
 * @returns 
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

const calcCrc8 = chunk => {
    errorUint8Array(chunk);
    const { checksumPosition } = getChunkPositions(chunk);

    let sum = 0;
    // Allows us to use a already signed chunk for verification
    chunk.forEach((byte, index) => {
        if (index === checksumPosition) { return };
        sum += (byte);
    })
    
    return 0x100 - sum % 0x100; //256 - sum % 256
}

const signCrc8 = chunk => {
    errorUint8Array(chunk);
    const checksum = Methods.calcSum(chunk)
    const { checksumPosition } = getChunkPositions(chunk);
    chunk[checksumPosition] = checksum;
    return chunk
}

const verifyCrc8 = chunk => {
    errorUint8Array(chunk);
    const { checksumPosition } = getChunkPositions(chunk);

    const checksum = chunk[checksumPosition];
    // We use != and not !== because we are not sure if we work with Uint8Arrays or not
    return (checksum != Methods.calcSum(chunk));
}

/**
 * Turns a CCTalk parser chunk and returns crc16 verfiyable Uint8Array
 * that contains only the relevant parts.
 * Allows us to use a already signed chunk for verification
 * @param {*} chunk already signed or unsigned 
 * @returns 
 */
const getCrc16Unit8Array = chunk => {
    errorUint8Array(chunk);
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
    return new Uint8Array([chunk[0],chunk[1],chunk[3],..._data])
}

const calcCrc16 = chunk => {

    const checksums = crc16xmodem(getCrc16Unit8Array(chunk));
    const checksumsArray = checksums
        .toString(16)
        .match(/.{1,2}/g)
        .map((val)=> parseInt(val, 16))
        .reverse(); 
    return checksumsArray;
}

const signCrc16 = chunk => {
    const { srcPosition, checksumPosition} = getChunkPositions(chunk);
    const CRCArray = calcCrc16(chunk) 
    
    chunk[srcPosition] = CRCArray[0];
    chunk[checksumPosition] = CRCArray[1];
    
    return chunk;
}

const crc16verify = chunk => {
    const { srcPosition, checksumPosition} = getChunkPositions(chunk);
    // NOTE: was dataEndPosition historicaly
    
    const currentCRC = [chunk[srcPosition], chunk[checksumPosition]];
    const CRCArray = calcCrc16(chunk);

    debug('ccMessage:crc')(`${currentCRC[0]} == ${CRCArray[0]}, ${currentCRC[1]} == ${CRCArray[1]}`);
    return ((currentCRC[0] == CRCArray[0]) && (currentCRC[1] == CRCArray[1]));
}


//new 254
const fromUint8Array = _buffer => {
    if (_buffer instanceof Uint8Array) {
        throw new Error('_buffer is not Uint8Array')
    }
    // parse command
    //this._buffer = src;
    const CCTalkMessage = {
        _dest: _buffer[0],
        _dataLength: _buffer[1],
        _src: _buffer[2],
        _command: _buffer[3],
        _data: _buffer.slice(4, _buffer[1]+4),
        _checksum: _buffer[_buffer[1] + 4],
    }
    
    if (!CCTalkMessage._checksum) {
        console.log(_buffer);
        throw new Error('NO_CHECKSUM');
    }
    
    // Check for CRC8
    if (crc8verify()) {
        CCTalkMessage._crcType = 8;
        debug('ccMessage:crc')('CRC8_CHECKSUM');
        return CCTalkMessage;
    } 
    
    if (crc16verify()) {
        CCTalkMessage._crcType = 16;
        debug('ccMessage:crc')('CRC16_CHECKSUM');
        return CCTalkMessage;
    } 
    
    debug('ccMessage:crc::warning')(this._buffer);
    return CCTalkMessage;
    //throw new Error('WRONG_CHECKSUM');
}


const array2Object = arr => {
    const [ dest, dataLength, srcOrCrc16, command ] = arr;
    
    const { checksumPosition } = getChunkPositions(arr);
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
            if (crc8verify()) {
                return 8
            } 
            if (crc16verify()) {
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
const object2Array = messageObj => {
    const { 
        dest = 2, 
        src = 1, /* This can also be checksum_1 of a crc16 signed package */
        command, 
        data = new Uint8Array(0), /* Buffer.from([]) */
        crc, 
        crcType = 8
    } = messageObj;

    const _buffer = [ dest, data.length , src, command, ...data, crc ]
    
    // Sign the resulting _buffer if needed
    if (!crc && crcType) {
        const signingMethod = ( crcType === 8 ) ? signCrc8 : ( crcType === 16 ) ? signCrc16 : ()=>{/* NoOp */};
        signingMethod(_buffer);
    }

    return _buffer
}

/**
 * 
 * @param {*} src 
 * @param {*} dest 
 * @param {*} crcType 
 * @param {*} data 
 * @returns 
 */
const getSendCommand = (
    src = 1, 
    dest = 2,  
    crcType = 8,
) => {
    const signingMethod = 
        ( crcType === 8 ) 
            ? signCrc8 
            : ( crcType === 16 ) 
                ? signCrc16 
                : ()=>{/* NoOp */};
            
    return ( command, data = new Uint8Array(0) ) => {
        const CCTalkPayload = new Uint8Array(
            dest, data.length, src, command, ...data
        );
        signingMethod(CCTalkPayload);
        return CCTalkPayload;
    }
    
}

const verifyCCTalkMessage = message => {
            
    if (crc8verify(message)) {       
        debug('ccMessage:crc')('CRC8_CHECKSUM');
        return message;
    } 
    
    if (crc16verify(message)) {
        debug('ccMessage:crc')('CRC16_CHECKSUM');
        return message;
    } 
    
    debug('ccMessage:crc::warning')(this._buffer);
    throw new Error('CRC is none valid checked CRC8 and CRC16')
    //return message;
}

const CCTalkMessageCompat = (
    src = 1, dest = 2, command, 
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
    
    verifyCCTalkMessage(CompatMessage._buffer)

    return CompatMessage;

};
