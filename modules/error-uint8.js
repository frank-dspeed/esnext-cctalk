/**
 * errorUint8 Errors if its not a Uint8*
 * @param { Uint8Array } chunk 
 */
 export const errorUint8 = chunk => {
    const isUint8 = chunk.constructor.name.indexOf('Uint8') === 0;
    if (isUint8) { return; };
    //We need to work with Uint8 while ECMAScript uses Uint16 by default
    throw new Error('_buffer is not Uint8Array')
}