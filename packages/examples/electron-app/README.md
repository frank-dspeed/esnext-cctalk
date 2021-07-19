



```js
import getDevices from 'esnext-cctalk/modules/device-detection.js';
import { delayResolvePromise } from 'esnext-cctalk/modules/promise-utils.js'
import { headersByName } from 'esnext-cctalk/modules/cctalk-headers.js'
import { getEventData,getEventsAsArrays,isValidEventPayload } from 'esnext-cctalk/modules/parser/on-valid-event-message.js'
import { EventEmitter } from 'events'

/** @type {NodeJS.Timeout} */
let reading;

const cctalkEvents = new EventEmitter();
cctalkEvents.on('error', () => console.log('ready'))
cctalkEvents.on('ready', () => console.log('ready'))
cctalkEvents.on('event', event => console.log({ event }))
cctalkEvents.on('startReading', event => {
    console.log({ event })
    reading = setInterval( async () =>{
        try {  
            for (const device of devices) {
                if (device.equipmentCategoryId === 'Bill Validator') {
                    cctalkEvents.emit('event', 'from BillValidator')
                    await delayResolvePromise(100);
                    return cctalkEvents.emit('event',await device.write(headersByName.readBufferedBill)) 
                        //.then((/** @type {any} */ ev)=>console.log( { ev }) ); // readVufferedBill 159
                }
                cctalkEvents.emit('event', 'from CoinAcceptor')
                cctalkEvents.emit('event', await device.write(229))
                    //.then((/** @type {any} */ ev)=>console.log( { ev })); // readBufferedCredit
            }
            
        } catch (e) {
            cctalkEvents.emit('error', e)
        }
        
    }, 500)
    
    
})
cctalkEvents.on('stopReading', event => {
    console.log({ event })
    clearInterval( reading )
})

const devices = await getDevices();

for (const device of devices) {
    await device.write(254);
    await device.write(231, Uint8Array.from([255, 1]));
    await device.write(228, Uint8Array.from([0xFF]));
}

cctalkEvents.emit('ready', true)

/*
const isFromCoinAcceptor = payload => payload[2] === 2;
const isFromBillValidator = payload =>  payload[2] && payload[2] !== 2;
const processedEvents = []
const lastEvents = {
    billValidator: [],
    coinAcceptor: []
}
const hasNewEvents = (payload, lastEvent ) => lastEvent[5] ? lastEvent[5] - payload[5] : 5;

const incomingCCTalkPayloadHandler = payload => {
    if (isValidEventPayload(payload)) {
        if (isFromCoinAcceptor(payload)) {
            const newEventsCount = hasNewEvents(payload, lastEvents.coinAcceptor)
            if (newEventsCount) {
                lastEvents.coinAcceptor = payload;
                const newEvents = getEventsAsArrays(getEventData(payload));
                processedEvents.push(newEvents);
            }
        }
    }
    
}

*/

/** @param {*} device */
const isBillValidator = device => device.equipmentCategoryId === 'Bill Validator'
/** @param {*} device */
const isCoinAcceptor = device => device.equipmentCategoryId === 'Coin Acceptor'

/** @param  {Uint8Array} ev */
const readEv = ev => console.log( { ev }); // readVufferedBill 159
//const tryPoll = write => delayResolvePromise(1200).then(()=>write(254).catch(()=>tryPoll(write)));
/** @param {Uint8Array} payload */
const getTextMessage = payload => String.fromCharCode.apply(null, [...payload].slice(4,-1)) 


const startReading = () => {
    for (const device of devices) {
        if (isBillValidator(device)) {}
    }
}
/*

setTimeout(()=>{
    let lastEvId = 9
    setInterval( async () => {
        try{
            console.log(devices[1])
            process.exit()
            const addChannel = async channel => 
            await device.write(184,Uint8Array.from([ channel ]))
                .then(getTextMessage)
            // @ts-ignore
            await Promise.allSettled(devices.map( async device => {
                if (isBillValidator(device)) {
                    //return
                    return await delayResolvePromise(100);
                    //const e = await device.write(157,Uint8Array.from([ 3 ]))
                    //const d = [...e].slice(4,-1) // EU0020A
                    // console.log( String.fromCharCode.apply(null, d) )
                    
                    const ev = await device.write(159); // readVufferedBill 159
                    const evId = ev[4]
                    if (evId !== lastEvId) {
                        console.log({ ev })
                        await device.write(154, Uint8Array.from([1])) 
                    }
                    return
                    
                    
                }
                await readAllChannels(device)
                process.exit(0)
                await device.write(229).then(readEv);
                    
            }));
            
        } catch (e) {

        }
        
    }, 500)
    
},1000)
*/
```