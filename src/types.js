/** @typedef { Uint8Array | Uint8Array } Uint8ArrayType */
/** @typedef { Buffer | Uint8ArrayType } BufferOrUnit8 */
/**
 * @callback OnCompletePayloadTransformFn
 * @param { BufferOrUnit8 } buffer 
 * @param {*} destination 
 */

/**
 * @typedef OnCompletePayloadInstance
 * @property { Uint8ArrayType } preservedDataBuffer
 * @property {number} lastByteFetchTime
 * @property {number} maxDelayBetweenBytesMs
 * @property {OnCompletePayloadTransformFn} _transform
 */