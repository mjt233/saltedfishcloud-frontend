// const sys = require('./sys')
// const debug = require('./debug')
// const store = require('./store')
// const admin = {
//     prefix: 'admin',
//     sys: sys,
//     debug: debug,
//     store: store
// }

// module.exports = admin


import sys from './sys'
import proxy from './proxy'
import cluster from './cluster'
export {
  sys,
  proxy,
  cluster
}