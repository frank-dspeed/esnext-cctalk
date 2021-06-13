/** @typedef { Buffer | Uint8Array } BufferOrUnit8 */

/**
 * @callback OnCompletePayloadTransformFn
 * @param { BufferOrUnit8 } buffer 
 * @param {*} destination 
 */

/**
 * @typedef OnCompletePayloadInstance
 * @property { Uint8Array } preservedDataBuffer
 * @property {number} lastByteFetchTime
 * @property {number} maxDelayBetweenBytesMs
 * @property {OnCompletePayloadTransformFn} _transform
 */