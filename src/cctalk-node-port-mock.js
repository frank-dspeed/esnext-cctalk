import { Transform } from "stream";

/**
 * @param {boolean} allowPipe
 */
export const getPort = allowPipe => {

    const mockPort = {}
    // @ts-ignore
    mockPort.write = data => {
        // @ts-ignore
        mockPort?.data(data);
    }
    
    /**
     * 
     * @param {Transform} nodeStream 
     * @returns 
     */
    mockPort.pipe = ( nodeStream) => {
        return   {
            on:
            /**
             * 
             * @param {*} eventName 
             * @param {*} callback 
             */
            ( eventName, callback ) => {
                if (allowPipe) {
                    nodeStream.on('data',callback)
                    // @ts-ignore
                    mockPort[eventName] = data => { nodeStream.write(data); } 
                    return
                } 
                // @ts-ignore
                mockPort[eventName] = callback    
            }
            
        }
    }
    return mockPort
}



