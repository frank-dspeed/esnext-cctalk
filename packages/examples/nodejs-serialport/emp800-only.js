// Utils
import { delayResolvePromise } from 'esnext-cctalk/modules/promise-utils.js';
const wait200ms = () => delayResolvePromise(200);

// Essentials
import { getConnection } from 'esnext-cctalk/src/cctalk-node.js';
import { headersByName } from 'esnext-cctalk/modules/cctalk-headers.js'
import SerialPort from 'serialport';

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

await coinAcceptor(headersByName.simplePoll);
await coinAcceptor(headersByName.modifyInhibitStatus, Uint8Array.from([255, 1]));
await coinAcceptor(headersByName.modifyMasterInhibit, Uint8Array.from([0xFF]));

// @ts-ignore
const readBufferedCredit = async () => {
    // 229 readBufferedCredit
    return await coinAcceptor(headersByName.readBufferedCredit).then(async eventResponse=>{
        // Here we get the status of inserted coins
        // You will want to use complex parsing logic here
        // and maybe also send extra commands via
        // await coinAcceptor(header, [data]) // => returns the response if it got a valid one
        console.log({ eventResponse })
        await wait200ms();
        return readBufferedCredit();
    }).catch(e=>wait200ms());

}

await readBufferedCredit().then(()=>readBufferedCredit())

export {}// Only here to indicate that this is a ESM Module