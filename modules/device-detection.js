import Debug from './debug.js'
import { getConnection } from '../src/cctalk-node.js'
import { getMessage } from './payload-helpers.js'
import { getAsyncIterableFromArrayOfAsyncFns } from './promise-utils.js'
// @ts-ignore
const isBillValidator = device => device.equipmentCategoryId === 'Bill Validator';
// @ts-ignore
const isCoinAcceptor = device => device.equipmentCategoryId === 'Coin Acceptor';

import SerialPort from 'serialport';
const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 9600,
    autoOpen: true,
    dataBits: 8,
    stopBits: 1
});

const connection = getConnection(port);

const detectedDevice = {
    '246': 'requestManufacturerId', //Core commands
    '245': 'requestEquipmentCategoryId', //Core commands
    '244': 'requestProductCode', //Core commands
}
//  [...payload].slice(4,-1)
/** @param {Uint8Array} payload*/
const readTextMessage = payload => String.fromCharCode.apply(null, [...getMessage(payload).data])

/**
 * returns device or void
 * @param {number} destAdr 
 * @param {string} crcMethodName
 * @returns 
 */
const testAdr = async ( destAdr, crcMethodName ) => {
    // 254 with all crc types
    const write = connection.getDeviceWriter( destAdr, crcMethodName );
    //await delayResolvePromise(800)
    
    const simplePollWorks = await write(254).catch(console.log)
    if (!simplePollWorks) {
        return
    }

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
                //await delayResolvePromise(200)
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

}

const detectDevices = async () => {
    const  arrayAsyncFns = [
        ()=> testAdr(40, 'crc8'),
        ()=> testAdr(2, 'crc8'),
        ()=> testAdr(40, 'crc16xmodem')
    ] 
	const iter = getAsyncIterableFromArrayOfAsyncFns(arrayAsyncFns)
	const devices = []
    for await (const value of iter) {
        devices.push(value)
	}
    return devices;
}



export default detectDevices;