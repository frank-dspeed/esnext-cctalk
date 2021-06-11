import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
import { verifyCCTalkMessage, getMessage } from './cctalk-crc.js'
import Debug from './debug.js';

const cctalkPortParserInitalState = {
    preservedDataBuffer: new Uint8Array(0), 
    lastByteFetchTime: 0, 
}

/**
 * This parser makes sure that only valid CCTalkMessages/Payloads
 * get emitted it drops false messages as per CCTalk Specs
 * @param {number} maxDelayBetweenBytesMs 
 * @returns 
 */
export const OnCompletePayload = ( maxDelayBetweenBytesMs = 50 ) => {
    
    const cctalkPortParser = { 
        maxDelayBetweenBytesMs,
        /** @type {OnCompletePayloadTransformFn} */
        _transform: (buffer , destination ) =>  { destination(buffer); },
        ...cctalkPortParserInitalState,
    }

    const checkDelayAndResetPreservedDataBufferIfneeded = () => {
        const { 
            maxDelayBetweenBytesMs, 
            lastByteFetchTime,
        } = cctalkPortParser;
        
        if (maxDelayBetweenBytesMs > 0) {
            const now = Date.now();
            const delayBetweenLastByte = now - lastByteFetchTime;
            if (delayBetweenLastByte > maxDelayBetweenBytesMs) {
              cctalkPortParser.preservedDataBuffer = new Uint8Array(0);
            }
            cctalkPortParser.lastByteFetchTime = now;
        }
    }

    /** @type {OnCompletePayloadTransformFn} */    
    cctalkPortParser._transform = ( buffer, destination ) => {
       
       checkDelayAndResetPreservedDataBufferIfneeded()
        /**
         * The spread operator ... uses a for const of loop and so converts 
         * even NodeJS Buffer Objects Into Unit8Arrays without any tools
         * browser nativ buffer implementations are UInt8 Arrays
         */
        const Uint8ArrayView = Uint8Array.from([
            ...cctalkPortParser.preservedDataBuffer,
            ...buffer
        ]);
        
        const dataLength = Uint8ArrayView[1];
        const endOfChunk = 5 + dataLength;
        
        const moreThen2bytes = Uint8ArrayView.length > 1;
        const completPayload = Uint8ArrayView.length >= endOfChunk;
        
        const processPayload = (moreThen2bytes && completPayload)
        
        if (!processPayload) {
            // Keep the Data Buffer Until there is more data or a Timeout
            cctalkPortParser.preservedDataBuffer = Uint8ArrayView;
            return
        }
        
        const CCTalkPayload = new Uint8Array(Uint8ArrayView.slice(0, endOfChunk));
        
        cctalkPortParser.preservedDataBuffer = Uint8ArrayView
            .slice(endOfChunk, Uint8ArrayView.length);
        
        try {
            verifyCCTalkMessage(CCTalkPayload)
            destination(CCTalkPayload);
        } catch(checksumError) {
            console.error(checksumError)
        }

        if (cctalkPortParser.preservedDataBuffer.length > 0) {
            cctalkPortParser._transform( new Uint8Array(0), destination )
        }
        
    }
    
    // Instance of parser
    return cctalkPortParser;
}

/**
 * returns a pollResponseEventsParserInstance 
 * it is able to parse the reply from the poll
 * header/command and needs to be optained per device
 * and session as it is aware of the last eventsCount
 * @returns 
 */
export const PollResponseEventsParser = () => {
    const preserved = { eventBuffer: new Uint8Array() };
    
    /**
     * 
     * @param {Uint8ArrayType} eventBuffer 
     * @param {number} lastEventCounter 
     */
    const checkIfEventsAreInSync = (eventBuffer,lastEventCounter) => {
      const currentEventCounter =  eventBuffer[0];
      
      if (lastEventCounter) {
        // Debug only Once !! if (preserved.eventBuffer && currentEventCounter != lastEventCounter) {
        
        const EventCounter = currentEventCounter - lastEventCounter;        
        if(EventCounter > 5){
          // We are in a deSynced State
          console.error('error', new Error(`
            Event overflow. Events generated by the bill detector were lost!
            Leads to the conclusion that we did not poll as fast as needed.
          `));
        }
      }
    }
    
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


    /** @param {Uint8ArrayType} pollResponse */
    const pollResponseEventsParser = pollResponse => {
      Debug('esnext-cctalk/parser/pollResponseEventParser/debug')({ pollResponse })
      // getData out of the pollResponse Payload
      const eventBuffer = getMessage(pollResponse).data
      const lastEventCounter = preserved.eventBuffer[0];
      checkIfEventsAreInSync(eventBuffer,lastEventCounter)
      
      preserved.eventBuffer = eventBuffer;
      const eventData = eventBuffer.slice(1)
      Debug('esnext-cctalk/parser/pollResponseEventParser/debug')({ eventData,eventBuffer })
      if (!lastEventCounter) {
        // if we got no lastEventCounter this is the first event we see
        // currentEventCounter === eventData.length / 2
      }
      
      
      /**
       * This produces events[event] definition of event event[channel,type] 
       * @param {Uint8ArrayType[]} result 
       * @param {number} value
       * @param {number} index 
       * @param {Uint8ArrayType} array 
       */
      const reducer = function(result, value, index, array) {
        if (index % 2 === 0) { 
            result.push(array.slice(index, index + 2) /** Returns [channel,eventCode]*/); 
        }
        return result;
      }
      
      /** @type {Uint8ArrayType[]} */
      const events = eventData
        .reduce(reducer, [])
        
  
      if (!lastEventCounter) {
        // if we got no lastEventCounter this is the first event we see
        // currentEventCounter === events.length
      }
      const eventsCounter =  eventBuffer[0];
      if (eventsCounter !== lastEventCounter) {
        return { eventsCounter, events };
      }
      
      
    }
    
    return pollResponseEventsParser
}
  