import Debug from './debug.js'
import { getConnection, getDeviceWriter } from './cctalk-node.js'
import { getSendCommand, getMessage  } from './cctalk-crc.js';
//const { emp800 } = await import('./cctalk-devices.js');
//const coinAcceptor = emp800();
import { al66v } from './device-al66v.js';
const coindDetectorType = al66v();

const debug = Debug('test')


import SerialPort from 'serialport';
const port = new SerialPort('/dev/ttyUSB0');

const connection = getConnection(port);
const coindDetector = getDeviceWriter(connection,2,8);
const billReader = getDeviceWriter(connection,40,16);

// Can send raw Commands
const simplePollCoinDetectorCrc8 = [ 2, 0, 1, 254, 255 ];
const simplePollBillAcceptor = [ 40, 0, 182, 254, 33 ];

// Can send Array Commands
//await coindDetector(254).then(console.log);
//await billReader(254).then(debug);

  //  const { readBufferedCredit, readBufferedCreditEvents } = coindDetectorType.methods;
    //coindDetector(...readBufferedCredit()).then(readBufferedCreditEvents).then( coin => {

    //coindDetector()

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

standardAddresses.forEach(async adr=>{
    const deviceWriter = [
        getDeviceWriter(connection,adr,8),
        getDeviceWriter(connection,adr,16)
    ].forEach( async (writer, i) => {
        await writer(254)
        detectedDevice.forEach(async (cmd)=>{
            await writer(cmd).then(getMessage).then(msg=> String.fromCharCode.apply(null, msg.data)).then(Debug('DETECTED'))
        })
    })
})