import Debug from '../modules/debug.js'
import { getConnection } from './cctalk-node.js'
import { getMessage } from '../modules/payload-helpers.js'
import { delayResolvePromise } from '../modules/promises-delayed.js';
// @ts-ignore
const isBillValidator = device => device.equipmentCategoryId === 'Bill Validator'
// @ts-ignore
const isCoinAcceptor = device => device.equipmentCategoryId === 'Coin Acceptor'

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
//  [...payload].slice(4,-1)
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
    await delayResolvePromise(200)
    try {
        const r = await write(254).then(x=>console.log('x',x))     
        console.log( { r } )
        process.exit()
        const result = [
            await write(244).then(readTextMessage),
            await write(245).then(readTextMessage),
            await write(246).then(readTextMessage),
        ];
        const [ productCode, equipmentCategoryId, manufacturerId ] = result;
        const device = {
            write,
            productCode, 
            equipmentCategoryId, 
            manufacturerId,
            crcMethodName,
            destAdr,
            channels: ['rejected']
        }
               
        if (isCoinAcceptor(device)) {
            console.log('xxxxxC',isCoinAcceptor(device))
            
            // Read Channels
            const possibleChannels = Array
                .from({length: 12}, (_, i) => i + 1)
            
            for (const channel of possibleChannels) {
                try {
                    await delayResolvePromise(200)
                    device.channels.push( await device.write(184,Uint8Array.from([ channel ])).then(readTextMessage) );
                    //await delayResolvePromise(200)
                } catch(e) {
                    //timeouts if no channel exists
                    console.log(e)
                    process.exit()
                }
            }
            return device;
            
        }

        if (isBillValidator(device)) {
            console.log('xxxxxB',isBillValidator(device))
            
            const possibleChannels = Array
                .from({length: 12}, (_, i) => i + 1)

            for (const channel of possibleChannels) {
                try {
                    //await delayResolvePromise(200)
                    const bc = await device.write(157,Uint8Array.from([ channel ])).then(readTextMessage);       
                    device.channels.push( bc);
                    //await delayResolvePromise(200)
                } catch(e) {
                    //timeouts if no channel exists
                    console.log(e)
                    process.exit()
                }
            }
            return device;    
        }

        throw new Error(`Device Not Found on: ${destAdr} with ${crcMethodName}`)

    } catch (e) {
        // Nothing found 
        console.log('we got a timeout nothing special', {e})
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
    const foundDevices = []
    const d = await findDevices().next()
    console.log({ d })
    process.exit()
    /*
    for await (let device of findDevices()) {
        // @ts-ignore
        if (device) {
            
            // @ts-ignore
            Debug('esnext-cctalk/device-detection/foundDevice')(device);
            foundDevices.push(device);
        }
    }
    */
    await delayResolvePromise(500)
    if (emit) {
        // @ts-ignore
        emit(foundDevices)
    }
    return foundDevices
} 

export default detectDevices;