import { getPort } from '../src/cctalk-node-port-mock.js'
import { getConnection, getDeviceWriter } from '../src/cctalk-node.js'
import { Debug } from '../src/debug.js'

//setInterval(()=>console.log('waiting'),500)

const c = getConnection(getPort(false))

const ask = getDeviceWriter(c,40,'crc16xmodem')
//const ask = ()=>{}

const answer = getDeviceWriter(c,1,'crc16xmodem')

//Promise.allSettled([w(254)]).then(console.log).catch(console.error)

//console.log(await w(254))
answer(254)
await answer(254)
//const question = ask(254).then( /** @param {string} x */ x=>console.log('question', x))
//console.log('asnwer', await answer(Uint8Array.from([1,0,0,0,0])))
//console.log('asnwer', await answer(Uint8Array.from([1,0,0,0,0])))
setTimeout(()=>c.port.write(Uint8Array.from([ 1, 0, 225, 254, 57])), 50)
    
    
    //const set = await Promise.allSettled([ question ])
    //console.log( { question, set})
    /*
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    console.log(await Promise.allSettled([ ask(254) ]) )
    
    //c.write('hi').then(()=>c.write('bye'))
    
    
    //c.write('hi').then(()=>c.write('bye'))
    */

