// const file = require('./file')
// const resource = require('./resource')
import sys from './sys'
import user from './user'
// const admin = require('./admin')
// const breakpoint = require('./breakpoint')
// const task = require('./task')
// const server = require('./server')
// const collection = require('./collection')
// const share = require('./share')

const API = {
  user,
  sys
//     file: file,
//     resource: resource,
//     admin: admin,
//     breakpoint: breakpoint,
//     task: task,
//     server: server.server,
//     proxyServer: server.proxyServer,
//     share: share,
//     sys: sys,
//     getServer: server.getServer,
//     collection: collection
}

export default API

