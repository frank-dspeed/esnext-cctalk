// https://googlechromelabs.github.io/serial-terminal/
// https://github.com/GoogleChromeLabs/serial-terminal/tree/gh-pages
import 'types'; //Do not treeshake tthat if you want a dev build for production also strip comments
import { CCTalkParser } from './cctalk-parser.js';
/**
 * 
 * @param {number} maxDelayBetweenBytesMs 
 * @returns 
 */
 export const WebStreamParser = (maxDelayBetweenBytesMs = 50 ) => {
    const parser = CCTalkParser(maxDelayBetweenBytesMs);
    /** @type {TransformerTransformCallback<Uint8ArrayType,TransformStreamDefaultController>}  */
    const transform = async (chunk, controller) => {
        parser._transform(chunk, controller.enqueue);
        /*
        const CCTalkPayload = parser.buffers.pop();
        if (CCTalkPayload) {
            controller.enqueue(new Uint8Array(CCTalkPayload))
        }
        */
    }
    
    return transform;    
}
const getCCTalkParserTransformStream = () => 
    new TransformStream({ 
        start() { /** required. */ }, 
        transform: WebStreamParser() 
    });


/**
 * runs the cctalk.js connection via WebSerial Api
 */
const init = () => {
    if ("serial" in navigator) {
        // The Web Serial API is supported.
        const filters = [
            { usbVendorId: 0x2341, usbProductId: 0x0043 },
            { usbVendorId: 0x2341, usbProductId: 0x0001 }
          ];
        // @ts-ignore
        const { requestPort, getPorts } = navigator.serial;
        
        // @ts-ignore
        navigator.serial.requestPort({ filters }).then( async (
            /** @type {{ getInfo: () => { usbProductId: any; usbVendorId: any; }; open: (arg0: { baudRate: number; }) => any; readable: { pipeTo: (arg0: WritableStream<Uint8ArrayType>) => any; }; writable: { getWriter: () => any; }; }} */ 
            port
            ) => {
                const { usbProductId, usbVendorId } = port.getInfo();
                await port.open({ baudRate: 9600 })
                
                while (port.readable) {
                
                    const writer = port.writable.getWriter();

                    const data = new Uint8Array([104, 101, 108, 108, 111]); // hello
                    await writer.write(data);
                    //Write other Setup Data
                    
                    // Allow the serial port to be closed later.
                    writer.releaseLock();

                    const cctalkDecoder = getCCTalkParserTransformStream();
                    const closedReadableStream = port.readable.pipeTo(cctalkDecoder.writable);
                    const reader = cctalkDecoder.readable.getReader();
                
                    try {
                    while (true) {
                        const { value: cctalkMessage, done } = await reader.read();
                        if (done) {
                        // Allow the serial port to be closed later.
                        reader.releaseLock();
                        break;
                        }
                        if (cctalkMessage) {
                        console.log(cctalkMessage);
                        }
                    }
                    } catch (error) {
                    // TODO: Handle non-fatal read error.
                    }
                }
            })
        
    
    
     } else {
         throw new Error('WebSerial API not supported upgrade browser')
     }
}
