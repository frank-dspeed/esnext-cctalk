// if you install esnext-cctalk from github
// replace ../../ with esnext-cctalk
// Utils
import { delayResolvePromise } from '../../modules/promises-delayed.js';
const wait200ms = () => delayResolvePromise(200);

// Essentials
import { getConnection } from '../../src/cctalk-node.js';
import SerialPort from 'serialport';
import { write } from 'fs';
//const SerialPort = require('serialport')
const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 9600,
    autoOpen: true,
    dataBits: 8,
    stopBits: 1
});

// port can be only of type SerialPort in this implementation
const { getDeviceWriter } = getConnection(port);
const coinAcceptor = getDeviceWriter( 2, 'crc8' );

await wait200ms();
// 254 simplePoll
await coinAcceptor(254);
await wait200ms();
// 231 modifyInhibit Accept
await coinAcceptor(231, Uint8Array.from([255, 1]));
await wait200ms();
// 228 modifyMasterInhibit Uint8Array.from([0xFF])
await coinAcceptor(228, Uint8Array.from([0xFF]));
await wait200ms();

const readBufferedCredit = async () => {
    // 229 readBufferedCredit
    return await coinAcceptor(229).then(async eventResponse=>{
        // Here we get the status of inserted coins
        // You will want to use complex parsing logic here
        // and maybe also send extra commands via
        // await coinAcceptor(header, [data]) // => returns the response if it got a valid one
        console.log({ eventResponse })
        await wait200ms;
        return readBufferedCredit();
    }).catch(e=>wait200ms);

}

await readBufferedCredit().then(()=>readBufferedCredit())

export{}// Only here to indicate that this is a ESM Module

