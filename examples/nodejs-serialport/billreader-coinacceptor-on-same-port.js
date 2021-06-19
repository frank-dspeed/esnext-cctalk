import getDevices from '../..//src/device-detection.js';
import { delayResolvePromise } from '../..//modules/promises-delayed.js';
import { headersByName } from '../../modules/cctalk-headers.js';
//const tryPoll = write => delayResolvePromise(1200).then(()=>write(254).catch(()=>tryPoll(write)));

import { getEventData,getEventsAsArrays,isValidEventPayload } from '../..//modules/parser/on-valid-event-message.js'

const devices = await getDevices();
for (const device of devices) {
    await device.write(254);
    await device.write(231, Uint8Array.from([255, 1]));
    await device.write(228, Uint8Array.from([0xFF]));
    // Enter Loop
}

setTimeout(()=>{
    
    setInterval( async () =>{
        try {  
            for (const device of devices) {
                if (device.equipmentCategoryId === 'Bill Validator') {
                    //return
                    await delayResolvePromise(100);
                    return device.write(headersByName.readBufferedBill).then(ev=>console.log( { ev })); // readVufferedBill 159
                }

                await device.write(229).then(ev=>console.log( { ev })); // readBufferedCredit
            }
            
        } catch (e) {

        }
        
    }, 500)
    
},1000)
