import { main } from './tests/utils/mocha-esm/mocha-esm-runner.js';
import { readdirSync } from 'fs';

const dirs = [ 'modules/crc', 'modules', 'src' ];

/** @param {string} dirPath */
const readDir = dirPath => readdirSync(dirPath)
    .filter(file =>file.substr(-7) === 'test.js')
    .map(fileName=>`./${dirPath}/${fileName}`);

const tests = dirs
    .flatMap(readDir);

console.log(tests);

main(tests);