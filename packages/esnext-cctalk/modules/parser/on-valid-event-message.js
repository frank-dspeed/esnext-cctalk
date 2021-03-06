import Debug from "../debug.js";
export const getEventData = payload => payload.slice(5,-1)
/**
 * 
 * @param {Uint8Array} eventData 
 * @returns 
 */
 export const getEventsAsArrays = eventData => {
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
    
    /** @type {number[]} */
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

/** @param {Uint8Array} payload */
export const isValidEventPayload = payload => {
    const isEventPayload = (payload[0] === 1  
        && payload[1] === 11  && payload[3] === 0
        && payload.length === 16)
    return isEventPayload;
};

/**
 * Parses Event Messages to Array of count, event: [channel,code
 * Emits Events only once.]
 
 */
 export const getEventParser = () => {
    
    const scope = { 
        lastEventCounter: 0, 
        events: new Uint8Array(0),
    }
    
    /**
     * @param {Uint8Array} ev
     * @returns {{ count: number, event: number[] }[]}
     */
    const eventParser = ev => {
        const eventCounter = ev[4];
        const lastEventCounter = scope.lastEventCounter;
        scope.lastEventCounter = eventCounter;
        const debounceEvents = lastEventCounter === eventCounter;
        
        if (debounceEvents) { return []; };
        
        const events = ev.slice(5,-1)
        
        const eventsArray = getEventsAsArrays(events)
            .filter(ev =>  ev[1] + ev[0] !== 0);
        
        const newEventsCount = lastEventCounter
            ? eventCounter - lastEventCounter 
            : eventsArray.length;

        const eventsWithCount = eventsArray
            .map( ( event, idx ) => 
                ({ count: eventCounter - idx, event: [...event] }) 
            );
        
        const emitPayloadMessage = { 
            newEventsCount, lastEventCounter,
            eventCounter , events: [...events], eventsWithCount
        }
        
        if(newEventsCount > 5){
            Debug('onValidEventMessage/newEventCount>5/error')({ 
                emitPayloadMessage 
            });
            // We are in a deSynced State
            console.error('error', new Error(`
                Event overflow. ${newEventsCount-5} are lost
                returning last 5 events
            `));
        }
        
        return eventsWithCount
    }
    
    return eventParser;
}




/**
 * Emits Messages if it is needed
 * @param {*} emit a function that takes the response
 * @returns 
 */
export const getEventHandler = emit => {
    
    const parser = getEventParser();
    
    /**
     * a function that takes a event payload
     */
    return ev => {
        const newEvents = parser(ev)
        newEvents.forEach( event => 
            emit(event) 
        );
    }

}

export const OnValidEventMessage = () =>{

    const lastEventCounters = {
        billReader: 0,
        coinAcceptor: 0,
    }

    /**
     * 
     * @param {Uint8Array} payload 
     * @param {*} emit 
     * @returns 
     */
    const onValidEventMessageInstance = (payload, emit) => {
        const isEvent = isValidEventPayload(payload);
        if (isEvent) {
            const isBillReaderEvent = payload[2] !== 2;
            const isCoinAcceptorEvent = payload[2] === 2;
            const eventCounter = payload[4];
            const events = payload.slice(5,-1)    
            
            //Debug('esnext-cctalk/parser/pollResponseEventParser/debug')({ events })

            const deviceType = isBillReaderEvent 
                ? 'billReader' 
                : 'coinAcceptor';

            const lastEventCounter = lastEventCounters[deviceType];
    
            const debounceEvents = lastEventCounter === eventCounter;
            if (debounceEvents) { return; };
            
            const newEventsCount = lastEventCounter 
                ? eventCounter - lastEventCounter 
                : events.length / 2;
    
            lastEventCounters[deviceType] = eventCounter;
            const newEvents = [...events].slice(0,newEventsCount)
                  .map( ( event, idx ) => 
                    ({ count: lastEventCounter + idx + 1, event }) 
                  );
            const emitPayloadMessage = { 
                deviceType, newEventsCount, lastEventCounter,
                eventCounter , events, newEvents
            }
            
            if(newEventsCount > 5){
                Debug('onValidEventMessage/newEventCount>5/error')({ 
                    emitPayloadMessage 
                });
                // We are in a deSynced State
                console.error('error', new Error(`
                    Event overflow. ${newEventsCount-5} are lost
                    returning last 5 events
                `));
            }
            
            emit(emitPayloadMessage)
        }
        // Happens on MCDS Commands on the bus
        const isBreakingCCTalkSpecResponse = payload[2] === 0 && payload[3] === 0 && payload[4] === 0;
        if (isBreakingCCTalkSpecResponse) {
            // Read in 50 ms steps until bus is empty for more then 50 ms
        }
    };
    
    return onValidEventMessageInstance;
}



