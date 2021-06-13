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
const getDeviceInfo = async (writer) => {
    const result = []
    try {
        result.push( await writer(244).then(readTextMessage).catch(console.error) );
        result.push( await writer(245).then(readTextMessage).catch(console.error)  );
        result.push( await writer(246).then(readTextMessage).catch(console.error)  );
        //console.log('RESULT:', { productCode, equipmentCategoryId, manufacturerId})
    } catch(e) {
        console.error('SOMETHING WRONG')
    }
    const [ productCode, equipmentCategoryId, manufacturerId ] = result;
    return { productCode, equipmentCategoryId, manufacturerId }
}

/**
 * 
 * @param {number} adr 
 * @param {string} crcMethodName
 * @returns 
 */
const testAdr = async (adr, crcMethodName ) => {
    // 254 with all crc types
    const write = connection.getDeviceWriter(adr,crcMethodName);
    
    /*
    return writer(254).then( () => {
        return getDeviceInfo( writer )
    } );
    */
    
    return Promise.allSettled([
        write(254).then( () => {
            return getDeviceInfo( write ).then( info =>({
                write,
                info,
                crcMethodName,
                adr,
            }))
        }),
    ])
    
    
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
    40: 'billReader',
    2: 'coinAcceptor'
}

const findDevices2 = async function* () {
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        let found = await testAdr(adrAsInt, adrAsInt === 40 ? 'crc16xmodem': 'crc8');
        yield found
    }
};

const findDevices = async function* () {    
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        let found = await testAdr(adrAsInt, 'crc16xmodem');
        yield found
    }
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        let found = await testAdr(adrAsInt, 'crc8');
        yield found
    }
};

// @ts-ignore
export const detectDevices = async emit => {
    for await (let device of findDevices()) {
        // @ts-ignore
        if (device[0].value) {
            // @ts-ignore
            Debug('esnext-cctalk/device-detection/foundDevice')(device[0].value);
            if (emit) {
                // @ts-ignore
                emit(device[0].value)
            }
        }
    }
} 

export default detectDevices
//detectDevices(console.log)

const stableLoopAfterDetection = () => {
    //import getDevices from 'esnext-cctalk/src/device-detection.js';
    //import { delayResolvePromise } from 'esnext-cctalk/modules/promises-delayed.js';
    
    const tryPoll = write => delayResolvePromise(2000).then(()=>write(254).catch(()=>tryPoll(write)));
    getDevices(async dev=>{
        console.log('Found', { dev })    
        await tryPoll(dev.write).then(x=>console.log('connected:',x, { dev }));
    });
}