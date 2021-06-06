import { sinonSpy } from './utils/sinon-spy.js';

import { NodeStreamParser } from '../src/cctalk-node.js';
const CCTalkParser = NodeStreamParser();
import assert from 'assert';

console.log('emits data for a default length message')
const test1 = () => {

  const data = Buffer.from([2, 0, 1, 254, 217])
  const spy = sinonSpy();
  
  const parser = new CCTalkParser()
  parser.on('data', spy.call)
  parser.write(data)
  assert.strictEqual(spy.callCount, 1)
  assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 0, 1, 254, 217]))
  console.log('OK: emits data for a default length message');

}
test1();

console.log('emits data for a 7 byte length message')
const test2 = () => {
  
  const parser = new CCTalkParser()
  const spy = sinonSpy();
  parser.on('data', spy.call)
  parser.write(Buffer.from([2, 2, 1, 254, 1, 1, 217]))
  assert.strictEqual(spy.callCount, 1)
  assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
  console.log('OK: emits data for a 7 byte length message');

}
test2()

console.log('parses multiple length messages')
const test3 = () => {

  const parser = new CCTalkParser()
  const spy = sinonSpy()
  parser.on('data', spy.call)
  parser.write(Buffer.from([2, 2, 1]))
  parser.write(Buffer.from([254, 1, 1]))
  parser.write(Buffer.from([217, 2]))
  parser.write(Buffer.from([0, 1, 254, 217]))
  assert.strictEqual(spy.callCount, 2)
  assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
  assert.deepStrictEqual(Buffer.from(spy.getCall[1]), Buffer.from([2, 0, 1, 254, 217]))
  console.log('OK: parses multiple length messages');

}
test3()

console.log('parses a long message')
const test4 = () => {
  
  const parser = new CCTalkParser()
  const spy = sinonSpy()
  parser.on('data', spy.call)
  parser.write(Buffer.from([2, 2, 1, 254, 1, 1, 217, 2, 0, 1, 254, 217, 2, 2, 1, 251, 1, 1, 217, 2, 2, 1, 252, 1, 1, 217, 2, 0, 1, 253, 217]))
  assert.strictEqual(spy.callCount, 5)
  assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
  assert.deepStrictEqual(Buffer.from(spy.getCall[1]), Buffer.from([2, 0, 1, 254, 217]))
  assert.deepStrictEqual(Buffer.from(spy.getCall[2]), Buffer.from([2, 2, 1, 251, 1, 1, 217]))
  assert.deepStrictEqual(Buffer.from(spy.getCall[3]), Buffer.from([2, 2, 1, 252, 1, 1, 217]))
  assert.deepStrictEqual(Buffer.from(spy.getCall[4]), Buffer.from([2, 0, 1, 253, 217]))
  console.log('OK: parses a long message');

}
test4();

console.log('resets incomplete message after timeout')
const test5 = () => {
  
  const spy = sinonSpy();
  //const clock = sinon.useFakeTimers(Date.now())
  const CCTalkParser = NodeStreamParser(5);
  const parser = new CCTalkParser();
  parser.on('data', spy.call)
  parser.write(Buffer.from([2, 2, 1]))
  //clock.tick(51)
  setTimeout(()=>{
    parser.write(Buffer.from([2, 2, 1, 254, 1, 1, 217]))
    assert.strictEqual(spy.callCount, 1)
    assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
    console.log('OK: resets incomplete message after timeout')
  },50);
  //clock.restore()

}
test5()

console.log('disabled message timeout')
const test6 = () => {
  
  const spy = sinonSpy()
  //const clock = sinon.useFakeTimers(Date.now())
  const CCTalkParser = NodeStreamParser(0);
  const parser = new CCTalkParser()
  parser.on('data', spy.call)
  parser.write(Buffer.from([2, 2, 1]))
  //clock.tick(100)
  setTimeout(()=>{
    parser.write(Buffer.from([254, 1, 1, 217]))
    assert.strictEqual(spy.callCount, 1)
    assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
    console.log('OK: disabled message timeout')
  },100);  
  //clock.restore()
  
}
test6();

