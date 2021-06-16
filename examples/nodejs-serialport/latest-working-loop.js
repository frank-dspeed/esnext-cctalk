import getDevices from 'esnext-cctalk/src/device-detection.js';
import { delayResolvePromise } from 'esnext-cctalk/modules/promises-delayed.js';
import { headersMap } from '../../modules/cctalk-headers.js';
//const tryPoll = write => delayResolvePromise(1200).then(()=>write(254).catch(()=>tryPoll(write)));

const devices = []
getDevices(dev=> devices.push(dev));

setTimeout(()=>{
    
    setInterval( async () =>{
        try {  
            await Promise.allSettled(devices.map( async device => {
                if (device.equipmentCategoryId === 'Bill Validator') {
                    //return
                    await delayResolvePromise(100);
                    return device.write(headersMap.readBufferedBill).then(ev=>console.log( { ev })); // readVufferedBill 159
                }

                await device.write(headersMap.readBufferedCredit ).then(ev=>console.log( { ev })); // readBufferedCredit
            }));
            
        } catch (e) {

        }
        
    }, 500)
    
},1000)
