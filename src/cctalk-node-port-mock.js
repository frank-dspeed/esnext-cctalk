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
    // @ts-ignore When pipe gets used it will override this
    // for our case that is not importent as we most time aim to 
    // work with a none piped port.
    mockPort.on = ( eventName, callback) => mockPort[eventName] = callback;   
    
    /**
     * 
     * @param {Transform} nodeStream 
     * @returns 
     */
    mockPort.pipe = ( nodeStream) => {
        const pipePort = {
            on:
            /**
             * 
             * @param {*} eventName 
             * @param {*} callback 
             */
            ( eventName = 'data', callback ) => {
                if (allowPipe) {
                    const readNodeStream = nodeStream.on(eventName, callback)
                    // @ts-ignore
                    const proxyToNodeStream = mockPort[eventName] = data => { nodeStream.write(data); } 
                    return
                } 
                // @ts-ignore
                mockPort[eventName] = callback    
            }
            
        }
        return pipePort;
    }
    return mockPort
}
