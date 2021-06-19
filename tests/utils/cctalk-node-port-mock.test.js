import assert from 'assert';
import {getPort} from '../tests/utils/cctalk-node-port-mock.js';



describe('cctalk-node-port-mock.js', () => {
    
    it(`accepts writen command via on('data',()=>{})`, async () => {
        const port = getPort(false);
        let didCall = 0
        port.on('data', data => {
            assert(data === 'Franky goes to Hollywood', 'port.on returns no data')
            didCall++
        })
        port.write('Franky goes to Hollywood');
        assert(didCall === 1, 'did not call on data handler')
    })

})
