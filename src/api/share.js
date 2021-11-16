const { useJsonBody } = require('@/utils/FormUtils/CommonFormUtils')

/**
 * @typedef {Object} CreateShareConfig
 * @property {String} path 文件所在路径
 * @property {String} name 文件名
 * @property {String=} extractCode 提取码
 * @property {Number=} expiredAt 到期日期的unix时间戳
 */
const share = {
    prefix: 'share',
    /**
     * 创建分享
     * @param {CreateShareConfig} config 创建配置
     */
    createShare(config) {
        return useJsonBody({
            url: `${this.prefix}`,
            method: 'post',
            data: config
        })
    }
}

module.exports = share
