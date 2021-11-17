const { useJsonBody } = require('@/utils/FormUtils/CommonFormUtils')

/**
 * @typedef {Object} CreateShareConfig
 * @property {String} path 文件所在路径
 * @property {String} name 文件名
 * @property {String=} extractCode 提取码
 * @property {Number=} expiredAt 到期日期的unix时间戳
 */
const share = {
    prefix: '/share',
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
    },
    /**
     * 浏览分享目录
     * @param {Number} sid 收集ID
     * @param {String} verification 校验码
     * @param {String} extractCode 提取码
     */
    browseDirShare(sid, verification, extractCode, path) {
        path = path.split('/').map(e => encodeURIComponent(e)).join('/')
        let url = `${this.prefix}/view/${sid}/${verification}/${path}`
        url = url.replace(/\/\/+/, '/')
        return {
            url: url,
            params: {
                code: extractCode
            }
        }
    },
    /**
     *
     * @param {Number} sid 分享ID
     * @param {String} verification 分享校验码
     * @param {String} code 提取码
     * @param {String} path 资源所在路径
     * @param {String} name 文件名
     * @returns
     */
    getFileContent(sid, verification, code, path, name) {
        path = path.split('/').map(e => encodeURIComponent(e)).join('/')
        if (name) name = encodeURIComponent(name)
        return {
            url: `${this.prefix}/resource`,
            params: {
                sid: sid,
                verification: verification,
                code: code,
                path: path,
                name: name
            }
        }
    }
}

module.exports = share
