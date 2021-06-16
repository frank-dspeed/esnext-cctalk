import { main } from './tests/utils/mocha-esm/mocha-esm-runner.js';
import fs from 'fs';
let testDir = 'modules/crc'
let testDir2 = 'modules'
const tests = [
    ...fs.readdirSync(testDir)
        .filter(file =>file.substr(-7) === 'test.js')
        .map(fileName=>`./${testDir}/${fileName}`),
    ...fs.readdirSync(testDir2)
        .filter(file =>file.substr(-7) === 'test.js')
        .map(fileName=>`./${testDir2}/${fileName}`)
]
console.log(tests)

main(tests)
/**


const tests2 = [
    ...fs.readdirSync(testDir2)
        .filter(file =>file.substr(-7) === 'test.js')
        .map(fileName=>`./${testDir2}/${fileName}`)
]
console.log(tests2)
main(tests2)


 */