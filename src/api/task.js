const UrlUtils = require('@/utils/UrlUtils')

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
         * 中断（取消）一个下载中的任务
         * @param {Number} uid 用户ID
         * @param {String} taskId 任务ID
         * @returns {import("axios").AxiosRequestConfig}
         */
        interruptTask(uid, taskId) {
            return {
                url: `${this.prefix}`,
                method: 'delete',
                params: {
                    uid, taskId
                }
            }
        },
        /**
         * 获取任务列表（包括下载中与已完成的）
         * @param {Number} uid 用户ID
         * @param {('DOWNLOADING'|'FINISH'|'ALL')} type 任务类型
         * @param {Number} page 页码，从1开始
         * @param {Number} size 每页大小
         * @returns {import("axios").AxiosRequestConfig}
         */
        getTaskList(uid, type, page = 1, size = 10) {
            return {
                url: `${this.prefix}`,
                params: {
                    uid: uid,
                    page: page,
                    size: size,
                    type: type
                }
            }
        },
        /**
         * 创建一个下载任务
         * @param {DownloadTaskCreateOpt} opt 任务选项
         * @returns {import("axios").AxiosRequestConfig}
         */
        create(opt) {
            if (!opt.method) { opt.method = 'GET' }
            if (!opt.savePath) { opt.savePath = '/' }
            opt.savePath = opt.savePath.replace(/\/\/+/g, '/')
            opt.url = UrlUtils.decodeURLPath(opt.url)
            return {
                method: 'POST',
                url: this.prefix,
                headers: {
                    'Content-Type': 'application/json;charset=utf8'
                },
                data: opt
            }
        },
        getProxy() {
            return {
                url: `${this.prefix}/proxy`
            }
        }
    }
}
module.exports = task
