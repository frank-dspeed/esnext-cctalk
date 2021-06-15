import { main } from './tests/utils/mocha-esm/mocha-esm-runner.js';
import fs from 'fs';
let testDir = 'modules/crc'

const tests = [
    ...fs.readdirSync(testDir)
        .filter(file =>file.substr(-7) === 'test.js')
        .map(fileName=>`./${testDir}/${fileName}`)
]
console.log(tests)
main(tests)


