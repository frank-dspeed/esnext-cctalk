export const sinonSpy = () => {
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