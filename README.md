# esnext-cctalk
A Collection of Methods to Work with Serial Devices that do use the CCTalk Protocol like the EMP800 and Taiko Pub 7

keywords: CCTalk, Taiko, Pub7, EMP800, serialport, Web Serial Api, Billyone, Nv9, nv10, Alberici, comestero

## Supported Devices
- Coin Acceptors
  - WHM: EMP800
  - Alberici: AL55/ AL06V
  - Comestero: RM5
- Bill Reader Banknote Reader 
  - Taiko: Pub 7
  - BillyOne, 
  - Nv9
  - Nv10
- Stacker exchange and other support units
  - Comming soon.

## Funding
This is a private Project that i do love to maintain as I use it in many of my own Projects and i try to backport all my Production knowleg to this project for free.
So i add new devices as i start using them and correct failures as soon as i spot them. If you also depend on this it would be nice to become a Sponsor then i could dedicate more time into this project.

## Notes
Every where Uint8Array() // Turns Integers into the int8 encoded formart.
In Some Years when the support is better we should switch to Uint8ClampedArray which restricts to numbers from 0=>255

## Understanding bytes and bitshifts in ECMAScript
a bit shift is equal to multiplying by 2^(# of bits+1), so instead of shifting the bits ```val = val << 8```,  just do ```val = val * 256 ```.

in CCTalk we work with 0x10 === 256 === val << 8. As the Protocol works with Integers 0 till 255 Unsigned bytes. And JS Works with int16 0x1000 int8 is 0x10 the data type is also called unsigned short

## Device Specification
Bus 001 Device 006: ID 10c4:ea60 Silicon Labs CP210x UART Bridge
{usbProductId: 60000, usbVendorId: 4292}

if you use a usb adapter you need to use the cctalk/src/device-detection.js to get information.

```js
const ExampleDeviceType = () => ({
  eventCodes, // used to map eventCodes to eventName
  handlers // used to handle events eventName(channel)
  commands, // used to map named commands to header/command codes
  channels, // used to map channel codes to currency Codes.
});

const exampleDevice = deviceType => {
  return {
    ...deviceType,
    dest, // The id of the device
    crcType, // 8 or 16 
    usbVendorId, // unsigned short usbVendorId; 0x2341
    usbProductId, // unsigned short usbProductId; 0x2341
  }
}

const connection = () => {
    // gets called when the device gets connected
    const myDevice = exampleDevice(ExampleDeviceType);
    let done = false
    const read = () => {
      const event = myDevice.next();
      // => do someting with event.value or event.done
      if (event.done || done) {
        //teardown
        return true
      }
      setTimeout(read,200);
    }
    
    // contains a function that returns a series of commands that should get executed
    // This handels the complet device life cycle
}

```


let port = await navigator.serial.requestPort();



## Features
- serialPromise - Interface Allows you to work in a sync way with a Async Serial Port Integration
- deviceDetection - via ccTalk bus and usb 
- Collections of readBuffered Reply Parsers and a Framework to add new definitions
- Collections of device and the CCTalk Spec they support 

## Minimum usage
```js
import { crcMethods } from 'cctalk-crc';

// Minimum 5 filds as per CCTalk Spec
port.write(crcMethods.crc8.sign(Uint8Array.from([40,0,0,254,0])));
// Verify that all data on the port is a validCCTalkMessage
port.on( 'data', onCrcVerifyedPayload(console.log));

/**
 * More Advanced Features
 **/
import { 
  // if used onCCtalkResponse is always the last callback
  CreateCCTalkRequest, onCCtalkResponse, 
  // Validation of CCTalk Message integrity
  onCompletPayload, 
  // Validation of additional CRC Integrity
  onCrcVerifyedPayload 
} from 'cctalk-parser';

// Or Verify and resolve cctalkRequest
// port.on( 'data', onCrcVerifyedPayload(serialWriteCCtalkMessage(console.log)) );
const cctalkRequest = CreateCCTalkRequest( port.write );
const processing = [ onCompletPayload, onCrcVerifyedPayload, onCCtalkResponse ];
port.on( 'data', data => {
  try { processing.forEach( method => method(data)) };
  // Optional Error Handling ES2020+
});

// a Promise that will timeout if there is no answer
// if there is a answer it will get handled by onCCtalkResponse

// Question 
await cctalkRequest(
  crcMethods.crc8.sign(
    Uint8Array.from([40,0,0,254,0])
  )
).then(
  verifyedValidCompletAnswerReply => 
    console.log(
      { verifyedValidCompletAnswerReply }
    )
);

// We can Answer on our own Question for testing

// Question not blocking via await will be resolved by Answer
const Question = cctalkRequest(
  crcMethods.crc8.sign(
    Uint8Array.from([40,0,0,254,0])
  )
).then(
  verifyedValidCompletAnswerReply => 
    console.log(
      { verifyedValidCompletAnswerReply }
    )
);

// Answer Blocking - Question and Answer returns with same value
const Answer = await cctalkRequest(
  crcMethods.crc8.sign(
    Uint8Array.from([1,0,0,0,0])
  )
).then(
  verificationEcho => 
    console.log(
      { verificationEcho }
    )
);

```

## Debug settings
sudo DEBUG=*,-*::debug,-serialport* node basic-tests.js 
// NODE_ENV=production === disable logging

```
const testEvents = getSendCommand(2,1,8)
/*
await connection.parserWrite(testEvents(0,Uint8Array.from([ 17,
  1, 1, 1, 0, 0,
  0, 0, 0, 0, 0
]))).then(debug)
*/

```
