import Debug from './debug.js'
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
        result.push( await writer(244).then(readTextMessage) );
        result.push( await writer(245).then(readTextMessage) );
        result.push( await writer(246).then(readTextMessage) );
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
    const writerCrc8 = getDeviceWriter(connection,adr,'crc8');
    Promise.allSettled([
        await writerCrc8(254).then( () => {
            return getDeviceInfo( writerCrc8 )
        }),
        (async () =>{
            const crc16Writer = getDeviceWriter(connection,adr,'crc16xmodem');
            return await crc16Writer(254).then( () => {
                console.log('found crc16xmodem',adr)
                return getDeviceInfo( crc16Writer );
            });    
        })()
    ])
    /*
    if (adr === 2) {
        return await writerCrc8(254).then( () => {
            return getDeviceInfo( writerCrc8 )
        });
    } 
    
    if (adr === 40) {
        const crc16Writer = getDeviceWriter(connection,adr,'crc16xmodem');
        return await crc16Writer(254).then( () => {
            console.log('found crc16xmodem',adr)
            return getDeviceInfo( crc16Writer );
        });   
    }
    */
    //await getDeviceWriter(connection,adr,'crc16xmodemJs');
    // request info with correct crc type
}
const deviceTypes = {
    40: 'billReader',
    2: 'coinAcceptor'
}

const findDevices = async function* () {
    for (const [adr, name] of Object.entries(deviceTypes)) {
        const adrAsInt = parseInt(adr)
        //console.log(adr,name)
        // test all possible 
        yield await testAdr(adrAsInt);
    }
};

getDeviceWriter(connection,0,'crc8')(253).then(console.log)
/*
(async () => {
    try {
        for await (let device of findDevices()) {
            Debug('esnext-cctalk/device-detection/foundDevice')(device);
        }
    } catch (e) {
        console.log(e)
    }

  
})();

*/



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