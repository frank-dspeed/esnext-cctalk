/*
esnext-cctalk/node/connection/parser/onData/isAnswer/debug {
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug   command: {
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug     dest: 1,
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug     command: 0,
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug     data: Uint8Array(11) [
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug       3, 0, 0, 0, 0,
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug       0, 0, 0, 0, 0,
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug       0
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug     ]
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug   }
    esnext-cctalk/node/connection/parser/onData/isAnswer/debug } +0ms
  Uint8Array(16) [
    1, 11, 100,   
    0, 3, 0,
    0,  0,   0,   0, 0, 0,
    0,  0,   0, 199
    */

    /*
     coin: Uint8Array(16) [
  esnext-cctalk/billreader     1,
   11, 89,
     0, 9, 
     0,
       coin: Uint8Array(16) [
       1, 
       11, 89,  
        0, 9, 
        0, 0,  
        0,  0,   
        0, 0,
         0, 0, 
          0,  0,
           197
     ]
   } +0ms 0,  0,  0,   0, 0, 0,
       0,  0,  0, 197
     ]
   } +0ms
    */
/*
    console.log(await billReader(pub7.commands.readBufferedBill) )

    esnext-cctalk/billreader   coin: Uint8Array(16) [
        esnext-cctalk/billreader     1, 11, 16,  0, 8, 0,
        esnext-cctalk/billreader     0,  0,  0,  0, 0, 0,
        esnext-cctalk/billreader     0,  0,  0, 29
        esnext-cctalk/billreader   ]
        esnext-cctalk/billreader } +0ms
      ^C

      */

import { crcMethods } from './cctalk-crc.js';
const lbn1 = ( dest=40, sign=crcMethods.crc16xmodem.sign ) => {
  const deviceInfo = {
    productCode: 'LB BLN 1',
    equipmentCategoryId: 'Bill Validator',
    manufacturerId: 'Alberici'
  }
  
  //const isDevice = info => info[3].indexOf('LBN-1') > -1
  const eventCodes = {

  }

  const headers = {
    //1. Core Commands
    requestBuildCode: 192,
    requestProductCode: 244,
    requestEquipmentCategoryId: 245,
    requestManufacturerId: 246,
    simplePoll: 254,
    //2. Core Plus Commands
    resetDevice: 1,
    requestCommsRevision: 4,
    requestSoftwareRevision: 241,
    requestSerialNumber: 242,
    //3. Bill Validator Commands
    requestCurrencyRevision: 145,
    requestBillOperatingMode: 152,
    modifyBillOperatingMode: 153,
    routeBill: 154,
    requestCountryScalingFactor: 156,
    requestBillId: 157,
    readBufferedBill: 159,
    calculateRomChecksum: 197,
    requestOptionFlags: 213,
    requestDataStorageAvailability: 216,
    requestMasterInhibitStatus: 227,
    modifyMasterInhibitStatus: 228,
    requestInhibitStatus: 230,
    modifyInhibitStatus: 231,
    requestVariableSet : 247,
  }
  const commands = headers;

  const methods = { 
    toSignedPayload(header=headers.simplePoll,data = new Uint8Array()) {
      const CCTalkPayload = Uint8Array.from(
        [dest, data.length, 1, header, ...data,0]
      );
      return sign(CCTalkPayload);
    },    
    // 0xFFFF === All 0x0000 === none  
    modifyInhibitStatus(acceptanceMask = 0xFF ) {
        const command = headers.modifyInhibitStatus;
        const data = Uint8Array.from([ acceptanceMask & 0xFF, (acceptanceMask >> 8) & 0xFF ]);
        return methods.toSignedPayload(command, data);
    },
    // 0xFFFF === on 0x0000 === off  
    modifyMasterInhibitStatus(bool=true) {
        const command = headers.modifyMasterInhibitStatus;
        //const data = new Uint8Array(1).fill(bool ? 0xFF : 0x00);
        const data = Uint8Array.from([bool ? 0xFF : 0x00]);
        return methods.toSignedPayload(command, data);
    },
  }
  return {
    methods,
    crcMethods,
    commands,
    headers
  }
}

      /**
       * 
       * 
       
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 44,   0, 18, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     0,  0,  0, 204
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 44,   0, 18, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     0,  0,  0, 204
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 44,   0, 18, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     0,  0,  0, 204
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 44,   0, 18, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     0,  0,  0, 204
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 44,   0, 18, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     0,  0,  0, 204
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 44,   0, 18, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     0,  0,  0, 204
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms

  ader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 41,   0, 22, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     1,  3,  1, 239
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 41,   0, 22, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     1,  3,  1, 239
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 41,   0, 22, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     1,  3,  1, 239
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 41,   0, 22, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     1,  3,  1, 239
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 41,   0, 22, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     1,  3,  1, 239
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 41,   0, 22, 3,
  esnext-cctalk/billreader     1,  0,  1,   3,  1, 0,
  esnext-cctalk/billreader     1,  3,  1, 239
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
  esnext-cctalk/billreader   coin: Uint8Array(16) [
  esnext-cctalk/billreader     1, 11, 181,  0, 23, 0,
  esnext-cctalk/billreader     1,  3,   1,  0,  1, 3,
  esnext-cctalk/billreader     1,  0,   1, 78
  esnext-cctalk/billreader   ]
  esnext-cctalk/billreader } +0ms
  esnext-cctalk/billreader {
       */
export default lbn1