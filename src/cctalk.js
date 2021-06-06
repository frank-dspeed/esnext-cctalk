import 'types'; //Do not treeshake tthat if you want a dev build for production also strip comments
import { CCTalkParser } from './cctalk-parser.js';

/** @param {*} message */
const debug = message => 
    /** @param {*} msg */
    (...msg) => console.log(message,...msg)




/**
 * 
 * @param {*} stream 
 * @param {*} data 
 * @returns 
 */
function write(stream,data,encoding = 'utf8') {
  if (!stream.write(data, encoding)) {
    let deferedPromise = { resolve: 
        /**
         * 
         * @param {*} value 
         */
        value => {/**NOOP */}}
    stream.once('drain', () => {
      stream.write(data, encoding);
      deferedPromise.resolve(read(stream));
    });
    return new Promise(resolve=>deferedPromise.resolve = resolve);
  } else {
    return Promise.resolve(read(stream));
  }
}
// Should try to read until Timeout
/**
 * 
 * @param {*} stream 
 * @returns 
 */
function read(stream) {
  if (!stream.readable) {
    let deferedPromise = { resolve: 
        /**
         * 
         * @param {*} val 
         */
        (val) => {/**NOOP */}}
    stream.once('readable', () => 
      deferedPromise.resolve(stream.read())
    );
    return new Promise(resolve=>deferedPromise.resolve = resolve)
  } else {
    return Promise.resolve(stream.read())
  }
}


export const CCTalkSession = () => {
    const timeout = 120 * 1000; //2min
    const deffredPromise = {};
    const timeoutPromise = new Promise((resolve,reject) => Object.assign(deffredPromise, { resolve, reject }));
    const timeoutPointer = setTimeout(() => timeoutPromise.reject(new Error('timeout')),timeout)
    clearTimeout(timeoutPointer);
    const simplePoll = 254
    const connect = async () => {
      // open port
      const command = simplePoll;
      // send simplePoll 254 from device 0 (BUS)
    }
    
    return Promise.all([
      timeoutPromise,
      connect().then(()=>{
        // Configurate Acceptance
        // Enable Acceptance
        
        // getOrSet channel to decimal value map
        const currencyMap = {
          2: 2.00
        }
        // Handle Channel Type Answers for the session and Session State
        const methods = { 
          escrow(channel) {
            if (channel === 0) {
              debug('cctalk::device::events::type::rejected')('escrow','=>rejected');
              //emit('rejected');
              return
            } 
            const currency = currencyMap[channel]
            const bankNoteToBigToAccept = channel > 3;
            if (bankNoteToBigToAccept) {
              debug('cctalk::device::events::type::return')(currency,'routeReturnReject','=>routeBill(0)');
              //this.exec('routeBill', new Uint8Array([0])).catch((e)=>console.log(e))
              return
            } 
  
            debug('cctalk::device::events::type::routeBill(1)')(currency,'routeAccept', '=>routeBill(1)');
            //emit(impl.eventCodes[type], channel);
            //this.exec('routeBill',new Uint8Array([1])).catch((e)=>console.log(e))
        
          },
          accepted(channel) {}
        }
        const handler = parsePollResponseResult => {
          parsePollResponseResult.forEach(element => {
            const [channel, type] = element;
            methods[type](channel);
          });
          
        }
        // Start Poll Process handler()
        // Cleanup.
        // ?disable acceptance teardown device?
      })
    ]).catch(connectionErrors=>console.error(connectionErrors))
  
  }