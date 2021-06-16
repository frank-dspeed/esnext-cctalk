import Debug from '../modules/debug.js'
import { getConnection } from './cctalk-node.js'
import { getMessage } from '../modules/payload-helpers.js'
import { delayResolvePromise } from '../modules/promises-delayed.js';

import SerialPort from 'serialport';
const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 9600,
    autoOpen: true,
    dataBits: 8,
    stopBits: 1
});

const connection = getConnection(port);

const detectedDevice = {
    246: 'requestManufacturerId', //Core commands
    245: 'requestEquipmentCategoryId', //Core commands
    244: 'requestProductCode', //Core commands
}

/** @param {Uint8Array} payload*/
const readTextMessage = payload => String.fromCharCode.apply(null, [...getMessage(payload).data])

/**
 * 
 * @param {*} writer 
 * @returns 
 */
export const getDeviceInfo = async (writer) => {
    try {
        const result = [
            await writer(244).then(readTextMessage).catch(console.error),
            await writer(245).then(readTextMessage).catch(console.error),
            await writer(246).then(readTextMessage).catch(console.error)
        ];
        const [ productCode, equipmentCategoryId, manufacturerId ] = result;
        return { productCode, equipmentCategoryId, manufacturerId }    
    } catch(e) {
        console.error('SOMETHING WRONG')
    }
    
}

/**
 * 
 * @param {number} destAdr 
 * @param {string} crcMethodName
 * @returns 
 */
const testAdr = async ( destAdr, crcMethodName ) => {
    // 254 with all crc types
    const write = connection.getDeviceWriter( destAdr, crcMethodName );
    try {
        await write(254)
        const result = [
            await write(244).then(readTextMessage),
            await write(245).then(readTextMessage),
            await write(246).then(readTextMessage),
        ];
        const [ productCode, equipmentCategoryId, manufacturerId ] = result;

        return {
            write,
            productCode, 
            equipmentCategoryId, 
            manufacturerId,
            crcMethodName,
            destAdr,
        }

    } catch (e) {
        // Nothing found 
        console.log('we got a timeout nothing special')
    }
    
    
    
    
    if (adr === 2) {
        const crc8Writer = connection.getDeviceWriter(adr,'crc8');
        return await crc8Writer(254).then( () => {
            return getDeviceInfo( crc8Writer )
        });
    } 
    
    if (adr === 40) {
        const crc16Writer = connection.getDeviceWriter(adr,'crc16xmodem');
        return await crc16Writer(254).then( () => {
            console.log('found crc16xmodem',adr)
            return getDeviceInfo( crc16Writer );
        });   
    }
    
    //await getDeviceWriter(connection,adr,'crc16xmodemJs');
    // request info with correct crc type
}
const deviceTypes = {
    'Bill Validator': 40,
    'Coin Acceptor': 2, 
}

const findDevices2 = async function* () {
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        let found = await testAdr(adrAsInt, adrAsInt === 40 ? 'crc16xmodem': 'crc8');
        yield found
    }
};

const crcMethods = [ 'crc8', 'crc16xmodem' ]
const findDevices = async function* () {    
    for (const crcMethodName of crcMethods) {
        for (const [name, destAdr] of Object.entries(deviceTypes)) {
            try {
                let found = await testAdr(destAdr, crcMethodName);
                yield found
            } catch (e) {
                // Nothing found 
            }
        }
    }
};

// @ts-ignore
export const detectDevices = async emit => {
    for await (let device of findDevices()) {
        // @ts-ignore
        if (device) {
            // @ts-ignore
            Debug('esnext-cctalk/device-detection/foundDevice')(device);
            if (emit) {
                // @ts-ignore
                emit(device)
            }
        }
    }
} 

export default detectDevices;