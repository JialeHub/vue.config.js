// import * as modulesApi from './Modules'
// import * as otherApi from './other'

// 自动获取modules下的*.js
const modulesFiles = require.context('./modules', true, /\.js$/)
let modulesApi = modulesFiles.keys().reduce((modules, modulePath) => {
  // const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  for (let key in modulesFiles(modulePath)) {
    modules[key] = modulesFiles(modulePath)[key]
  }
  return modules
}, {})

// 自动获取other下的*.js
const otherFiles = require.context('./other', true, /\.js$/)
let otherApi = otherFiles.keys().reduce((modules, modulePath) => {
  // const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  for (let key in modulesFiles(modulePath)) {
    modules[key] = modulesFiles(modulePath)[key]
  }
  return modules
}, {})

export default {...modulesApi, ...otherApi}
