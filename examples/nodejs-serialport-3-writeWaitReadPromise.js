
export let lock = false;
export const releaseLock = () {
    lock = false
}

// Edge Case 1.1 gets to much data
// Edge Case 1.2 gets not enought data
// Edge Case 1.3 gets no data
// Edge Case general data starts with own data else it is data additional data
const writeWaitRead = data => {
    if (lock) {
        throw new Error('you got a failure in your CCTalk Logic Hitted writeWaitRead.lock')
    }
    lock = true;
    const dataStringForComparison = data.toString(16)
    if (port.write(data)) {
        return new Promise(resolve=>setTimeout(()=>{
            const reply = port.read();
            lock = false;
            
            // If we got a incomplet but started message we could consider re reading it
            resolve(reply);
        },200));
    }
    
}