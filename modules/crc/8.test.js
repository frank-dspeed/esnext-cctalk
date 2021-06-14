import { crc8 } from './8.js';
import assert from 'assert';
/*
The raw data to transmit is 40 0 1 254 217 which have the meaning :

message destination   40 = bill acceptor
data field length -zero , the message contains no data bytes
message source 1 – master
header 254 = simple pool
simple checksum  = (-40 -0 -1 -254)mod 256 = 217
*/

describe('modules/crc/8.js', function() {
    it('signing simplePoll for adr 2 from 1', function() {
        const data = [2,0,1,254,0];
        const expectedResult = [ 2, 0, 1, 254, 255 ];
        const signedPayload = crc8.sign(Uint8Array.from(data));
        assert.strictEqual(`${signedPayload}`,`${expectedResult}`,'Signed simplePoll incorect')
        assert.ok(crc8.verify(signedPayload), 'CRC8 Verify is some how Broken')
    });
  
});
