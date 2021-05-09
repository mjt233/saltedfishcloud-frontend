const resource = {
    prefix: 'resource',
    /**
     * 获取使用文件下载码下载文件的链接
     * @param {String} dc 下载码
     * @returns {String}
     */
    downloadUseFileDC(dc) {
        return `/api/${this.prefix}/0/fileContentByFDC/${dc}`
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