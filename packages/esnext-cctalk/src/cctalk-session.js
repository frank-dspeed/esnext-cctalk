import getDevices from '../modules/device-detection.js';
import { delayResolvePromise } from '../modules/promise-utils.js'
import { headersByName } from '../modules/cctalk-headers.js'
import { getEventData,getEventsAsArrays,isValidEventPayload, getEventHandler } from '../modules/parser/on-valid-event-message.js'
import { EventEmitter } from 'events'
import { start } from 'repl';

/** @type {NodeJS.Timeout} */
export let reading;
export let ready = false;

/** @param {*} device */
const isBillValidator = device => device.equipmentCategoryId === 'Bill Validator'
/** @param {*} device */
const isCoinAcceptor = device => device.equipmentCategoryId === 'Coin Acceptor'
const billValidatorEventHandler = getEventHandler((/** @type {string | symbol} */ ev) => cctalkEvents.emit('event',ev));
const coinAcceptorEventHandler = getEventHandler((/** @type {string | symbol} */ ev) => cctalkEvents.emit('event',ev));
export const cctalkEvents = new EventEmitter();

const startReading = () => {
    reading = setInterval( async () =>{
        console.log('startR')
        try {  
            for (const device of devices) {
                if (isBillValidator(device)) {
                    return billValidatorEventHandler(await device.write(headersByName.readBufferedBill));
                    //return cctalkEvents.emit('event',await device.write(headersByName.readBufferedBill)) 
                        //.then((/** @type {any} */ ev)=>console.log( { ev }) ); // readVufferedBill 159
                }
                if (isCoinAcceptor(device)) {
                    coinAcceptorEventHandler(await device.write(headersByName.readBufferedCredit));
                    //cctalkEvents.emit('event', await device.write(headersByName.readBufferedCredit))
                        //.then((/** @type {any} */ ev)=>console.log( { ev })); // readBufferedCredit    
                }
                
            }
            
        } catch (e) {
            cctalkEvents.emit('error', e)
        }
        
    }, 500)
}
cctalkEvents.on('startReading', event => {
    if (!reading) {
        startReading();
    }
})
cctalkEvents.on('stopReading', event => {
    clearInterval( reading )
    //Start powerSave

})

const devices = await getDevices();

for (const device of devices) {
    await device.write(254);
    await device.write(231, Uint8Array.from([255, 1]));
    await device.write(228, Uint8Array.from([0xFF]));
}
ready = true;
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


/** @param  {Uint8Array} ev */
const readEv = ev => console.log( { ev }); // readVufferedBill 159

