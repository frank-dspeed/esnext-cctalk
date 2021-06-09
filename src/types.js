/** @typedef { Uint8Array | Uint8Array } Uint8ArrayType */
/** @typedef { Buffer | Uint8ArrayType } BufferOrUnit8 */
/**
 * @callback CCTalkParserTransformFn
 * @param { BufferOrUnit8 } buffer 
 * @param {*} destination 
 */

/**
 * @typedef CCTalkParserInstance
 * @property { Uint8ArrayType } preservedDataBuffer
 * @property {number} lastByteFetchTime
 * @property {number} maxDelayBetweenBytesMs
 * @property {CCTalkParserTransformFn} _transform
 */