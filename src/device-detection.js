import Debug from './debug.js'
import { getConnection, getDeviceWriter } from './cctalk-node.js'
import { getSendCommand, getMessage  } from './cctalk-crc.js';
//const { emp800 } = await import('./cctalk-devices.js');
//const coinAcceptor = emp800();
import { al66v } from './device-al66v.js';
const coindDetectorType = al66v();
const timeoutPromise = () => new Promise((resolve, reject)=>setTimeout(()=>reject('timeout'),50))
const debug = Debug('test')


import SerialPort from 'serialport';
const port = new SerialPort('/dev/ttyUSB0');

const connection = getConnection(port);

const detectedDevice = [
       246, //Request manufacturer id //Core commands
        245, //Request equipment category id //Core commands
        244, //Request product code //Core commands
        243, //Request database version //Coin Acceptor commands
        242, //Request serial number //Core Plus commands
        241, //Request software revision //Core Plus commands
]

// .forEach(async (cmd)=>{
//     coindDetector(cmd).then(getMessage).then(msg=> String.fromCharCode.apply(null, msg.data)).then(Debug('DETECTED'))
// })


const standardAddresses = [2,40];

for (const adr of standardAddresses) {
    await Promise.race([
        getDeviceWriter(connection,adr,8),
        getDeviceWriter(connection,adr,16),
        timeoutPromise(),
    ]).then(async writer=>{
      Debug('found')({writer})
       const foundDevice = [];
       for (const method of detectedDevice) {
          foundDevice.push(await writer(method));
       }
       console.log('don')
       const humandReadable = foundDevice.map(getMessage)
       console.log('don'{ humandReadable, foundDevice})
       //.map(msg=>String.fromCharCode.apply(null, msg.data));
       Debug('foundDevice',humandReadable)
    })
}
/*
standardAddresses.forEach(async adr=>{
    const deviceWriter = [
        getDeviceWriter(connection,adr,8),
        getDeviceWriter(connection,adr,16)
    ].forEach( async (writer, i) => {
        Promise.race()
        await writer(254)
       
    })
 /*
    detectedDevice.forEach(async (cmd)=>{
        await writer(cmd).then(getMessage).then(msg=> String.fromCharCode.apply(null, msg.data)).then(Debug('DETECTED'))
    })

})
    */