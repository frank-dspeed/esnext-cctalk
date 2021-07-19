const createIncomingPayload = payload => ({ creadtedAt: Date.now()+20, payload })

/**
 * @description determine if an array contains one or more items from another array.
 * @param {array} haystack the array to search.
 * @param {array} arrayOfMatches the array providing items to check for in the haystack.
 * @return {boolean} true|false if haystack contains at least one item from arr.
 */
 const findOne = (haystack, arrayOfMatches) => 
    arrayOfMatches.some(v => haystack.includes(v));

const recivedPayloads = []
const reciving = [
    createIncomingPayload([40,0,2]),
    createIncomingPayload([0,255])    
]

const getEstimatedLength = payload => payload[1] + 5;

const isPayloadComplet = payload => payload.length === getEstimatedLength(payload);

const isMoreThenComplet = payload => payload.length > getEstimatedLength(payload) ? payload.length - getEstimatedLength(payload) : false;

const isPayloadWithRest = payload => {
    const estimatedLength = getEstimatedLength(payload);
    const isMoreThenComplet = payload.length > estimatedLength;
    const rest = payload.length - estimatedLength;    
    return isMoreThenComplet ? rest : false;
}

const reader = ( incomingPayloads, idx, preseredData = [] ) => {
    const incomingPayload = incomingPayloads[idx]
    if (!incomingPayload) {
        //Nothing to read anymore 
        return
    }
    const { payload } = incomingPayload;
    const virtualCompletPayload = [ ...preseredData, ...payload ]
    const payloadIdx = idx;
    if (isPayloadComplet(virtualCompletPayload)) {
        //slice out continue forEach
        return { payloadIdx, payloadRestIdx: 0 }
    }        
    
    const payloadRestIdx = isPayloadWithRest(virtualCompletPayload)
    if (payloadRestIdx) {
        return { payloadIdx, payloadRestIdx }
    }

    const nextIdx = idx + 1;
    return reader(incomingPayloads, nextIdx, preseredData)
    
}


const tokenizer = () => {
    // find 2,40,1
    
    const payloadsWithoutMeta = reciving.map(iP=>iP.payload);
    
    const lengthOfAllPayloads = payloadsWithoutMeta.flat().length;
    // Can we find at last one complet payload
    const itIsPossibleToFindACompletPayload = lengthOfAllPayloads > 4;
    
    if (itIsPossibleToFindACompletPayload) {
        
        reciving.forEach( (incomingPayload, idx ) => {   
            const { payload } = incomingPayload;
            const considerPayload = [2,40,1];
            
            if ( findOne( payload, considerPayload ) ) {
                const canIndicateLength = payload.length > 1;                
                if (canIndicateLength) {
                    // Most Clean State idx = 0
                    // if not 0 we slice out that and start with the next until
                    reader(reciving, idx);
    
                
                
                    
                }
                
                // Look into next for length
                
    
            }
        })
    }
    
    
    
    
    // find 0 0 0
}
tokenizer()