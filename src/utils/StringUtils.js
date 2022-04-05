/**
 * @typedef {Object}    RandomStrOption
 * @property {Boolean}  withNumber  是否带数字
 */

const StringUtils = {
    /**
     * 取随机字符串
     * @param {Number} len 字符长度
     * @param {RandomStrOption} opt 选项
     * @return {String}
     */
    getRandomStr(len, opt) {
        let pattern = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
        if (opt !== undefined && opt.withNumber == true) {
            pattern += '1234567890'
        }
        let res = ''
        for (let i = 0; i < len; i++) {
            const index = (Math.random() * 10000) % pattern.length
            res += pattern.charAt(index)
        }
        return res
    },
    /**
     * 生成分享文本
     * @param {Object} shareInfo 分享信息对象
     * @returns {String}
     */
    generateShareText(shareInfo) {
        let res = `呐呐呐(。・∀・)ノ，我用咸鱼云向你分享了文件：${shareInfo.name}\n链接：${this.generateShareLink(shareInfo)}`
        if (shareInfo.needExtractCode) res += `\n提取码（区分大小写）：${shareInfo.extractCode}\n`
        return res
    },
    /**
     * 生成分享链接
     * @param {Object} shareInfo 分享信息对象
     * @returns {String}
     */
    generateShareLink(shareInfo) {
        return `${location.origin}/#/s/${shareInfo.id}/${shareInfo.verification}`
    },
    /**
     * 对URL字符串的每个节点进行一次URL编码转换
     * @param {String} input 表示资源路径的字符串
     */
    encodeURLPath(input) {
        return input.split('/').map(e => encodeURIComponent(e)).join('/').replace(/\/\/+/g, '/')
    },
    /**
     * 将多个路径拼接为一个路径（自动添加/或不添加/）
     * @param  {...String} path 待拼接的路径
     */
    appendPath(...path) {
        let res = ''
        path.forEach(e => {
            res += res.endsWith('/') ? e : (e.startsWith('/') ? e : ('/' + e))
        })
        return res
    }

}

module.exports = StringUtils
