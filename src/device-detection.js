import Debug from '../modules/debug.js'
import { getConnection, getDeviceWriter } from './cctalk-node.js'
import { getMessage } from './cctalk-crc.js'
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

/** @param {Uint8Array} payload*/
const readTextMessage = payload => String.fromCharCode.apply(null, [...getMessage(payload).data])

/**
 * 
 * @param {*} writer 
 * @returns 
 */
const getDeviceInfo = async (writer) => {
    const result = []
    try {
        result.push( await writer(244).then(readTextMessage).catch(console.error) );
        result.push( await writer(245).then(readTextMessage).catch(console.error)  );
        result.push( await writer(246).then(readTextMessage).catch(console.error)  );
        //console.log('RESULT:', { productCode, equipmentCategoryId, manufacturerId})
    } catch(e) {
        console.error('SOMETHING WRONG')
    }
    const [ productCode, equipmentCategoryId, manufacturerId ] = result;
    return { productCode, equipmentCategoryId, manufacturerId }
}





/**
 * 
 * @param {number} adr 
 * @returns 
 */
const testAdr = async (adr, crcMethodName ) => {
    // 254 with all crc types
    const write = getDeviceWriter(connection,adr,crcMethodName);
    
    /*
    return writer(254).then( () => {
        return getDeviceInfo( writer )
    } );
    */
    
    return Promise.allSettled([
        write(254).then( () => {
            return getDeviceInfo( write ).then( info =>({
                write,
                info,
                crcMethodName,
                adr,
            }))
        }),
    ])
    
    
    if (adr === 2) {
        const crc8Writer = getDeviceWriter(connection,adr,'crc8');
        return await crc8Writer(254).then( () => {
            return getDeviceInfo( crc8Writer )
        });
    } 
    
    if (adr === 40) {
        const crc16Writer = getDeviceWriter(connection,adr,'crc16xmodem');
        return await crc16Writer(254).then( () => {
            console.log('found crc16xmodem',adr)
            return getDeviceInfo( crc16Writer );
        });   
    }
    
    //await getDeviceWriter(connection,adr,'crc16xmodemJs');
    // request info with correct crc type
}
const deviceTypes = {
    40: 'billReader',
    2: 'coinAcceptor'
}

const findDevices2 = async function* () {
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        let found = await testAdr(adrAsInt, adrAsInt === 40 ? 'crc16xmodem': 'crc8');
        yield found
    }
};

const findDevices = async function* () {
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        let found = await testAdr(adrAsInt, 'crc16xmodem');
        yield found
    }
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        let found = await testAdr(adrAsInt, 'crc8');
        yield found
    }
};


export const detectDevices = async emit => {
    for await (let device of findDevices()) {
        if (device[0].value) {
            Debug('esnext-cctalk/device-detection/foundDevice')(device[0].value);
            if (emit) {
                emit(device[0].value)
            }
        }
    }
} 

export default detectDevices
//detectDevices(console.log)

        






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

const DelayPromise = ms => new Promise(resolve => setTimeout(resolve, ms)
const stableLoopAfterDetection = () => {
    import getDevices from 'esnext-cctalk/src/device-detection.js';
    let i = 0;

    const tryPoll = write => DelayPromise(900).then(()=>write(254).catch(()=>tryPoll(write)))
    let promiseChain = Promise.resolve()
    getDevices(async dev=>{
        console.log('Found', { dev })
        //if (i++ === 1) {
            // We have a perfect loop
            promiseChain = promiseChain
                .then( delay(1000) )
                .then(()=> tryPoll(dev.write).then(x=>console.log('connected:',x, { dev })) ) 
            //
        //}
        
    })
}