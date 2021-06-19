import { getEventsAsArrays,isValidEventPayload, getEventData } from './on-valid-event-message.js'
const testEv = Uint8Array.from([1,11,255,0, 4, 
    3,1, 
    2,1,
    1,1,
    4,1,
    5,1,
    255])

console.log(isValidEventPayload(testEv))
console.log(getEventsAsArrays(getEventData(testEv)))
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
                const newEvents = payload.slice(6, 6 + newEventsCount * 2);
                processedEvents.push(newEvents)
            }
        }
    }
    
}
*/