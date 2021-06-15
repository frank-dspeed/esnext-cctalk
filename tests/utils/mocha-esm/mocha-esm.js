// @ts-ignore
import Mocha from 'mocha';
// @ts-ignore
import minimist from 'minimist';
import { getRunner } from './mocha-esm-runner.js';
export const bin = () => {
    // #!/usr/bin/env node
    // "use strict";

    // const execa = require('execa');
    // const path = require('path');
    // const args = process.argv.slice();
    // const node = args.shift();
    // const thisFile = args.shift();

    // const prefixArgs = [
    // '--experimental-modules',
    // `${path.join(__dirname, '/../index.mjs')}`
    // ];

    // if (args[0] === 'inspect' || args[0] === 'inspect-brk') {
    // prefixArgs.unshift(args.shift());
    // }

    // if (args[0] === 'inspect' || args[0] === 'inspect-brk') {
    // prefixArgs.unshift(args.shift());
    // }
    // execa(node, prefixArgs.concat(args), {
    // stdio: 'inherit'
    // }).then(_ => process.exit(0),
    //         e => process.exit(1));
}

// @ts-ignore
export function normalizeOptionAliases(_options) {
  // don't mutating our arguments, rather deep clone and mutate the clone.
  const options = JSON.parse(JSON.stringify(_options))
  delete options._;

  if (options.g) {
    options.grep = options.g;
    delete options.g;
  }

  if (options.i) {
    options.invert = options.i;
    delete options.i;
  }

  return options;
}
// @ts-ignore
export async function main(argv) {
  const options = minimist(argv);
  const files = options._;
  const mocha = new Mocha(normalizeOptionAliases(options));
  const root = process.cwd();
  const runner = getRunner(mocha, root);;

  try {
    await runner.importModuleFiles(files);

    let { failures } = await runner.run();

    process.exit(failures > 0 ? 1 : 0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

main(process.argv.slice(2));