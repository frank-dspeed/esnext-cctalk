import { crc16xmodemJs } from './16-xmodemjs.js';
import assert from 'assert';

/*
The raw data to transmit is 40 0 1 254 217 which have the meaning :

message destination   40 = bill acceptor
data field length -zero , the message contains no data bytes
message source 1 – master
header 254 = simple pool
simple checksum  = (-40 -0 -1 -254)mod 256 = 217
*/

describe('modules/crc/16-xmodemjs.js', function() {
    it('signing simplePoll for adr 2 from 1 with CRC16', function() {
        const data = [40,0,1,254,0];
        const expectedResult = [ 40, 0, 182, 254, 33 ];
        const signedPayload = crc16xmodemJs.sign(Uint8Array.from(data));
        assert.strictEqual(`${signedPayload}`,`${expectedResult}`,'Signed simplePoll incorect')
        assert.ok(crc16xmodemJs.verify(signedPayload), 'CRC8 Verify is some how Broken')
    });
  
});


