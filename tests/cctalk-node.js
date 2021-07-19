import { sinonSpy } from './utils/sinon-spy.js';

import { getNodeStreamParser } from 'esnext-cctalk/src/cctalk-node.js';

import assert from 'assert';
import { crcMethods } from 'esnext-cctalk/src/cctalk-crc.js';
console.log('emits data for a default length message')
const test1 = () => {

  const data = Uint8Array.from([2, 0, 1, 254, 255])
  const spy = sinonSpy();
  
  const parser = getNodeStreamParser(50);
  parser.on('data', spy.call)
  parser.write(data)
  assert.strictEqual(spy.callCount, 1)
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[0]), Uint8Array.from([2, 0, 1, 254, 255]))
  console.log('OK: emits data for a default length message');

}
test1();

console.log('emits data for a 7 byte length message')
const test2 = () => {
  
  const parser = getNodeStreamParser(50);
  const spy = sinonSpy();
  parser.on('data', spy.call)
  parser.write(Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
  
  assert.strictEqual(spy.callCount, 1)
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[0]), Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
  console.log('OK: emits data for a 7 byte length message');

}
test2()

console.log('parses multiple length messages')
const test3 = () => {

  const parser = getNodeStreamParser(50);
  const spy = sinonSpy()
  parser.on('data', spy.call)
  parser.write(Uint8Array.from([2, 2, 1]))
  parser.write(Uint8Array.from([254, 1, 1]))
  parser.write(Uint8Array.from([251, 2]))
  parser.write(Uint8Array.from([0, 1, 254, 255]))
  assert.strictEqual(spy.callCount, 2)
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[0]), Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[1]), Uint8Array.from([2, 0, 1, 254, 255]))
  console.log('OK: parses multiple length messages');

}
test3()

console.log('parses a long message')
const test4 = () => {
  
  const parser = getNodeStreamParser(50);
  const spy = sinonSpy()
  parser.on('data', spy.call)
  parser.write(Uint8Array.from([
    2, 2, 1, 254, 1, 1, 251,
    2, 0, 1, 254, 255,
    2, 2, 1, 254, 1, 1, 251, 
    2, 2, 1, 254, 1, 1, 251, 
    2, 0, 1, 254, 255]))
  assert.strictEqual(spy.callCount, 5)
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[0]), Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[1]), Uint8Array.from([2, 0, 1, 254, 255]))
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[2]), Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[3]), Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
  assert.deepStrictEqual(Uint8Array.from(spy.getCall[4]), Uint8Array.from([2, 0, 1, 254, 255]))
  console.log('OK: parses a long message');

}
test4();

console.log('resets incomplete message after timeout')
const test5 = () => {
  
  const spy = sinonSpy();
  //const clock = sinon.useFakeTimers(Date.now())
  
  const parser = getNodeStreamParser(50);;
  parser.on('data', spy.call)
  parser.write(Uint8Array.from([2, 2, 1]))
  //clock.tick(51)
  setTimeout(()=>{
    parser.write(Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
    assert.strictEqual(spy.callCount, 1)
    assert.deepStrictEqual(Uint8Array.from(spy.getCall[0]), Uint8Array.from([2, 2, 1, 254, 1, 1, 251]))
    console.log('OK: resets incomplete message after timeout')
  },50);
  //clock.restore()

}
test5()
/*
console.log('disabled message timeout')
const test6 = () => {
  
  const spy = sinonSpy()
  //const clock = sinon.useFakeTimers(Date.now())
  const CCTalkParser = NodeStreamParser(0);
  const parser = getNodeStreamParser(50);
  parser.on('data', spy.call)
  parser.write(Uint8Array.from([2, 2, 1]))
  //clock.tick(100)
  setTimeout(()=>{
    parser.write(Uint8Array.from([254, 1, 1, 217]))
    assert.strictEqual(spy.callCount, 1)
    assert.deepStrictEqual(Uint8Array.from(spy.getCall[0]), Uint8Array.from([2, 2, 1, 254, 1, 1, 217]))
    console.log('OK: disabled message timeout')
  },100);  
  //clock.restore()
  
}
test6();

*/