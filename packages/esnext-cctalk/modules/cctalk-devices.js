import { getEventParser } from './parser/on-valid-event-message.js'
import { cctalkEvents } from './cctalk-events.js'
import { headersByName } from './cctalk-headers.js';
import { getCreatePayloadUsingCrcMethodName } from './payload-helpers.js';


const CCTalkMaster = {
    detectDevices() {

    },
    powerSaving() {},
}

const coinAcceptor = () => {
    const eventParser = getEventParser();
    const write = getCreatePayloadUsingCrcMethodName(2,1,'crc8');
    return {
        async onPortOpen() {
            await write(headersByName.simplePoll);
            await write(headersByName.modifyInhibitStatus, Uint8Array.from([255, 1]));
            await write(headersByName.modifyMasterInhibit, Uint8Array.from([0xFF]));
        },
        async poll() {
            //const events = 
            eventParser( await write(headersByName.readBufferedCredit) )
                .forEach(({ event, count })=>{
                    const [channel, sorterPath] = event;
                    if (channel) {
                        cctalkEvents.emit('accepted',channel);
                    }
                });
            
        },
        write
    }
}


const billValidator = () => {
    
}