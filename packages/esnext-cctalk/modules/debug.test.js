import Debug from './debug.js'

/** we use dynamic import + hash# tags to get new modules */
/*
describe('debug.js', () => {
    
    it('returns Npm Debug If Debug Env And Node', async () => {
        // @ts-nocheck
        const p = globalThis.process;
        globalThis.process.env.DEBUG = '*'
        //NodeEnv none production DEBUG returns DEBUG
        const returnsNpmDebugIfDebugEnvAndNode = await import('./debug.js#DEBUG').then(m=>m.default)
        console.log(Object.keys(returnsNpmDebugIfDebugEnvAndNode))
        process.exit(0)
        console.log(returnsNpmDebugIfDebugEnvAndNode)
        returnsNpmDebugIfDebugEnvAndNode("w")('d')

    })

})

// NodeEnvProduction
//NodeEnv production DEBUG returns DEBUG
globalThis.process.env.NODE_ENV = 'production'
const returnsNpmDebugIfNodeEnvProductionandDebugEnv = await import('../modules/debug.js#debug-production').then(m=>m.default)
console.log(returnsNpmDebugIfNodeEnvProductionandDebugEnv)
returnsNpmDebugIfNodeEnvProductionandDebugEnv("w")('d')

//NodeEnv production none DEBUG
delete globalThis.process.env.DEBUG 
const returnsNoOpWithoutDebugInProductionNode = await import('../modules/debug.js#production').then(m=>m.default)
console.log(returnsNoOpWithoutDebugInProductionNode)
returnsNoOpWithoutDebugInProductionNode("w")('d')


//NodeEnv none production none DEBUG returnss debugLog
globalThis.process.env.NODE_ENV = ''
const returnsDebugConsoleLogWhenInNodeAndNotProduction = await import('../modules/debug.js#otherenv').then(m=>m.default)
console.log(returnsDebugConsoleLogWhenInNodeAndNotProduction)
returnsDebugConsoleLogWhenInNodeAndNotProduction("w")('d')

//Test None NodeJs Env
globalThis.process = undefined
const returnsNoOpIfNotRunningInNode = await Promise.resolve().then(()=>import('../modules/debug.js#32').then(m=>m.default))
console.log(returnsNoOpIfNotRunningInNode)
returnsNoOpIfNotRunningInNode("w")('d')
//Debug()()
export {}
*/