import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import { verifyCCTalkMessage } from './cctalk-crc.js'
import { getMessage } from '../modules/payload-helpers.js'
import Debug from '../modules/debug.js';

/** @param {*} onCompletPayloadInstance */
const checkDelayAndResetPreservedDataBufferIfneeded = onCompletPayloadInstance => {
  const { 
      maxDelayBetweenBytesMs, 
      lastByteFetchTime,
  } = onCompletPayloadInstance;
  
  if (maxDelayBetweenBytesMs > 0) {
      const now = Date.now();
      const delayBetweenLastByte = now - lastByteFetchTime;
      if (delayBetweenLastByte > maxDelayBetweenBytesMs && onCompletPayloadInstance.preservedDataBuffer.length) {
        Debug('onCompletPayloadInstance/checkDelayAndResetPreservedDataBufferIfNeeded/discard/debug')(onCompletPayloadInstance.preservedDataBuffer.join(','))
        onCompletPayloadInstance.preservedDataBuffer = new Uint8Array(0);
      }
      onCompletPayloadInstance.lastByteFetchTime = now;
  }
}

/**
 * This parser makes sure that only valid CCTalkMessages/Payloads
 * get emitted it drops false messages as per CCTalk Specs
 * @function [OnPayloadComplet]
 * @param {number} maxDelayBetweenBytesMs 
 * @returns {onCompletPayloadInstance}
 */
export const OnPayloadComplet = ( maxDelayBetweenBytesMs = 50 ) => {

  const onCompletPayloadInstance = { 
      maxDelayBetweenBytesMs,
      /** @type {OnPayloadCompletTransformFn} */
      _transform: (buffer , destination ) =>  { destination(buffer); },
      preservedDataBuffer: new Uint8Array(0), 
      lastByteFetchTime: 0,
  }

  
  /** @type {OnPayloadCompletTransformFn} */    
  onCompletPayloadInstance._transform = ( buffer, destination ) => {
    
    checkDelayAndResetPreservedDataBufferIfneeded(onCompletPayloadInstance)
    const Uint8ArrayView = Uint8Array.from([
        ...onCompletPayloadInstance.preservedDataBuffer,
        ...buffer
    ]);
    
    const dataLength = Uint8ArrayView[1];
    const endOfChunk = 5 + dataLength;
    
    const moreThen2bytes = Uint8ArrayView.length > 1;
    const isCompletPayload = Uint8ArrayView.length >= endOfChunk;
    
    const processPayload = (moreThen2bytes && isCompletPayload)
    
    if (!processPayload) {
        // Keep the Data Buffer Until there is more data or a Timeout
        onCompletPayloadInstance.preservedDataBuffer = Uint8ArrayView;
        //Debug('onCompletPayloadInstance/doNot/processPayload/debug')(Uint8ArrayView)
        return
    }
    
    const completPayload = new Uint8Array(Uint8ArrayView.slice(0, endOfChunk));
    Debug('onCompletPayloadInstance/processPayload')(Uint8ArrayView.join(','))
    onCompletPayloadInstance.preservedDataBuffer = Uint8ArrayView
        .slice(endOfChunk, Uint8ArrayView.length);
    
    try {
        //verifyCCTalkMessage(completPayload)
        //TODO: move that out 
        destination(completPayload);
    } catch(checksumError) {
        console.error(checksumError)
    }
    // In general this should not happen outside of Dev
    const readNextPayload = onCompletPayloadInstance.preservedDataBuffer.length > 1;
    if (readNextPayload) {
        onCompletPayloadInstance._transform( new Uint8Array(0), destination )
    }
      
  }
  
  // Instance of onCompletPayloadInstance
  return onCompletPayloadInstance;
}

/**
 * 
 * @param {Uint8Array} eventData 
 * @returns 
 */
const getEventsAsArrays = eventData => {
      /**
       * This produces events[event] definition of event event[channel,type] 
       * @param {Uint8Array[]} result 
       * @param {number} value
       * @param {number} index 
       * @param {Uint8Array} array 
       */
       const reducer = function(result, value, index, array) {
        if (index % 2 === 0) { 
            result.push(array.slice(index, index + 2) /** Returns [channel,eventCode]*/); 
        }
        return result;
      }
      
      /** @type {Uint8Array[]} */
      return eventData
        .reduce(reducer, []);
}


/**
 * 
 * @param {number} currentEventCounter 
 * @param {number} lastEventCounter 
 */
 const getNewEventsCount = (currentEventCounter,lastEventCounter) => {
      
  if (lastEventCounter) {
    // Debug only Once !! if (preserved.eventBuffer && currentEventCounter != lastEventCounter) {
    
    const newEventsCount = currentEventCounter - lastEventCounter;        
    if(newEventsCount > 5){
      // We are in a deSynced State
      console.error('error', new Error(`
        Event overflow. Events generated by the bill detector were lost!
        Leads to the conclusion that we did not poll as fast as needed.
        the events in 6 are lost
      `));
    }
    return newEventsCount;
  }
}


/**
 * returns a readBufferedResponseInstance 
 * it is able to parse the reply from the poll
 * header/command and needs to be optained per device
 * and session as it is aware of the last eventsCount
 * @returns 
 */
export const ReadBufferedResponse = () => {
  const preserved = { 
    eventBuffer: new Uint8Array(0) 
  };
  
  /**
   * 
   * @param {*} pollResponse 
   * @returns 
    eventsCount: 15,
  newest event is first
    events: [
  Uint8Array(2) [ 3, 1 ],
  Uint8Array(2) [ 3, 1 ],
  Uint8Array(2) [ 3, 1 ],
  Uint8Array(2) [ 1, 1 ],
  Uint8Array(1) [ 1 ]
]
     */


  /** 
   * @param {Uint8Array} pollResponse 
   * @param {*} emit
   * */
  const readBufferedResponse = (pollResponse, emit )=> {
    Debug('esnext-cctalk/parser/pollResponseEventParser/debug')({ pollResponse })
    // getData out of the pollResponse Payload
    const eventBuffer = getMessage(pollResponse).data
    
    const lastEventCounter = preserved.eventBuffer[0];
    const currentEventCounter =  eventBuffer[0];
    const newEventsCount = getNewEventsCount(currentEventCounter,lastEventCounter);    

    preserved.eventBuffer = eventBuffer;

    const eventData = eventBuffer.slice(1)
    
    if (!lastEventCounter) {
      // if we got no lastEventCounter this is the first event we see
      // currentEventCounter === eventData.length / 2
    }
        
    const events = getEventsAsArrays(eventData);
      
    if (currentEventCounter !== lastEventCounter && newEventsCount) {
      Debug('esnext-cctalk/parser/pollResponseEventParser/debug')({ eventData, eventBuffer })
      events.slice(0,newEventsCount)
        .map( ( event, idx ) => 
          ({ count: lastEventCounter + idx + 1, event }) 
        );
      
      return emit({ currentEventCounter, events });
    }    
  }
    
  return readBufferedResponse
}
  