import Debug from 'esnext-cctalk/src/debug.js'
import { getConnection, getDeviceWriter } from 'esnext-cctalk/src/cctalk-node.js'
import { getSendCommand, getMessage  } from 'esnext-cctalk/src/cctalk-crc.js';
//const { emp800 } = await import('esnext-cctalk/src/cctalk-devices.js');
//const coinAcceptor = emp800();
import { al66v } from 'esnext-cctalk/src/device-al66v.js';
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
const detedDevice = [
       246, //Request manufacturer id //Core commands
        245, //Request equipment category id //Core commands
        244, //Request product code //Core commands
        243, //Request database version //Coin Acceptor commands
        242, //Request serial number //Core Plus commands
        241, //Request software revision //Core Plus commands
].forEach(async (cmd)=>{
    coindDetector(cmd).then(Debug('DETECTED'))
})