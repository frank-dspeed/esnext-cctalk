import getDevices from 'esnext-cctalk/modules/device-detection.js';
import { delayResolvePromise } from 'esnext-cctalk/modules/promise-utils.js';
import { headersByName } from 'esnext-cctalk/modules/cctalk-headers.js';
//const tryPoll = write => delayResolvePromise(1200).then(()=>write(254).catch(()=>tryPoll(write)));

const devices = await getDevices();



setTimeout(()=>{
    
    setInterval( async () =>{
        try {  
            await Promise.allSettled(devices.map( async device => {
                if (device.equipmentCategoryId === 'Bill Validator') {
                    //return
                    await delayResolvePromise(100);
                    return device.write(headersByName.readBufferedBill).then(ev=>console.log( { ev })); // readVufferedBill 159
                }

                await device.write(229).then(ev=>console.log( { ev })); // readBufferedCredit
            }));
            
        } catch (e) {

        }
        
    }, 500)
    
},1000)
