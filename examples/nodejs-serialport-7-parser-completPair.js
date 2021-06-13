import '../src/types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import Debug from '../modules/debug.js';

import { OnCompletePayload } from '../src/on-payload-complet.js';
import { OnCCTalkCommandPairResponse } from '../modules/parse-command-reply-pairs.js'

import { crc16xmodemJs } from '../modules/crc/16-xmodemjs.js'
import { crc8 } from '../modules/crc/8.js'

const SerialPort = require('serialport')
const port = new SerialPort('/dev/ttyUSB0')

const onCompletePayload = OnCompletePayload;

const { CreateCCTalkRequest, onCCTalkCommandPairResponse } = OnCCTalkCommandPairResponse();
const createCCTalkReqestPromise = CreateCCTalkRequest(port);

port.on('data',data =>{
    onCompletePayload
    onCCTalkCommandPairResponse
});

/*
const createBillReaderRequestPromise = (header, data= new Uint8Array(0)) => 
    createCCTalkReqestPromise( crc16xmodemJs.sign( Uint8Array.from([40,data.length,1,header,...data,0]) ) );
*/
import { getCreatePayloadUsingCrcMethodName } from '../src/cctalk-crc.js';
const createBillReaderPayload =  getCreatePayloadUsingCrcMethodName( 40, 1,'crc16xmodem' )
const createBillReaderRequestPromise = (header=254, data= new Uint8Array(0)) => createCCTalkReqestPromise(createBillReaderPayload(header,data));
createBillReaderRequestPromise(254)