import Debug from './debug.js'
import { getConnection, getDeviceWriter } from './cctalk-node.js'
import SerialPort from 'serialport';

const port = new SerialPort('/dev/ttyUSB0',{
    baudRate: 9600,
    autoOpen: true,
    dataBits: 8,
    stopBits: 1
});

const connection = getConnection(port);

const detectedDevice = {
    246: 'requestManufacturerId', //Core commands
    245: 'requestEquipmentCategoryId', //Core commands
    244: 'requestProductCode', //Core commands
}

const getDeviceInfo = async (writer) => {
    
    const Promises = [
       ()=> writer(244),
       ()=> writer(245),
       ()=> writer(246),
    ]
    
    return Promise.allSettled[Promises.map(fn=>fn())];
       
}

const testAdr = async adr => {
    // 254 with all crc types
    let foundCrcType = '';
    const first = await getDeviceWriter(connection,adr,'crc8')(254).then( () => {
        foundCrcType = 'crc8'
        console.log('found crc8',adr)
        return getDeviceInfo(adr,'crc8').catch(Debug('crc8::'));
    });
    if (foundCrcType) {
        console.log('using it found crc8',adr)
        return first;
    }
    if (!foundCrcType) {
        await getDeviceWriter(connection,adr,'crc16xmodem')(254).then( () => {
            foundCrcType = 'crc16xmodem'
            console.log('found crc16xmodem',adr)
            return getDeviceInfo(adr,'crc16xmodem').catch(Debug('crc8::'));
        });
    }

    //await getDeviceWriter(connection,adr,'crc16xmodemJs');
    // request info with correct crc type
}
const deviceTypes = {
    40: 'billReader',
    2: 'coinAcceptor'
}

for (const [adr, name] of Object.entries(deviceTypes)) {
    if (adr !== 40) {
        console.log(adr,name)
        testAdr(adr).then(x=>console.log('RESULT',{ x }));
    }
    
}
/*

const tryWriter = async (adr,methodName) => {
    const writer = getDeviceWriter(connection,adr,methodName);
    Object.assign(writer,{adr,methodName});
    const racingPromises = [
        writer(254).then(()=>writer),
        timeoutPromise()
    ]
    const writerRace = Promise.race(racingPromises).then(writer=>{
        const [,t] = racingPromises;
        clearTimeout(t.timeout);
        return writer
    }).catch(e=>console.log(e,adr,methodName)); 
    return writerRace
}
const possibleWriters = [
    tryWriter(2,'crc8'),
    tryWriter(40,'crc16xmodem'),
    //tryWriter(40,'crc16xmodemJs'),
    //tryWriter(40,16),
]

each(possibleWriters,writer=>{
    // @ts-ignore
    if (!writer) {
        return 
    }
    writer.infos = [];
    each(detectedDevice.map(cmd=>writer(cmd)),info=>{
        const parsedInfo = String.fromCharCode.apply(null, getMessage(info).data)
        
        writer.infos.push(parsedInfo)
        console.log(Date.now(),writer.infos)
        //process.exit()
    }).then(()=>{
        Debug('device/found')(writer.infos,writer.adr,writer.crcType)
    }).catch(e=>{
        Debug('device/found')(writer.infos,writer.adr,writer.crcType)
    })
})
//console.log(await getDeviceWriter(connection,2,8)(254).then(()=>writer))

/*
const detectDevice = async (adr) => {
    return await Promise.race([
        tryWriter(adr,8),
        timeoutPromise()
    ]).catch(e=>{
      return Promise.race([
        tryWriter(adr,16),
        timeoutPromise()
    ])  
    })
}
console.log('D',await detectDevice(2))
setTimeout(async ()=>console.log('D',await detectDevice(40)),500)



const simpleButWorking = () => {

}

const standardAddresses = [2,40];
let timeOut = 50;
/*
mapSeries(standardAddresses,adr=>{
    return Promise.race([
        tryWriter(adr,8),
        tryWriter(adr,16),
    ])
}).then(writers=>{
    //mapSeries(writers,writer => {
      console.log( writers )
    //})
})
*/


/*
standardAddresses.forEach(async adr=>{
    const deviceWriter = [
        getDeviceWriter(connection,adr,8),
        getDeviceWriter(connection,adr,16)
    ].forEach( async (writer, i) => {
        Promise.race()
        await writer(254)
       
    })
 /*
    detectedDevice.forEach(async (cmd)=>{
        await writer(cmd).then(getMessage).then(msg=> String.fromCharCode.apply(null, msg.data)).then(Debug('DETECTED'))
    })

})
    */