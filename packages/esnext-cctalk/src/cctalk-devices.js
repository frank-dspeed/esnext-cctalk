import { CreatePayloadUsingCrcMethodName } from './cctalk-crc.js';
import Debug from '../modules/debug.js';

// Talk from the BUS to the billAcceptor for example
const sendCommand = CreatePayloadUsingCrcMethodName(40,0,'crc16xmodemJs')
// in general you will configure sendCommand per target to talk to

//Device Logic
/* Moved to CCTalkSession Logic
const onBusOpen = () => {
    Debug('device::onBusOpen')(this.ready)
    if (!this.ready) {
      sendCommand('simplePoll')
        .then(() => {
          this.ready = true;
          this.emit('ready');
        }, (error) => {
          this.emit('error', error);
        });
      //sendCommand('performSelfCheck')
    }
  }
  */


/* KEEP This until the new Implementation is verifyed and 100% Complet
//Gets event data passed 
const parseEventBuffer = (impl, eventBuffer = new Uint8Array(0) ) => events => {
    const emit = (...x) => console.log(...x)
    //Debug('cctalk::device::events')(events._data); // Runs always
    if (impl.eventCodes.lenght = 0) {
        throw new Error('eventCodes needs to be Implamented')   
    }
  
    if (eventBuffer && events._data[0] != eventBuffer[0]) {
        // Debug only Once !!
        Debug('cctalk::device::events')(events._data);
        const EventCounter = events._data[0] - eventBuffer[0];
        if(EventCounter > 5){
          // We got more events in Buffer then we Could Process should not Happen if device works
          // Leads to the conclusion that we did not poll as fast as needed.
          emit('error', new Error(`
            Event overflow. Events generated by the bill detector were lost!
            Leads to the conclusion that we did not poll as fast as needed.
          `));
        }
        var maxI = Math.min(events._data.length, EventCounter*2+1);

        for(var i = 1; i < maxI; i += 2) {
          var type = events._data[i+1];
          var channel = events._data[i];
          // @ts-ignore
          var coin = this.channelToCoin(channel)

          Debug('cctalk::device::events::type')(channel,type,coin);
          switch(type) {
          // @ts-ignore
          case impl.eventCodes.accepted:
            emit(impl.eventCodes[type], coin);
            break;
          case impl.eventCodes.escrow:
            if (channel === 0) {
                Debug('cctalk::device::events::type::rejected')(channel,type);
                emit('rejected');
            } else if (channel > 3) {
                Debug('cctalk::device::events::type::return')(coin,'return');
                sendCommand('routeBill',Uint8Array.from([0])).catch((e)=>console.log(e))
            } else {
                Debug('cctalk::device::events::type::routeBill')(coin,'routeBill');
                //emit(impl.eventCodes[type], channel);
                sendCommand('routeBill',Uint8Array.from([1])).catch((e)=>console.log(e))
            }
            break;
          case impl.eventCodes.inhibited:

          case impl.eventCodes.invalidBill:

          case impl.eventCodes.following:

          case impl.eventCodes.rejected:
            emit(impl.eventCodes[type]);
            break;
          case impl.eventCodes.return:
            emit('return');
            break;
          default:
            emit('malfunction', [type, channel]);
            emit('error', new Error('The device reported a malfunction: Code ' + type + ', ' + channel));
          }
      }
    }
    eventBuffer = events._data;
  }

*/

/*
1 - Core commands
P - Payout commands ( for serial hoppers )

255 Factory set-up and test
254 Simple poll //Core commands
253 Address poll //Multi-drop commands
252 Address clash //Multi-drop commands
251 Address change //Multi-drop commands
250 Address random //Multi-drop commands
249 Request polling priority //Coin Acceptor commands //Bill Validator commands
248 Request status //Coin Acceptor commands
247 Request variable set //Coin Acceptor commands //Payout commands ( for serial hoppers ) //Bill Validator commands //Changer / Escrow commands
246 Request manufacturer id //Core commands
245 Request equipment category id //Core commands
244 Request product code //Core commands
243 Request database version //Coin Acceptor commands
242 Request serial number //Core Plus commands
241 Request software revision //Core Plus commands
240 Test solenoids //Coin Acceptor commands //Changer / Escrow commands
239 Operate motors //Bill Validator commands //Changer / Escrow commands
238 Test output lines //Coin Acceptor commands //Bill Validator commands
237 Read input lines //Coin Acceptor commands //Bill Validator commands //Changer / Escrow commands
236 Read opto states //Coin Acceptor commands //Payout commands ( for serial hoppers ) //Bill Validator commands //Changer / Escrow commands
235 Read DH public key //Core Plus commands
234 Send DH public key //Core Plus commands
233 Latch output lines //Coin Acceptor commands //Bill Validator commands
232 Perform self-check //Coin Acceptor commands //Bill Validator commands //Changer / Escrow commands
231 Modify inhibit status //Coin Acceptor commands //Bill Validator commands //Changer / Escrow commands
230 Request inhibit status //Coin Acceptor commands //Bill Validator commands //Changer / Escrow commands
229 Read buffered credit or error codes //Coin Acceptor commands
228 Modify master inhibit status //Coin Acceptor commands //Bill Validator commands
227 Request master inhibit status //Coin Acceptor commands //Bill Validator commands
226 Request insertion counter //Coin Acceptor commands //Bill Validator commands
225 Request accept counter //Coin Acceptor commands //Bill Validator commands
224 Request encrypted product id //Core Plus commands
223 Modify encrypted inhibit and override registers //Coin Acceptor commands
222 Modify sorter override status //Coin Acceptor commands
221 Request sorter override status //Coin Acceptor commands
220 ACMI encrypted data //Core Plus commands
219 Enter new PIN number //Coin Acceptor commands //Payout commands ( for serial hoppers )
218 Enter PIN number //Coin Acceptor commands //Payout commands ( for serial hoppers )
217 Request payout high / low status //Payout commands ( for serial hoppers )
216 Request data storage availability //Core Plus commands
215 Read data block //Coin Acceptor commands //Payout commands ( for serial hoppers ) //Bill Validator commands //Changer / Escrow commands
214 Write data block //Coin Acceptor commands //Payout commands ( for serial hoppers ) //Bill Validator commands //Changer / Escrow commands
213 Request option flags //Coin Acceptor commands //Bill Validator commands
212 Request coin position //Coin Acceptor commands
211 Power management control
210 Modify sorter paths //Coin Acceptor commands //Changer / Escrow commands
209 Request sorter paths //Coin Acceptor commands //Changer / Escrow commands
208 Modify payout absolute count //Payout commands ( for serial hoppers )
207 Request payout absolute count //Payout commands ( for serial hoppers )
206
205
204 Meter control
203 Display control
202 Teach mode control //Coin Acceptor commands //Bill Validator commands
201 Request teach status //Coin Acceptor commands //Bill Validator commands
200 ACMI unencrypted product id //Core Plus commands
199 Configuration to EEPROM //Coin Acceptor commands
198 Counters to EEPROM //Coin Acceptor commands
197 Calculate ROM checksum //Core Plus commands
196 Request creation date //Core Plus commands
195 Request last modification date //Core Plus commands
194 Request reject counter //Coin Acceptor commands //Bill Validator commands
193 Request fraud counter //Coin Acceptor commands //Bill Validator commands
192 Request build code //Core commands
191 Keypad control
190
189 Modify default sorter path //Coin Acceptor commands
188 Request default sorter path //Coin Acceptor commands
187 Modify payout capacity //Payout commands ( for serial hoppers )
186 Request payout capacity //Payout commands ( for serial hoppers )
185 Modify coin id //Coin Acceptor commands //Changer / Escrow commands
184 Request coin id //Coin Acceptor commands //Changer / Escrow commands
183 Upload window data //Coin Acceptor commands
182 Download calibration info //Coin Acceptor commands
181 Modify security setting //Coin Acceptor commands //Bill Validator commands
180 Request security setting //Coin Acceptor commands //Bill Validator commands
179 Modify bank select //Coin Acceptor commands //Bill Validator commands
178 Request bank select //Coin Acceptor commands //Bill Validator commands
177 Handheld function //Coin Acceptor commands
176 Request alarm counter //Coin Acceptor commands
175 Modify payout float //Payout commands ( for serial hoppers ) //Changer / Escrow commands
174 Request payout float //Payout commands ( for serial hoppers ) //Changer / Escrow commands
173 Request thermistor reading //Coin Acceptor commands //Payout commands ( for serial hoppers )
172 Emergency stop //Payout commands ( for serial hoppers )
171 Request hopper coin //Payout commands ( for serial hoppers )
170 Request base year //Core Plus commands
169 Request address mode //Core Plus commands
168 Request hopper dispense count P
167 Dispense hopper coins //Payout commands ( for serial hoppers )
166 Request hopper status //Payout commands ( for serial hoppers )
165 Modify variable set P //Changer / Escrow commands
164 Enable hopper P
163 Test hopper P
162 Modify inhibit and override registers //Coin Acceptor commands
161 Pump RNG P
160 Request cipher key P
159 Read buffered bill events //Bill Validator commands
158 Modify bill id //Bill Validator commands
157 Request bill id //Bill Validator commands
156 Request country scaling factor //Bill Validator commands
155 Request bill position //Bill Validator commands
154 Route bill //Bill Validator commands
153 Modify bill operating mode //Bill Validator commands
152 Request bill operating mode //Bill Validator commands
151 Test lamps //Bill Validator commands //Changer / Escrow commands
150 Request individual accept counter //Bill Validator commands
149 Request individual error counter //Bill Validator commands
148 Read opto voltages //Bill Validator commands
147 Perform stacker cycle //Bill Validator commands
146 Operate bi-directional motors //Bill Validator commands //Changer / Escrow commands
145 Request currency revision //Bill Validator commands
144 Upload bill tables //Bill Validator commands
143 Begin bill table upgrade //Bill Validator commands
142 Finish bill table upgrade //Bill Validator commands
141 Request firmware upgrade capability //Bill Validator commands //Changer / Escrow commands
140 Upload firmware //Bill Validator commands //Changer / Escrow commands
139 Begin firmware upgrade //Bill Validator commands //Changer / Escrow commands
138 Finish firmware upgrade //Bill Validator commands //Changer / Escrow commands
137 Switch encryption code //Core Plus commands
136 Store encryption code //Core Plus commands
135 Set accept limit //Coin Acceptor commands
134 Dispense hopper value P
133 Request hopper polling value P
132 Emergency stop value P
131 Request hopper coin value P
130 Request indexed hopper dispense count P
129 Read barcode data //Bill Validator commands
128 Request money in //Changer / Escrow commands
127 Request money out //Changer / Escrow commands
126 Clear money counters //Changer / Escrow commands
125 Pay money out //Changer / Escrow commands
124 Verify money out //Changer / Escrow commands
123 Request activity register //Changer / Escrow commands
122 Request error status //Changer / Escrow commands
121 Purge hopper //Changer / Escrow commands
120 Modify hopper balance //Changer / Escrow commands
119 Request hopper balance //Changer / Escrow commands
118 Modify cashbox value //Changer / Escrow commands
117 Request cashbox value //Changer / Escrow commands
116 Modify real time clock //Changer / Escrow commands
115 Request real time clock //Changer / Escrow commands
114 Request USB id //Core Plus commands
113 Switch baud rate //Core Plus commands
112 Read encrypted events //Coin Acceptor commands //Bill Validator commands
111 Request encryption support //Core commands
110 Switch encryption key //Core Plus commands
109 Request encrypted hopper status //Payout commands ( for serial hoppers )
108 Request encrypted monetary id //Coin Acceptor commands //Bill Validator commands
107 Operate escrow //Changer / Escrow commands
106 Request escrow status //Changer / Escrow commands
105 Data stream //Core Plus commands
104 Request service status //Changer / Escrow commands
103 Expansion header 4
102 Expansion header //Multi-drop commands
101 Expansion header //Core Plus commands
100 Expansion header //Core commands
99 Application specific to 20
19 to 7 Reserved
6 BUSY message //Core Plus commands
5 NAK message //Core Plus commands
4 Request comms revision //Core Plus commands
3 Clear comms status variables //Coin Acceptor commands //Payout commands ( for serial hoppers ) //Bill Validator commands
2 Request comms status variables //Coin Acceptor commands //Payout commands ( for serial hoppers ) //Bill Validator commands
1 Reset device //Core Plus commands
0 Return message
*/
/*
Public Domain Document
ccTalk Generic Specification - Crane Payment Solutions - Page 7 of 87 - ccTalk Part 3 v4.7.doc
While every effort has been made to ensure the accuracy of this document no liability of any kind is
accepted or implied for any errors or omissions that are contained herein.
1.1 Core Commands
These are the commands which should be supported by all ccTalk peripherals. They
*/

/**
 * This can be used with any Type its generic
 * @param {Object.<string, number>} map 
 */
export const reverseHashMap = map => {
  /** @type {Object.<number, string>} */
  const reversedMap = {};
  for (const [ name, header ] of Object.entries(map)) {
    reversedMap[header] = name;
  }
  return reversedMap;
}

// Reverse map commands and eventCodes
/** @param {{ eventCodes: Object.<string, number>, commands: Object.<string, number> }} impl  */
export const reverseMapCommandsAndEventCodes = impl => {
  /** @type {{ eventCodes: Object.<number, string>, commands: Object.<number, string> }} reversed  */
  const reversed = { 
    eventCodes: reverseHashMap(impl.eventCodes), 
    commands: reverseHashMap(impl.commands) 
  };
    
  return reversed;
}

export const emp800 = ()=> {


/** @type {{ eventCodes: Object.<string, number>, commands: Object.<string, number> }} */
const emp800Mappings = {
    eventCodes: {
        accepted: 0,
        rejected: 1,
        inhibited: 2,
        following: 8,
        busy: 13,
        slow: 19,
        string: 20,
        'return': 254,
      },
      commands: {
        simplePoll: 254,
        addressPoll: 253,
        addressClash: 252,
        addressChange: 251,
        addressRandom: 250,
        ...{
          requestStatus: 248,
          requestVariableSet: 247,
          requestManufacturerId: 246,
          requestEquipmentCategoryId: 245,
          requestProductCode: 244,
          requestDatabaseVersion: 243,
          requestSerialNumber: 242,
          requestSoftwareRevision: 241,
          testSolenoids: 240,
          testOutputLines: 238,
          readInputLines: 237,
          readOptoStates: 236,
          latchOutputLines: 233,
          performSelfCheck: 232,
          modifyInhibitStatus: 231,
          requestInhibitStatus: 230,
          readBufferedCredit: 229,
          modifyMasterInhibit: 228,
          requestMasterInhibitStatus: 227,
          requestInsertionCounter: 226,
          requestAcceptCounter: 225,
          modifySorterOverrideStatus: 222,
          requestSorterOverrideStatus: 221,
          requestDataStorageAvailability: 216,
          requestOptionFlags: 213,
          requestCoinPosition: 212,
          modifySorterPath: 210,
          requestSorterPath: 209,
          teachModeControl: 202,
          requestTeachStatus: 201,
          requestCreationDate: 196,
          requestLastModificationDate: 195,
          requestRejectCounter: 194,
          requestFraudCounter: 193,
          requestBuildCode: 192,
          modifyCoinId: 185,
          requestCoinId: 184,
          uploadWindowData: 183,
          downloadCalibrationInfo: 182,
          requestThermistorReading: 173,
          requestBaseYear: 170,
          requestAddressMode: 169,
          requestCommsRevision: 4,
          clearCommsStatusVariables: 3,
          requestCommsStatusVariables: 2,
          resetDevice: 1,
          return: 0,
        }
      }
  }

  const methods = {
    // 0xFFFF === All 0x0000 === none  
    setAcceptanceMask(acceptanceMask = 0xFF ) {
        const command = emp800Mappings.commands.modifyInhibitStatus;
        const data = Uint8Array.from([ acceptanceMask & 0xFF, (acceptanceMask >> 8) & 0xFF ]);
        return [command, data]
    },
    // 0xFFFF === on 0x0000 === off  
    modifyMasterInhibit(bool=true) {
        const value = bool ? 0xFF : 0x00;
        const command = emp800Mappings.commands.modifyMasterInhibit;
        const data = new Uint8Array(1).fill(value);
        return [command, data]
    },
    enableAcceptance() {
        return methods.modifyMasterInhibit(true);
    },
    /** @param {number} channel*/
    requestCoinPosition(channel){
        const command = emp800Mappings.commands.requestCoinPosition
        const data = Uint8Array.from([ channel ]);
        return [command, data]
    },
    configureAcceptance(acceptanceMask=0xFF) {
        methods.setAcceptanceMask(acceptanceMask);
        //methods.enableAcceptance();
        methods.modifyMasterInhibit(true);
        
                
        //enableAcceptance().then(()=>setAcceptanceMask(0xFFFF));
        // setAcceptanceMask should maybe get called before master ?
        //ThenPoll
      },
    onReady(){
        /*  
        Debug('CCTALK')('emp800-ready');
          this.ready = true;
          this.pollInterval = setInterval(()=> {
            this.poll()
          }, 999);
          methods.enableAcceptance()
            .then(()=>methods.setAcceptanceMask(0xFFFF));
            */
    },
    readBufferedCredit() {
        const command = emp800Mappings.commands.readBufferedCredit;
        const data = new Uint8Array(0);
        return [command,data];
    },
    poll() {
        return methods.readBufferedCredit();
        /*
            sendCommand(emp800Mappings.commands.readBufferedCredit).then((buffer)=>{
                this.parseEventBuffer(buffer)
            });
    
            Debug('CoinAcceptor::poll()')(this.ready)
            */
    },
    /** @param {number} channel*/
    channelToCoin(channel) {
        const channelsMap = ['0.10','0.20','0.50','1.00','2.00']
        const coin = channelsMap[channel-1]
        Debug('cctalk::NOTICE::')('Channel=>', channel ,coin);
        return coin;
    },
    /** @param {number} channel */
    getCoinName(channel){
        sendCommand(emp800Mappings.commands.requestCoinId, Uint8Array.from([ channel ]))
        //.then((reply) => { return String.fromCharCode.apply(null, reply.data); });
    },
    
  }
 
  //this could be a poll generator
  const Emp800EventGenerator = function* () {
    const startPolling = () =>{
        // send everything that is needed to run poll
    }

    // run poll yild
  }
  return {
    methods,
    commands: emp800Mappings.commands,
    eventCodes: emp800Mappings.eventCodes
  }
}

export const taikoPub7 = () => {
  const eventCodes =   {
      accepted: 0, // accepted => stacker
      escrow: 1, // Escrow // rejected
      invalidBill: 2,
      inhibited: 4,
      following: 8,
      busy: 13, //?stackerError could also mean escrowing rejected bill
      billJammed: 16,
      optoFraud: 17,
      string: 18,
      antiStringError: 19,
      barcode: 20,
      'return': 254
    }

    const commands = {
      simplePoll: 254,
      addressPoll: 253,
      addressClash: 252,
      addressChange: 251,
      addressRandom: 250,
      requestStatus: 248,
      requestVariableSet: 247,
      requestManufacturerId: 246,
      requestEquipmentCategoryId: 245,
      requestProductCode: 244,
      requestDatabaseVersion: 243,
      requestSerialNumber: 242,
      requestSoftwareRevision: 241,
      testSolenoids: 240,
      testOutputLines: 238,
      readInputLines: 237,
      readOptoStates: 236,
      latchOutputLines: 233,
      performSelfCheck: 232,
      modifyInhibitStatus: 231,
      requestInhibitStatus: 230,
      modifyMasterInhibit: 228, // 228  001
      requestMasterInhibitStatus: 227,
      requestInsertionCounter: 226,
      requestAcceptCounter: 225,
      modifySorterOverrideStatus: 222,
      requestSorterOverrideStatus: 221,
      requestDataStorageAvailability: 216,
      requestOptionFlags: 213,
      requestCoinPosition: 212,
      modifySorterPath: 210,
      requestSorterPath: 209,
      teachModeControl: 202,
      requestTeachStatus: 201,
      requestCreationDate: 196,
      requestLastModificationDate: 195,
      requestRejectCounter: 194,
      requestFraudCounter: 193,
      requestBuildCode: 192,
      modifyCoinId: 185,
      requestCoinId: 184,
      uploadWindowData: 183,
      downloadCalibrationInfo: 182,
      requestThermistorReading: 173,
      requestBaseYear: 170,
      requestAddressMode: 169,
      readBufferedBill: 159, //Bill Validator commands
      modifyBillId: 158,  //Bill Validator commands
      requestBillId: 157,  //Bill Validator commands  157  001 - xxx looks like that countries_list
      requestCountryScalingFactor: 156, //Bill Validator commands
      requestBillPosition: 155, //Bill Validator commands
      routeBill: 154, //Bill Validator commands
      modifyBillOperatingMode: 153, //Bill Validator commands 000
      requestBillOperatingMode: 152,  //Bill Validator commands
      testLamps: 151,  //Bill Validator commands /Changer / Escrow commands
      requestIndividualAcceptCounter: 150,  //Bill Validator commands
      requestIndividualErrorCounter: 149,  //Bill Validator commands
      readOptoVoltages: 148,  //Bill Validator commands
      performStackerCycle: 147,  //Bill Validator commands
      operateBiDirectionalMotors: 146,  //Bill Validator commands Changer  Escrow commands
      requestCurrencyRevision: 145,  //Bill Validator commands
      uploadBillTables: 144,  //Bill Validator commands
      beginBillTableUpgrade: 143,  //Bill Validator commands
      finishBillTableUpgrade: 142,  //Bill Validator commands
      requestFirmwareUpgradeCapability: 141, //Bill Validator commands: 141,  //Changer / Escrow commands
      uploadFirmware: 140,  //Bill Validator commands /Changer / Escrow commands
      beginFirmwareUpgrade: 139,  //Bill Validator commands /Changer / Escrow commands
      finishFirmwareUpgrade: 138,  //Bill Validator commands /Changer / Escrow commands
      requestCommsRevision: 4,
      clearCommsStatusVariables: 3,
      requestCommsStatusVariables: 2,
      resetDevice: 1,
      return: 0,
    }
    
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
            // sendCommand('modifyBillOperatingMode', Uint8Array.from([3])) // NO ESCROW NO STACKER 3 = both enabled 2 = only stacker
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
          modifyBillOperatingMode(operatingMode){
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
    return { commands, methods, eventCodes }
}
