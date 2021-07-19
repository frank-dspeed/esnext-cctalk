/**
 * We Try to generate a generic 
 * CCTalk BillReader device and assume that 
 * they are all at last so much similar that 
 * This Generic Implementation works with the most
 */

export const eventCodesByName =   {
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

/**
 * This can be used with any Type its generic
 * @param {Object.<string, number>} map 
 */
 export const reverseHashMap = map => {
    /** /@ type {Object.<number, string>} */
    const eventCodesByNumber = {};
    for (const [ name, eventCode ] of Object.entries(map)) {
        eventCodesByNumber[eventCode] = name;
    }
    return eventCodesByNumber;
}

export const eventCodesByNumber = reverseHashMap(eventCodesByName);