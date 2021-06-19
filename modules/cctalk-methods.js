import Debug from './debug.js'
const methods = {
    /*
      Result A Result B Event Type
  
      Bill type 1 to 255  0  validated correctly and sent to cashbox / stacker Credit
      1 to 255 1 Bill type 1 to 255 validated correctly and held in escrow Pending Credit
      0 0 Master inhibit active Status
      0 1 Bill returned from escrow Status
      0 2 Invalid bill ( due to validation fail ) Reject
      0 3 Invalid bill ( due to transport problem ) Reject
      0 4 Inhibited bill ( on serial ) Status
      0 5 Inhibited bill ( on DIP switches ) Status
      0 6 Bill jammed in transport ( unsafe mode ) Fatal Error
      0 7 Bill jammed in stacker Fatal Error
      0 8 Bill pulled backwards Fraud Attempt
      0 9 Bill tamper Fraud Attempt
      0 10 Stacker OK Status
      0 11 Stacker removed Status
      0 12 Stacker inserted Status
      0 13 Stacker faulty Fatal Error
      0 14 Stacker full Status
      0 15 Stacker jammed Fatal Error
      0 16 Bill jammed in transport ( safe mode ) Fatal Error
      0 17 Opto fraud detected Fraud Attempt
      0 18 String fraud detected Fraud Attempt
      0 19 Anti-string mechanism faulty Fatal Error
      0 20 Barcode detected Status
      0 21 Unknown bill type stacked Status
   */
    onReady() {
        Debug('CCTALK')('jmcReady-ready');
        //br.selfTest();
        var EU_AS_HEX = Uint8Array.from([69,85])
        // sendCommand('requestBillId', Uint8Array.from([1]))  
        // sendCommand('requestBillId', Uint8Array.from([1]))
        // sendCommand('requestBillId', Uint8Array.from([2]))
        // sendCommand('requestBillId', Uint8Array.from([3]))
        // sendCommand('requestCountryScalingFactor', EU_AS_HEX)
        // sendCommand('requestCurrencyRevision', EU_AS_HEX)
        // sendCommand('modifyBillOperatingMode', Uint8Array.from([3])) // NO ESCROW NO STACKER  3 = both enabled  2 = only stacker
        //this.setAcceptanceMask(); // 0xFFFF modifyInhibitStatus 255,255 // 255 1 0 0 0 0 0 0 //TODO: Needs Check  this.setAcceptanceMask(0xFFFF);
        // sendCommand('modifyInhibitStatus', Uint8Array.from([255,255,255])) // [255,1] ==== alll [255,255,255]
        //this.enableAcceptance(); // modifyMasterInhibit 1
          
        // sendCommand('modifyMasterInhibit', 
        /*
        Buffer.from( 
          //Array[Array] looks wrong but maybe produced right results? Should be 0xFF to accept
          [[1]] 
        )
        */ Uint8Array.from([0xFF])
        //);
        /*
          .then(()=> {
            this.pollInterval = setInterval(()=>{this.poll();}, 900)
            sendCommand('requestBillOperatingMode').then(console.log).then(process.exit(1))
            return true
          });
        */
    
    },
    poll() {
        //if (this.ready) {
   //      sendCommand('readBufferedBill').then(buffer => this.parseEventBuffer(buffer));
        //}
    },
    // @ts-ignore
    modifyBillOperatingMode(operatingMode=0x00){
    // 0 0 , stacker, escrow
    //return this.sendCommand( this.commands.modifyBillOperatingMode,
    //Uint8Array.from([ operatingMode & 0xFF, (operatingMode >> 8) & 0xFF ]))
    //153
    // return sendCommand('modifyBillOperatingMode', Uint8Array.from([1]))
        //.then(console.log)
    },
    /** @param {number} acceptanceMask*/
    setAcceptanceMask(acceptanceMask){
    // example:   231  255  255
    //all-> 231 255 1 0 0 0 0 0 0
    // Uint8Array.from([ acceptanceMask & 0xFF, (acceptanceMask >> 8) & 0xFF ]) == Uint8Array [ 255, 255 ]
    //
    if (!acceptanceMask) {
        acceptanceMask = 0xFFFF;
    }
    // Experiment replaced 255 255 with 255 1 === all?
    // return sendCommand('modifyInhibitStatus', Uint8Array.from([255, 1]))
    },
    enableAcceptance(){
    //228  001
    //_> new Uint8Array(1).fill(0xFF) == Uint8Array [ 255 ] new Buffer(1).from([255]) new Buffer.from([255,255]).readUInt8()
    // return sendCommand('modifyMasterInhibit', 
                /*
    Buffer.from( 
        //Array[Array] looks wrong but maybe produced right results? Should be 0xFF to accept
        [[1]] 
    )
    */ Uint8Array.from([0xFF])
    //)
    },
    selfTest() {
    // return sendCommand('performSelfCheck')
    },
    disableAcceptance() {
    // return sendCommand('modifyMasterInhibit', new Uint8Array(1).fill(0x00))
    },
    /** @param {number} channel */
    channelToCoin(channel) {
    var channelToCoin = ['rejected', '5', '10', '20', '50']
    return channelToCoin[channel-1]
    },
    /** @param {number} channel */
    getBillName(channel) {
    return this.channelToCoin(channel)
    /*
    // return sendCommand('requestBillId', Uint8Array.from([ channel ]))
        //TODO: here is a good place to verify that the Reply wich is a command has a valid crc :)
        .then((reply) => {
        console.log(reply)
        String.fromCharCode.apply(null, reply._data)
        });
    */
    },
    /** @param {number} channel */
    getBillPosition(channel) {
    // return sendCommand('requestBillPosition', Uint8Array.from([ channel ]));
    }
}
