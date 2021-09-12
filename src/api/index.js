const file = require('./file')
const resource = require('./resource')
const user = require('./user')
const admin = require('./admin')
const breakpoint = require('./breakpoint')
const task = require('./task')
const server = require('./server')
/**
 * @typedef {Object} FileTransferInfo 文件复制粘贴信息
 * @property {String} source    源文件名
 * @property {String} target    粘贴/移动后的文件名（可用于重命名）
 */
const API = {
    user: user,
    file: file,
    resource: resource,
    admin: admin,
    breakpoint: breakpoint,
    task: task,
    server: server.server,
    proxyServer: server.proxyServer,
    getServer: server.getServer
}
module.exports = API
