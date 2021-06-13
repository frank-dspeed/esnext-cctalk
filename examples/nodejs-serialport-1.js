import SerialPort from 'serialport';
const port = new SerialPort('/dev/ttyUSB0');
let i = 0
const write = ()=> port.write([0])
const read = port.read();

const callWrite = () => {
    setImmediate(()=>{
        console.log(write([]))
        callWrite()
    }) 
    //console.log(write([]))
    
}
callWrite()
setTimeout(()=> {
    console.log(port.read(8).toString('hex'))
    process.exit()
},500)