// Using Device Detection
import detectDevices from 'esnext-cctalk/src/device-detection.js';
let i = 0;

const tryPoll = write => write(254).catch(()=>tryPoll(write))
let promiseChain = Promise.resolve();
detectDevices(async dev=>{
    console.log('Found', { dev })
    //if (i++ === 1) {
        // We have a perfect loop
        promiseChain = promiseChain
        .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
        .then(()=> tryPoll(dev.write).then(x=>console.log('connected:',x, { dev })) ) 
        //
    //}
    
})