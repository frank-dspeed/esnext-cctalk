import { getAsyncIterableFromArrayOfAsyncFns, createDefferedPromise, delayResolvePromise } from './promise-utils.js'

let i = 1
const tests = [
    ()=>new Promise(resolve=>setTimeout(()=>resolve(i++), 1000)),
    ()=>new Promise(resolve=>setTimeout(()=>resolve(i++), 1000)),
    ()=>new Promise(resolve=>setTimeout(()=>resolve(), 1000)),
    ()=>new Promise(resolve=>setTimeout(()=>resolve(i++), 1000)),
    ()=>new Promise(resolve=>setTimeout(()=>resolve(i++), 1000)),
    ()=>new Promise(resolve=>setTimeout(()=>resolve(i++), 1000)),
    ()=>new Promise(resolve=>setTimeout(()=>resolve(i++), 1000)),
    ()=>new Promise(resolve=>setTimeout(()=>resolve(i++), 1000)),
]

const timer = () => setInterval(()=>console.log('tick'), 500)
const main = async () => {
	//const t = timer()

	const iter = getAsyncIterableFromArrayOfAsyncFns(tests)
	for await (const value of iter) {
		console.log('value = ' + value)
	}
    console.log('done')
	//clearInterval(t)	
}

main()

import { strictEqual, ok } from 'assert';

import { fail } from 'assert/strict';

describe('queryable-deffered-promise.js', () => {
    
    it('Create a Promise with an id and Resolve it ', async () => {
 
        const p = createDefferedPromise('test-id')
        strictEqual(`${p.id}`,'test-id', 'The .id is not === test-id')
        await delayResolvePromise(30)
        p.resolve('hi')
        ok(p.settledAfter >= 20, `promise settled is not  20 <= ${p.settledAfter}`)
        
        ok(p.isPending === false, '.isPending is true')
        ok(p.isFulfilled === true, 'isFulfilled is not true')
        await p
        ok(p.value === 'hi','The .value is not === hi')
        await delayResolvePromise(20)
        const delay = p.settledAfter;
        ok(delay < 100,`promise delay is ${delay} < 100`)

    });
  
    it('resolves', function(done) {
        done();
    });

    it('rejects', async () => {
        const p = createDefferedPromise('test-id')
        p.reject('Expected Reject')
        ok(p.isPending === false, '.isPending is true')
        ok(p.isFulfilled === false, 'isFulfilled is not false')
        ok(p.isRejected === true, 'isFulfilled is not false')
        ok(p.reason === 'Expected Reject', 'Reason is not Expected Reject')
        
        try {
            await p;
        } catch (e) {
            ok(e === 'Expected Reject', `Expected Reject did not got thrown got: ${e}`)
        }     
           
    });

    it('resolves Not Manytimes FromSameInstance', async () => {
        const p = createDefferedPromise('test-id')

        p.resolve('hi')
        
        // test if it times out or gives the correct value        
        // @ts-expect-error
        ok(await p === 'hi', ` promise.then('hi') `)
        
        p.resolve('hi2')

        ok(p.value !== 'hi2','The .value is === hi2')
        ok(p.value === 'hi','The .value is === hi')

        const pp = createDefferedPromise('test-id2')
        ok(pp.id === 'test-id2', 'The .id is not === test-id2');
    });


    it('Test timeout precisission ', async () => {
        const p = createDefferedPromise('test-id-for-timeot')        
        p.setTimeout(50)
        await delayResolvePromise(1)
        await delayResolvePromise(20)
        p.setTimeout(20)
        await delayResolvePromise(130)
        p.reject('')
        
        ok(p.reason.message.indexOf('Timeout After') > -1,'Expected')
            
        
        
        
        /*
        p.resolve('hi')

        // it rejects after 200ms        
        await delayResolvePromise(201)
        p.resolve('hi')
        await p
        
        p.resolve('hi2')

        assert(p.value !== 'hi2','The .value is === hi2')
        assert(p.value === 'hi','The .value is === hi')

        const pp = createDefferedPromise('test-id2')
        assert(pp.id === 'test-id2', 'The .id is not === test-id2');
        */
    });

});