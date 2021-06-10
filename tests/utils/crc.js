
import {
crc16,
crc16ccitt_false,
crc16aug_ccitt,
crc16buypass,
crc16cdma2000,
crc16dds_110,
crc16dect_r,
crc16dect_x,
crc16dnp,
crc16en_13757,
crc16genibus,
crc16maxim,
crc16mcrf4cc,
crc16riello,
crc16t10_dif,
crc16teledisk,
crc16tms13157,
crc16usb,
crc_a,
crc16kermit,
crc16modbus,
crc16_x25,
crc16xmodem, default as c } from 'node-crc';
import { crcMethods } from '../../src/cctalk-crc.js'



//import c from 'node-crc'
//console.log(c)
/*
 esnext-cctalk::crc 23 == 7, 14 == 225 +0ms
  esnext-cctalk::crc Uint8Array(12) [
  esnext-cctalk::crc    1,  7, 23,  0, 69,
  esnext-cctalk::crc   85, 48, 48, 48, 53,
  esnext-cctalk::crc   65, 14
  esnext-cctalk::crc ] +0ms
  */

//const exampleData = Uint8Array.from([1,7,0,69,85,48,48,48,53,65])
// esnext-cctalk/node/connection/sendCommandPromise/debug { input: Uint8Array(5) [ 40, 0, 13, 254, 103 ] } +0ms
// esnext-cctalk/crc/info Uint8Array(5) [ 40, 0, 13, 254, 103 ] +0ms
// esnext-cctalk::crc 13 == 100, 103 == 71 +0ms
// esnext-cctalk::crc 13 == 182, 103 == 33 +0ms
// esnext-cctalk::crc::warning Uint8Array(5) [ 40, 0, 13, 254, 103 ] crc16xmodem, crc16xmodemJs, crc8 +0ms

const exampleData = [ 40, 0, 254 ]

console.log('crc16xmodemJs')
console.log(crcMethods.crc16xmodemJs.sign(Uint8Array.from([ 40, 0, 0, 254, 0 ])))

console.log('crc16xmodem')
console.log(crcMethods.crc16xmodem.sign(Uint8Array.from([ 40, 0, 0, 254, 0 ])))


/*
esnext-cctalk::crc::warning Uint8Array(12) [
    esnext-cctalk::crc::warning    1,  7, 23,  0, 69,
    esnext-cctalk::crc::warning   85, 48, 48, 48, 53,
    esnext-cctalk::crc::warning   65, 14
    esnext-cctalk::crc::warning ] 


const exampleData = [ 
    1,  7, 
    //23,
      0, 69,
    85, 48, 48, 48, 53,
    65, //14
]


Object.keys(c).filter(k=>k.indexOf('crc16')>-1).forEach(methodName=>{
    console.log(methodName)
    console.log(Uint8Array.from(c[methodName](Uint8Array.from(exampleData))))
})

//const result2 = crc.crc64(Buffer.from("world", "utf8")).toString("hex");
/*
const raw = exampleData// getCrc16Unit8Array(chunk);
    
    //console.log(crc.crc16(raw).toString(16).match(/.{1,2}/g)
    //?.map((val)=> parseInt(val, 16)))
    //process.exit()

    // our
    const checksums = crc16xmodem(raw);
    const checksumsArray = checksums.toString(16).match(/.{1,2}/g)
        ?.map((val)=> parseInt(val, 16))
        .reverse(); 
    


*/