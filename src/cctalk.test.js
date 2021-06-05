import { CCTalkParser } from './cctalk.js'
import assert from 'assert';
const sinonSpy = () => {
    const spy = {};
    /** @type {Buffer[]} */
    spy.getCall = [];
    spy.callCount = 0;
    spy.call = (/** @type {Buffer} */buffer) => {
      spy.getCall.push(buffer)
      spy.callCount++
    }
    return spy;
}



console.log('emits data for a default length message')
const test1 = () => {
  const data = Buffer.from([2, 0, 1, 254, 217])
  
  
  const parser = CCTalkParser(50)
  /**
   * 
   * @param {*} msg 
   */
  const dest = msg => {
        console.log({ msg })
        assert.deepStrictEqual(Buffer.from(msg), Buffer.from([2, 0, 1, 254, 217]))
  }
  parser._transform (data,dest)
  //assert.strictEqual(spy.callCount, 1)
  
}
test1();


console.log('emits data for a 7 byte length message 2 data bytes')
const test2 = () => {
  const parser = CCTalkParser()
  /**
   * 
   * @param {*} msg 
   */
  const dest = msg => {
    assert.deepStrictEqual(Buffer.from(msg), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
  }
  parser._transform(Buffer.from([2, 2, 1, 254, 1, 1, 217]),dest)
  
}
test2()

console.log('parses multiple length messages')
const test3 = () => {
  const parser = CCTalkParser(1000)
  const spy = sinonSpy()
  /**
   * 
   * @param {*} msg 
   * @returns 
   */
  const dest = msg => spy.call(msg);
  parser._transform(Buffer.from([2, 2, 1]), dest)
  parser._transform(Buffer.from([254, 1, 1]), dest)
  parser._transform(Buffer.from([217, 2]), dest)
  ///setTimeout(() => 
  parser._transform(Buffer.from([0, 1, 254, 217]), dest)
  //,51)
  setTimeout(() => {
      console.log( { spy })
      assert.strictEqual(spy.callCount, 2)
      assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
      assert.deepStrictEqual(Buffer.from(spy.getCall[1]), Buffer.from([2, 0, 1, 254, 217]))      
  },1)

}
test3()

console.log('parses multiple length messages with timeout')
const test4 = () => {
  const parser = CCTalkParser(6)
  const spy = sinonSpy()
  /**
   * 
   * @param {*} msg 
   * @returns 
   */
  const dest = msg => spy.call(msg);
  parser._transform(Buffer.from([2, 2, 1]), dest)
  parser._transform(Buffer.from([254, 1, 1]), dest)
  parser._transform(Buffer.from([217, 2]), dest)
  setTimeout(() => 
    parser._transform(Buffer.from([0, 1, 254, 217]), dest)
  ,51)
  setTimeout(() => {
      console.log( { spy })
      assert.strictEqual(spy.callCount, 1)
      assert.deepStrictEqual(Buffer.from(spy.getCall[0]), Buffer.from([2, 2, 1, 254, 1, 1, 217]))
      
      
      
  },500)
  /*
  
  
  
  
  */
}
test4()