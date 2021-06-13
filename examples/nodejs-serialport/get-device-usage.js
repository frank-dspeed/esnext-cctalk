import detectDevices from '../../src/device-detection.js';
import { delayResolvePromise } from '../../modules/promises-delayed.js';
let i = 0;

// @ts-ignore
const tryPoll = write => delayResolvePromise(1000).then(write(254).catch(()=>tryPoll(write)));
let promiseChain = Promise.resolve();
// @ts-ignore
detectDevices(async dev=> {
    console.log('Found', { dev })
    //if (i++ === 1) {
        // We have a perfect loop
        promiseChain = promiseChain
        .then()
        .then(()=> tryPoll(dev.write).then(x=>console.log('connected:',x, { dev })) ) 
        //
    //}
    
})
