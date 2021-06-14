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
const coindDetector = getDeviceWriter(connection,2,'crc8');
const billReader = getDeviceWriter(connection,40,'crc16xmodemJs');

// Can send raw Commands
const simplePollCoinDetectorCrc8 = [ 2, 0, 1, 254, 255 ];
const simplePollBillAcceptor = [ 40, 0, 182, 254, 33 ];

// Can send Array Commands
//await coindDetector(254).then(console.log);
await billReader(254).then(debug);


// Quick Way to test the parser implementation 
//connection.parserWrite(Uint8Array.from(simplePollBillAcceptor))
//await connection.parserWrite(Uint8Array.from([ 1, 0, 48, 0, 55 ])).then(debug)
//await connection.parserWrite(Uint8Array.from([ 1, 0, 48, 0, 55 ])).then(debug)


// Can send Device Related Commands with custom response handler
/*
setInterval(async () => {
  {
    const { readBufferedCredit, readBufferedCreditEvents } = coindDetectorType.methods;
    coindDetector(...readBufferedCredit()).then(readBufferedCreditEvents).then( coin => {
      if (coin) {
        Debug('test2')({ coin })
        return
      }
      // Nothing bad happened no one did throw something in
    });
  }

},200)
*/
import { taikoPub7 } from 'esnext-cctalk/src/cctalk-devices.js'
const pub7 = taikoPub7();
var EU_AS_HEX = new Uint8Array([69,85])
/*            
await billReader(pub7.commands.requestBillId, new Uint8Array([1]))  
await billReader(pub7.commands.requestBillId, new Uint8Array([1]))
await billReader(pub7.commands.requestBillId, new Uint8Array([2]))
await billReader(pub7.commands.requestBillId, new Uint8Array([3]))
await billReader(pub7.commands.requestCountryScalingFactor, EU_AS_HEX)
*/
//await billReader(pub7.commands.requestCurrencyRevision, EU_AS_HEX) // not supported by billy one
await billReader(pub7.commands.modifyBillOperatingMode, new Uint8Array([3])) // NO ESCROW NO STACKER 3 = both enabled 2 = only stacker
await billReader(152) 

//this.setAcceptanceMask(); // 0xFFFF modifyInhibitStatus 255,255 // 255 1 0 0 0 0 0 0 //TODO: Needs Check  this.setAcceptanceMask(0xFFFF);
await billReader(pub7.commands.modifyMasterInhibit, new Uint8Array([0xFF]))
//Pub 7 takes Array(3).fill(0xFF) // Alberci takes Array([0xFF,0x0B]) [255,1]
await billReader(pub7.commands.modifyInhibitStatus, new Uint8Array([255,1])) // [255,1] ==== alll [255,255,255]
//this.enableAcceptance(); // modifyMasterInhibit 1

// LBN1 230 && 227requestInhibitStatus
//await billReader(230) //=>  data: Uint8Array(2) [ 31, 0 ]
//await billReader(227) //=> data: Uint8Array(1) [ 1 ] 

// Connection
setInterval(async () => {
  // Billreader
  
  {
    billReader(pub7.commands.readBufferedBill)
    //.then(readBufferedCreditEvents)
    
    .then( 
      /** @param {number} coin */
      coin => {
        if (coin) {
          Debug('esnext-cctalk/billreader')({ coin })
          return
        }
        // Nothing bad happened no one did throw something in
      }
    );
  }
  
  // Coindetector
  
  {
    const { readBufferedCredit, readBufferedCreditEvents } = coindDetectorType.methods;
    coindDetector(...readBufferedCredit()).then(readBufferedCreditEvents).then( coin => {
      if (coin) {
        Debug('test2')({ coin })
        return
      }
      // Nothing bad happened no one did throw something in
    });
  }


},400)




//await billReader(pub7.commands.modifyMasterInhibit, 
/* Old Working method i am not aware while this worked
Buffer.from( 
  //Array[Array] looks wrong but maybe produced right results? Should be 0xFF to accept
  [[1]] 
)
*/ /*
new Uint8Array([0xFF])
);


*/


//port.write(new Uint8Array(simplePollBillAcceptor));
//setTimeout(()=>port.write(new Uint8Array(simplePollCoinDetectorCrc8)),500)
// Coindetector is using CrcType 8 src is master 1 destionation is 2 default for coin acceptors
//const coinSendCommand = CCTalkCrcTools.getSendCommand(1,2,8)
//Returns array [command, data]
//const sendMethod = (methodName, arg ) => coinSendCommand(...coinAcceptor.methods[methodName](arg));
// BillAcceptor is using CrcType 16 src is master 1 destionation is 40 default for bill acceptors
//const billSendCommand = CCTalkCrcTools.getSendCommand(1,40,16)
    //port.write(coinSendCommand(coinAcceptor.commands.simplePoll));
    //await sendCommandPromise(coinSendCommand(1));
  
  //  await sendCommandPromise(sendMethod('modifyMasterInhibit',true));
  //  await sendCommandPromise(sendMethod('setAcceptanceMask',0xFFFF));

//    await sendCommandPromise(coinSendCommand(231), new Uint8Array([255]));
//    await sendCommandPromise(coinSendCommand(coinAcceptor.commands.simplePoll));
    //await sendCommandPromise(coinSendCommand(230));
    //await sendCommandPromise(coinSendCommand(188));
    
    
    //setTimeout(()=>port.write(sendMethod('modifyMasterInhibit',true)),500);
    //setTimeout(()=>port.write(sendMethod('setAcceptanceMask',0xFF)),601);

    //setTimeout(()=>port.write(coinSendCommand(coinAcceptor.commands.simplePoll)),1000);
    //setTimeout(()=>port.write(billSendCommand(254)),500)
    //console.log(coinSendCommand(254),billSendCommand(254));
    
    //console.log(sendMethod('modifyMasterInhibit',true))
    //console.log(coinSendCommand(...coinAcceptor.methods.modifyMasterInhibit(true)),coinAcceptor.methods.modifyMasterInhibit(true))
