/**
 * @typedef {Object} DownloadTaskCreateOpt
 * @property {String} url 文件URL
 * @property {String=} savePath 文件在用户网盘保存路径
 * @property {String} uid 保存到的用户
 * @property {('GET'|'POST')} method 请求方法
 * @property {String} proxy 使用的代理通道
 * @property {Object=} headers 额外请求头
 */
const task = {
    download: {
        prefix: '/task/download',
        /**
         * 创建一个下载任务
         * @param {DownloadTaskCreateOpt} opt 任务选项
         * @returns {import("axios").AxiosRequestConfig}
         */
        create(opt) {
            if (!opt.method) { opt.method = 'GET' }
            if (!opt.savePath) { opt.savePath = '/' }
            opt.savePath = opt.savePath.replace(/\/\/+/g, '/')
            return {
                method: 'POST',
                url: this.prefix,
                headers: {
                    'Content-Type': 'application/json;charset=utf8'
                },
                data: opt
            }
        }
    }
}
module.exports = task
