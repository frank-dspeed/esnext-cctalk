export const delayResolvePromise = (ms=50) => new Promise(resolve => 
    setTimeout(resolve, ms)
);

export const delayRejectPromise = (ms = 50) => new Promise( resolve => 
    setTimeout( ()=> 
        resolve(Promise.reject(`timeout: ${ms}`)), ms
    )
);