import { sinonSpy } from './utils/sinon-spy.js';

import { CCTalkParser } from '../src/cctalk.js'
import assert from 'assert';

console.log('emits data for a default length message')
const test1 = () => {
  
  const data = () => new Uint8ClampedArray([2, 0, 1, 254, 217]);  
  const parser = CCTalkParser(50)
  
  /** @param {*} msg  */
  const dest = msg => {
    assert.deepStrictEqual(new Uint8ClampedArray(msg), data())
    console.log('OK: emits data for a default length message')
  }
  parser._transform ( data(), dest );
}
test1();

console.log('emits data for a 7 byte length message 2 data bytes')
const test2 = () => {
  
  const data = () => new Uint8ClampedArray([2, 2, 1, 254, 1, 1, 217])
  const parser = CCTalkParser()
  
  /** @param {*} msg  */
  const dest = msg => {
    assert.deepStrictEqual(new Uint8ClampedArray(msg), data())
    console.log('OK: emits data for a 7 byte length message 2 data bytes')
  }
  
  parser._transform( data(), dest )
  
}
test2()

console.log('parses multiple length messages')
const test3 = () => {
  
  const parser = CCTalkParser(1000)
  const spy = sinonSpy()
  
  parser._transform(new Uint8ClampedArray([2, 2, 1]), spy.call)
  parser._transform(new Uint8ClampedArray([254, 1, 1]), spy.call)
  parser._transform(new Uint8ClampedArray([217, 2]), spy.call)
  parser._transform(new Uint8ClampedArray([0, 1, 254, 217]), spy.call)
  
  setTimeout(() => {
      assert.strictEqual(spy.callCount, 2)
      assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[0]), new Uint8ClampedArray([2, 2, 1, 254, 1, 1, 217]))
      assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[1]), new Uint8ClampedArray([2, 0, 1, 254, 217]))      
      console.log('OK: parses multiple length messages')
  },1)

}
test3()

console.log('parses a long message')
const test4 = () => {
  
  const parser = CCTalkParser()
  const spy = sinonSpy()
        
  parser._transform(new Uint8ClampedArray([2, 2, 1, 254, 1, 1, 217, 2, 0, 1, 254, 217, 2, 2, 1, 251, 1, 1, 217, 2, 2, 1, 252, 1, 1, 217, 2, 0, 1, 253, 217]), spy.call)
  assert.strictEqual(spy.callCount, 5)
  assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[0]), new Uint8ClampedArray([2, 2, 1, 254, 1, 1, 217]))
  assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[1]), new Uint8ClampedArray([2, 0, 1, 254, 217]))
  assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[2]), new Uint8ClampedArray([2, 2, 1, 251, 1, 1, 217]))
  assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[3]), new Uint8ClampedArray([2, 2, 1, 252, 1, 1, 217]))
  assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[4]), new Uint8ClampedArray([2, 0, 1, 253, 217]))
  console.log('OK: parses a long message');

}
test4();

console.log('resets incomplete message after timeout')
const test5 = () => {
  
  const parser = CCTalkParser(6);
  const spy = sinonSpy();
    
  parser._transform(new Uint8ClampedArray([2, 2, 1]), spy.call)
  parser._transform(new Uint8ClampedArray([254, 1, 1]), spy.call)
  parser._transform(new Uint8ClampedArray([217, 2]), spy.call)
  setTimeout(() => 
    parser._transform(new Uint8ClampedArray([0, 1, 254, 217]), spy.call)
  ,51);
  setTimeout(() => {
      assert.strictEqual(spy.callCount, 1)
      assert.deepStrictEqual(new Uint8ClampedArray(spy.getCall[0]), new Uint8ClampedArray([2, 2, 1, 254, 1, 1, 217]))
      console.log('OK: resets incomplete message after timeout')
  },500);

}
test5();

console.log('disabled message timeout');
console.log('TEST NOT Implemented: disabled message timeout');