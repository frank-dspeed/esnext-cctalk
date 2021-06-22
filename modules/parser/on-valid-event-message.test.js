import { getEventsAsArrays,isValidEventPayload, getEventData, getEventHandler } from './on-valid-event-message.js'
import { eventCodesByNumber } from '../cctalk-bill-validator-eventcodes.js'
const AL06V = {
    "productCode": "AL06V-c",
    "equipmentCategoryId": "Coin Acceptor",
    "manufacturerId": "Alberici",
    "crcMethodName": "crc8",
    "destAdr": 2,
    "channels": [
      "rejected",
      "EU200A",
      "EU100A",
      "EU050A",
      "EU020A",
      "EU010A",
      "EU005A",
      "EU002A",
      "EU001A",
      "......",
      "......",
      "......",
      "......"
    ]
  }

const evH = getEventHandler( ev => {
    const { event, count } = ev;
    const [ eventCode, channel ] = event;
    if (eventCode === 1) { acceptInsertedBill(); };
    console.log( [ eventCodesByNumber[ eventCode ], AL06V.channels[ channel ] ], count ) 

})
const devices = [
    AL06V,
    {
      "productCode": "PUB-7",
      "equipmentCategoryId": "Bill Validator",
      "manufacturerId": "JCM",
      "crcMethodName": "crc16xmodem",
      "destAdr": 40,
      "channels": [
        "rejected",
        "EU0005A",
        "EU0010A",
        "EU0020A",
        "EU0050A",
        "EU0100A",
        "EU0200A",
        "EU0500A",
        ".......",
        ".......",
        ".......",
        ".......",
        "......."
      ]
    }
  ]
const ev = Uint8Array.from([1,11,2,0, 12, 
    0,3,
    1,3,
    0,0,
    0,0,
    0,0,
    255
])
evH(ev)
process.exit()
const testEv = Uint8Array.from([1,11,255,0, 4, 
    3,1, 
    2,1,
    1,1,
    4,1,
    5,1,
    255])


    ev = Uint8Array.from([1,11,2,0, 12, 
        1,3,
        0,3,
        0,0,
        0,0,
        0,0,
        255
    ])


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