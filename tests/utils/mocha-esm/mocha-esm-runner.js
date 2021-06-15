//https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
import path from 'path';
  
/** @param {string} moduleId @param {string} processCwd */
export function handleAbsolute(moduleId, processCwd) {
  if (path.isAbsolute(moduleId)) {
    return moduleId;
  } else {
    return path.join(processCwd, moduleId);
  }
}

/**
 * 
 * @param {Array<()=>Promise<any>>} arrayOfFnReturnPromis 
 * @returns {Promise<PromiseSettledResult<*>[]>}
 */
 const serialPromises = async arrayOfFnReturnPromis => {
    return Promise.allSettled(arrayOfFnReturnPromis.map(async (/** @type {() => any} */ fn) => fn()));
}

/**
 * 
 * @param {*} mochaInstance 
 * @param {*} processCwd 
 * @returns 
 */
export const getRunner = (mochaInstance, processCwd) => {
  
  const mocha = mochaInstance;
  const root = processCwd;
  
  /** @param {string} importSpecifier */
  const importModule = async importSpecifier => {
    const moduleId = handleAbsolute(importSpecifier, root);
    mocha.suite.emit('pre-require', globalThis, moduleId, mocha);
    console.log(importSpecifier)
    try {
      await import(moduleId);
    } catch (e) {
      if (e !== null && typeof e === 'object' && e.name === 'SyntaxError') {
        e.message = `\n file: '${moduleId}'\n ${e.message}`;
      }
      throw e;
    }

    mocha.suite.emit('require', null, moduleId, mocha);
    mocha.suite.emit('post-require', globalThis, moduleId, mocha);
  }
  
  /** @param {string} id */
  const createFileImportPromiseFn = id => () => importModule(id);

  const Runner = {
    /** @param {string[]} files */    
    async importModuleFiles(files) {
      const modules = await Promise.all(files.map(file=>importModule(file)));
      console.log({modules})
      return modules
    },
  
    async run() {
      return new Promise(resolve => {
        /** @param {*} failures */
        const handleFailures = failures => resolve({ failures });
        mocha.run(handleFailures);
      });
    }
  
  }
  
  return Runner;

}

/** @param {*} mocha @param {string[]} files @param {string} root*/
const testFiles = async (mocha, files, root)=> {
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

/** @param {string[]} files */
export async function main(files) {
  // @ts-ignore
  const Mocha = await import('mocha')
    .then(m=>m.default);

  const mocha = new Mocha();
  const root = process.cwd();
  setTimeout(()=>testFiles(mocha, files, root),400)
  
}