const resource = {
    prefix: 'resource',
    /**
     * 获取路径途径的节点信息
     * @param {Number} uid 用户ID
     * @param {String} path 路径
     * @returns {import("axios").AxiosRequestConfig}
     */
    getNodeInfo(uid, path) {
        path = path.replace(/\/+/g, '/')
        if (path.startsWith('/')) {
            path = path.substr(1)
        }
        return {
            url: `${this.prefix}/${uid}/node/${path}`
        }
    },
    /**
     * 通过MD5下载文件
     * @param {String} md5 文件MD5
     * @param {String} alias 文件重命名
     */
    downloadFileByMD5(md5, alias) {
        return {
            url: `${this.prefix}/0/fileContentByMD5/${md5}/${encodeURIComponent(alias)}`
        }
    },
    /**
     * 获取使用文件下载码下载文件的链接
     * @param {String} dc 下载码
     * @param {Boolean} directDownload 是否直接下载
     * @param {String=} name 文件名
     * @returns {String}
     */
    downloadUseFileDC(dc, directDownload = false, name = '') {
        let baseURI = `${this.prefix}/0/fileContentByFDC/${dc}`
        if (name !== '') baseURI += `/${encodeURIComponent(name)}`
        if (directDownload) baseURI += '?download=true'
        return baseURI
    },
    /**
     *
     * @param {Number} uid 用户ID
     * @param {String} path 文件所在目录
     * @param {String} name 文件名
     * @param {String} md5 文件MD5
     * @param {Number} expr 有效期（单位：天，负数为无限制）
     * @returns
     */
    getFileDC(uid, path, name, md5, expr) {
        return {
            url: `${this.prefix}/${uid}/FDC/${path}`,
            params: {
                name: name,
                md5: md5,
                expr: expr
            }
        }
    },
    /**
     * 解析节点ID取路径
     * @param {Number} uid 用户ID
     * @param {String} nodeId 节点ID
     * @returns
     */
    parseNodeId(uid, nodeId) {
        return {
            url: `${this.prefix}/${uid}/path/${nodeId}`
        }
    }
}

module.exports = resource
