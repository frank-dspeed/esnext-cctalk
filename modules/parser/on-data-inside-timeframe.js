//import './types.js'; //Do not treeshake that if you want a dev build for production also strip comments
//import { verifyCCTalkMessage } from './cctalk-crc.js'
import { getMessage } from '../payload-helpers.js'
import Debug from '../debug.js';

/** @param {{ preservedDataBuffer: Uint8Array; }} insideTimeFrameEmitObj */
export const getDataFromInsideTimeFrameMessage = insideTimeFrameEmitObj => insideTimeFrameEmitObj.preservedDataBuffer;

/** @param {*} onDataInsideTimeframeInstance */
const checkDelayAndResetPreservedDataBufferIfneeded = onDataInsideTimeframeInstance => {
  const { 
      maxDelayBetweenBytesMs, 
      lastByteFetchTime,
  } = onDataInsideTimeframeInstance;
  
  if (maxDelayBetweenBytesMs > 0) {
      const now = Date.now();
      const delayBetweenLastByte = now - lastByteFetchTime;
      if (delayBetweenLastByte > maxDelayBetweenBytesMs) {
        onDataInsideTimeframeInstance.preservedDataBuffer = new Uint8Array(0);
      }
      onDataInsideTimeframeInstance.lastByteFetchTime = now;
  }
}

const IsInsideTimeFrame = ( maxDelayBetweenBytesMs = 50 ) => {
  
  let lastTime = 0;
  
  return () => {
    if (maxDelayBetweenBytesMs > 0) {
      const now = Date.now();
      const delayBetweenLastTime = now - lastTime;
      const isInsideTimeFrame = delayBetweenLastTime <= maxDelayBetweenBytesMs
      Debug('isInsideTimeFrame')({ delayBetweenLastTime, isInsideTimeFrame })
      return isInsideTimeFrame
    }
  }
}


/**
 * This parser makes sure that only valid CCTalkMessages/Payloads
 * get emitted it drops false messages as per CCTalk Specs
 * @function [OnDataInsideTimeframe]
 * @param {number} maxDelayBetweenBytesMs 
 * @returns {onDataInsideTimeframeInstance}
 */
export const OnDataInsideTimeframe = ( maxDelayBetweenBytesMs = 50 ) => {

  const onDataInsideTimeframeInstance = { 
      maxDelayBetweenBytesMs,
        /**
         * @param {Uint8Array} buffer 
         * @param {(payload:*)=>{}} emit 
         */   
      _transform: (buffer , emit ) =>  { emit(buffer); },
      preservedDataBuffer: new Uint8Array(0), 
      lastByteFetchTime: 0,
  }
  
  /** /@ type {OnDataInsideTimeframeTransformFn} */

  /**
   * 
   * @param {Uint8Array} buffer 
   * @param {(payload:*)=>{}} emit 
   * @returns 
   */    
  onDataInsideTimeframeInstance._transform = ( buffer, emit ) => {
    
    const { 
        maxDelayBetweenBytesMs, 
        lastByteFetchTime,
        preservedDataBuffer
    } = onDataInsideTimeframeInstance;
    
    if (maxDelayBetweenBytesMs > 0) {
        const now = Date.now();
        const delayBetweenLastByte = now - lastByteFetchTime;
        
        if (delayBetweenLastByte > maxDelayBetweenBytesMs) {
           emit({ preservedDataBuffer, now, lastByteFetchTime, delayBetweenLastByte, maxDelayBetweenBytesMs })
           onDataInsideTimeframeInstance.preservedDataBuffer = new Uint8Array(0);
        }
        
        onDataInsideTimeframeInstance.lastByteFetchTime = now;
        const Uint8ArrayView = Uint8Array.from([
            ...preservedDataBuffer,
            ...buffer
        ]);
        
        onDataInsideTimeframeInstance.preservedDataBuffer = Uint8ArrayView
        return
    }

    emit(buffer);
      
  }
  
  return onDataInsideTimeframeInstance;
}
