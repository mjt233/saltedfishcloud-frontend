const file = require("./file")
const resource = require("./resource")
const user = require("./user")

/**
 * @typedef {Object} FileTransferInfo 文件复制粘贴信息
 * @property {String} source    源文件名
 * @property {String} target    粘贴/移动后的文件名（可用于重命名）
 */
const API = {
    //  webpack-dev-server反代的目标服务器
    proxyServer: 'http://127.0.0.1:8087',

    //  请求的服务器地址（不需要加/api），留空则表示后端与前端地址相同（将此项目编译后与后端一起打包，或者使用了反向代理）
    server: '',
    user: user,
    file: file,
    resource: resource

}
module.exports = API