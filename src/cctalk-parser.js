import 'types'; //Do not treeshake that if you want a dev build for production also strip comments
import { verifyCCTalkMessage } from './cctalk-crc.js'

/** @type {CCTalkParserInitalState} */
const CCTalkParserInitalState = {
    preservedDataBuffer: new Uint8ClampedArray([]), 
    lastByteFetchTime: 0, 
}

export const CCTalkParser = ( maxDelayBetweenBytesMs = 50 ) => {
    
    const CCTalkParserInstance = { 
        maxDelayBetweenBytesMs,
        /** @type {CCTalkParserTransformFn} */
        _transform: (buffer , destination ) =>  { destination(buffer); },
        ...CCTalkParserInitalState,
    }

    const checkDelayAndResetPreservedDataBufferIfneeded = () => {
        const { 
            maxDelayBetweenBytesMs, 
            lastByteFetchTime,
        } = CCTalkParserInstance;
        
        if (maxDelayBetweenBytesMs > 0) {
            const now = Date.now();
            const delayBetweenLastByte = now - lastByteFetchTime;
            if (delayBetweenLastByte > maxDelayBetweenBytesMs) {
              CCTalkParserInstance.preservedDataBuffer = new Uint8ClampedArray([]);
            }
            CCTalkParserInstance.lastByteFetchTime = now;
        }
    }

    /** @type {CCTalkParserTransformFn} */    
    CCTalkParserInstance._transform = ( buffer, destination ) => {
       
       checkDelayAndResetPreservedDataBufferIfneeded()
        /**
         * The spread operator ... uses a for const of loop and so converts 
         * even NodeJS Buffer Objects Into Unit8Arrays without any tools
         * browser nativ buffer implementations are UInt8 Arrays
         */
        const Uint8ArrayView = new Uint8ClampedArray([
            ...CCTalkParserInstance.preservedDataBuffer,
            ...buffer
        ]);
        
        const dataLength = Uint8ArrayView[1];
        const endOfChunk = 5 + dataLength;
        
        const moreThen2bytes = Uint8ArrayView.length > 1;
        const completePayload = Uint8ArrayView.length >= endOfChunk;
        
        const processPayload = (moreThen2bytes && completePayload)
        
        if (!processPayload) {
            // Keep the Data Buffer Until there is more data or a Timeout
            CCTalkParserInstance.preservedDataBuffer = Uint8ArrayView;
            return
        }
        
        const CCTalkPayload = new Uint8Array(Uint8ArrayView.slice(0, endOfChunk));
        
        CCTalkParserInstance.preservedDataBuffer = Uint8ArrayView.slice(endOfChunk, Uint8ArrayView.length);
        
        try {
            verifyCCTalkMessage(CCTalkPayload)
            destination(CCTalkPayload);
        } catch(checksumError) {
            console.error(checksumError)
        }

        if (CCTalkParserInstance.preservedDataBuffer.length > 0) {
            CCTalkParserInstance._transform( new Uint8ClampedArray([]), destination)
        }
        
    }
    
    // Instance of parser
    return CCTalkParserInstance;
}

