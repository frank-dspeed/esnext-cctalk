import { PollResponseEventsParser } from './cctalk-parser.js'
export const al66v = ()=> {
    const eventsParser = PollResponseEventsParser();
    const eventCodes = {
        accepted: 0,
        rejected: 1,
        inhibited: 2,
        following: 8,
        busy: 13,
        slow: 19,
        string: 20,
        'return': 254,
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
       
    const methods = {
        /** @param {string|number} command */
        getCommand(command) {
            if (typeof command === 'string') {
                
                // @ts-ignore
                const commandCode = commands[command];
                
                if (typeof commandCode !== 'number') {
                    throw new Error('supplyed command is not supported')
                }
            }
            return command
        },
        // 0xFFFF === All 0x0000 === none  
        setAcceptanceMask(acceptanceMask = 0xFF ) {
            const command = commands.modifyInhibitStatus;
            const data = Uint8Array.from([ acceptanceMask & 0xFF, (acceptanceMask >> 8) & 0xFF ]);
            return [command, data];
        },
        // 0xFFFF === on 0x0000 === off  
        modifyMasterInhibit(bool=true) {
            const value = bool ? 0xFF : 0x00;
            const command = commands.modifyMasterInhibit;
            //const data = new Uint8Array(1).fill(value);
            const data = Uint8ClampedArray.from([value]);
            return [command, data];
        },
        enableAcceptance() {
            return methods.modifyMasterInhibit(true);
        },
        /** @param {number} channel*/
        requestCoinPosition(channel){
            const command = commands.requestCoinPosition
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
            debug('CCTALK')('emp800-ready');
              this.ready = true;
              this.pollInterval = setInterval(()=> {
                this.poll()
              }, 999);
              methods.enableAcceptance()
                .then(()=>methods.setAcceptanceMask(0xFFFF));
            */
        },
        readBufferedCredit() {
            const command = commands.readBufferedCredit;
            const data = new Uint8Array();
            return [command,data];
        },
        poll() {
            return methods.readBufferedCredit();
            /*
                sendCommand(commands.readBufferedCredit).then((buffer)=>{
                    this.parseEventBuffer(buffer)
                });
        
                debug('CoinAcceptor::poll()')(this.ready)
                */
        },
        /** @param {number} channel*/
        channelToCoin(channel) {
            const channelsMap = [0,2.00,1.00,0.50,0.20,0.10,0.05,0.02,0.01]
            const coin = channelsMap[channel]
            return coin;
        },
        /** @param {number} channel */
        getCoinName(channel){
            const command = commands.requestCoinId
            const data =  Uint8Array.from([ channel ])
            return [command,data]
            //.then((reply) => { return String.fromCharCode.apply(null, reply.data); });
        },
        readBufferedCreditEvents(CCTalkMessage) {
            const parsedMessage = eventsParser(CCTalkMessage);
            if (parsedMessage) {
                for (const [channel, sorterPathOrEventCode] of parsedMessage.events) {
                  const isAccepted = channel;
                  if (isAccepted) {
                     const sorterPath = sorterPathOrEventCode;
                     console.log('Accepted',{ channel,sorterPath })
                     continue
                  }
                  
                  let eventCode = sorterPathOrEventCode;
                  if (eventCode === 0) {
                    continue
                  }
                  console.log('rejected',eventCode)
                }
                //lastEventCounter = PollResponseEvents.eventsCounter;
            }
        }      
    }


    //6.5.2.9 Command 232 [hexE8], Perform self-test 
    const performSelfCheck = () =>{
        
    }

    //6.5.2.1 Command 249 [hexF9], Request polling priority
    const requestPollingPriority = () => {
        /*
        Coin selector respond to command with two bytes of data. First byte is poll time unit and
        second is polling time value33. Message format is:
        Host sends: [Dir] [00] [01] [F9] [Chk]
        Coin s. respond: [01] [01] [Dir] [Time] [Chk]
        Example of message string for coin selector(address 2) is:
        Host sends: [02] [00] [01] [F9] [04]
        Coin s. respond: [01] [02] [02] [00] [02] [32] [C7]
        First byte 02 is unit x10ms , and second byte is time value hex32 = 50.
        Polling time is calculated as:
        T = 10 x 50 = 500 ms 
        */
    } 
    const readBufferedCreditResponse = () => {
        // eventCode/channel, SorterPath or 00 
        // if channel = 00 eventCode else SorterPath
    }

    //this could be a poll generator
    const Emp800EventGenerator = function* () {
    const startPolling = () =>{
        // send everything that is needed to run poll
    }

    // run poll yild
    }

    return {
        readBufferedCreditResponse,
        methods,
        commands,
        eventCodes
    }
}

  