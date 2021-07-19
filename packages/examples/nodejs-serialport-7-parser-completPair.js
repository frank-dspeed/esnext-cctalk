import 'esnext-cctalk/src/types.js'; //Do not treeshake that if you want a dev build for production also strip comments

import { OnPayloadComplet } from 'esnext-cctalk/src/on-payload-complet.js';
import { getCommandPromiseMethods } from 'esnext-cctalk/modules/promise-utils.js';

const SerialPort = require('serialport')
const port = new SerialPort('/dev/ttyUSB0')

const onCompletePayload = OnPayloadComplet;

const { createCommandPromise, cctalkCommandPromiseHandler } = getCommandPromiseMethods();

port.on('data',data =>{
    onCompletePayload
    cctalkCommandPromiseHandler
});

/* Using the low level methods
import { crc16xmodemJs } from '../modules/crc/16-xmodemjs.js'
import { crc8 } from '../modules/crc/8.js'
const createBillReaderRequestPromise = (header, data= new Uint8Array(0)) => 
    createCommandPromise( crc16xmodemJs.sign( Uint8Array.from([40,data.length,1,header,...data,0]), port.write ) );
*/

import { CreatePayloadUsingCrcMethodName } from 'esnext-cctalk/src/cctalk-crc.js';
const createBillReaderPayload =  CreatePayloadUsingCrcMethodName( 40, 1,'crc16xmodem' )
const createBillReaderRequestPromise = (header=254, data= new Uint8Array(0)) => createCommandPromise( createBillReaderPayload(header,data), port.write );
createBillReaderRequestPromise(254)