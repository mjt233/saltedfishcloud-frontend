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
    },
    /**
     * 获取资源分享基本信息
     * @param {String} sid 分享ID
     * @param {String} verification 分享校验码
     * @param {String=} extractCode 资源提取码
     * @returns {import('axios').AxiosRequestConfig}
     */
    getBaseShareInfo(sid, verification, extractCode) {
        const params = {}
        if (extractCode) { params.code = extractCode }
        return {
            url: `${this.prefix}/${sid}/${verification}`,
            params: params
        }
    }
}

module.exports = share
