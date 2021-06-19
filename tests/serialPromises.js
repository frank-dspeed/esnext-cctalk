/**
 * 
 * @param {Array<()=>Promise<any>>} arrayOfFnReturnPromis 
 * @returns {Promise<PromiseSettledResult<*>[]>}
 */
const asyncSerialPromises = async arrayOfFnReturnPromis => {
  return Promise.allSettled(arrayOfFnReturnPromis.map(async (/** @type {() => any} */ fn) => await fn()));
}

{
  // https://stackoverflow.com/questions/24586110/resolve-arrayOfFnReturnPromis-one-after-another-i-e-in-sequence
  let i = 0;
  /**
   * @type {Array<()=>Promise<any>>} arrayOfFnReturnPromis
   */
  const arrayOfFnReturnPromis = [
        ()=> Promise.resolve(i++),
        ()=> Promise.reject(i++),
        ()=> Promise.resolve(i++),
        ()=> Promise.resolve(i++),
        ()=> Promise.reject(i++),
        ()=> Promise.resolve(i++),
        ()=> Promise.resolve(i++),
        ()=> Promise.reject(i++),
        ()=> Promise.resolve(i++),
  ]  
  asyncSerialPromises(arrayOfFnReturnPromis).then(console.log)

}

/** @param {arrayOfFnReturnPromis} arrayOfFnReturnPromis */
// @ts-ignore
const serialPromises = arrayOfFnReturnPromis => 
  Promise.allSettled(
    arrayOfFnReturnPromis.map(async (/** @type {() => any} */ fn) => await fn())
  );

// Example 2
{
    let i = 0;
    
  const arrayOfFnReturnPromis = [
    ()=> Promise.resolve(i++),
    ()=> Promise.reject(i++),
    ()=> Promise.resolve(i++),
  ]
  
  serialPromises(arrayOfFnReturnPromis).then(console.log) // =>
}

