export const headersByName = {
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

/**
 * This can be used with any Type its generic
 * @param {Object.<string, number>} map 
 */
export const reverseHashMap = map => {
    /** /@ type {Object.<number, string>} */
    const headersByNumber = {};
    for (const [ name, header ] of Object.entries(map)) {
        headersByNumber[header] = name;
    }
    return headersByNumber;
}

const headersByNumber = reverseHashMap(headersByName);

 /** 
  * This can be called like 
  * header(254) //=> returns 'simplePoll'
  * header('254') //=> 'simplePoll' 
  * header('simplePoll') //=> 254
  * @param {string|number} strOrNumber 
  * @returns {string|number|void}
  **/
 const header = strOrNumber => {
    const asString = `${strOrNumber}`;
    const isHeaderName = asString.length > 3;
    if (isHeaderName) {
        return headersByName[asString];
    }
    return headersByNumber[asString];
}

export { headersByNumber, header }