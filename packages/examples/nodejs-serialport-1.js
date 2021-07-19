import SerialPort from 'serialport';
const port = new SerialPort('/dev/ttyUSB0');
let i = 0
const write = x=> port.write(x)
const read = port.read();

const callWrite = () => {
    setImmediate(()=>{
        console.log(write([12]))
        callWrite()
    }) 
    //console.log(write([]))
    
}
callWrite()
setTimeout(()=> {
    console.log(port.read(8).toString('hex'))
    process.exit()
},500)