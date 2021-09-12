const UrlUtils = {
    /**
     * 只对URL的路径进行URL解码
     * @param {String} url 完整URL
     */
    decodeURLPath(url) {
        const i = url.indexOf('?')
        let qs = ''
        let path = url
        if (i != -1) {
            qs = decodeURIComponent(url.substr(i))
            path = url.substr(0, i)
        }
        return path + qs
    }
}
module.exports = UrlUtils
