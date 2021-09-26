const URLUtils = {
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
        const u = new URL(url)
        path = u.pathname.split('/').map(e => decodeURIComponent(e)).join('/')
        let host = u.hostname
        const protocol = u.protocol
        const port = u.port
        if (port != 80 && port != 443) {
            host = host + ':' + port
        }
        return protocol + '//' + host + path + qs
    }
}

module.exports = URLUtils
