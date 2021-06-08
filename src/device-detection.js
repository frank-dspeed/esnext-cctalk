import Debug from './debug.js'
import { getConnection, getDeviceWriter } from './cctalk-node.js'
import { getSendCommand, getMessage  } from './cctalk-crc.js';
//const { emp800 } = await import('./cctalk-devices.js');
//const coinAcceptor = emp800();
import { al66v } from './device-al66v.js';
const coindDetectorType = al66v();
const timeoutPromise = () => new Promise((resolve, reject)=>setTimeout(()=>reject('timeout'),500))
const debug = Debug('test')
import Bluebird from 'bluebird';
const mapSeries = Bluebird.mapSeries
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

const tryWriter = async (adr,crcType) => {
    const writer = getDeviceWriter(connection,adr,crcType);
    return writer(254).then(()=>writer)
}

const detectDevice = async () => {
    return await Promise.race([
        tryWriter(2,8),
        tryWriter(2,16),
    ])
}
console.log('D',await detectDevice() )
const simpleButWorking = () => {

}

const standardAddresses = [2,40];
let timeOut = 50;
/*
mapSeries(standardAddresses,adr=>{
    return Promise.race([
        tryWriter(adr,8),
        tryWriter(adr,16),
    ])
}).then(writers=>{
    //mapSeries(writers,writer => {
      console.log( writers )
    //})
})
*/


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