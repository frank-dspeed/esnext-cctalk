/** @typedef { Buffer | Uint8Array } BufferOrUnit8 */

/**
 * @callback OnPayloadCompletTransformFn
 * @param { BufferOrUnit8 } buffer 
 * @param {*} destination 
 */

/**
 * @typedef OnPayloadCompletInstance
 * @property { Uint8Array } preservedDataBuffer
 * @property {number} lastByteFetchTime
 * @property {number} maxDelayBetweenBytesMs
 * @property {OnPayloadCompletTransformFn} _transform
 */