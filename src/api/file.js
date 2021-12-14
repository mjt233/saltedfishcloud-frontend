const { useJsonBody } = require('@/utils/FormUtils/CommonFormUtils')
const StringUtils = require('@/utils/StringUtils')

/**
 * @typedef {Object} FileTransferObj
 * @property {String} source 文件所在目录
 * @property {String[]} filenames 被操作的多个文件
 * @property {String} dest  要保存到的位置
 */


const file = {
    prefix: 'diskFile',
    /**
     * 下载打包的资源
     * @param {Number} uid 用户ID
     * @param {String} wid 打包标识符
     * @param {String} alias 别名
     * @returns {import('axios').AxiosRequestConfig}
     */
    downloadWrap(uid, wid, alias) {
        return {
            url: `/${this.prefix}/${uid}/wrap/${wid}${alias ? '/' + alias : ''}`
        }
    },
    /**
     * 创建打包下载标识符
     * @param {Number} uid 用户ID
     * @param {FileTransferObj} fileTransferObj 文件操作对象，dest不要求
     * @returns {import('axios').AxiosRequestConfig}
     */
    createWrap(uid, fileTransferObj) {
        return useJsonBody({
            url: `/${this.prefix}/${uid}/wrap`,
            method: 'post',
            data: fileTransferObj
        })
    },
    /**
     * 在网盘中创建压缩文件
     * @param {Number} uid 用户ID
     * @param {FileTransferObj} fileTransferObj 文件操作对象
     * @returns {import('axios').AxiosRequestConfig}
     */
    compress(uid, fileTransferObj) {
        return useJsonBody({
            url: `/${this.prefix}/${uid}/compress`,
            method: 'post',
            data: fileTransferObj
        })
    },
    /**
     * 搜索文件
     * @param {String} uid 用户ID
     * @param {String} key 关键字
     * @param {Number} [page = 1] 页码
     * @returns
     */
    search(uid, key, page = 1) {
        return {
            url: `${this.prefix}/${uid}/fileList/byName/${key}`,
            method: 'get',
            params: {
                page: page
            }
        }
    },
    /**
     * 复制文件或目录
     * @param {Number} uid 用户ID
     * @param {String} source 原文件所在目录
     * @param {String} target 目标文件所在目录
     * @param {boolean} overwrite 是否覆盖原有文件
     * @param {FileTransferInfo} files 要操作的文件信息
     * @returns {import("axios").AxiosRequestConfig}
     */
    copy(uid, source, target, overwrite = true, files) {
        if (source == '/') source = ''
        return {
            method: 'post',
            url: `/${this.prefix}/${uid}/fromPath/${source}`,
            data: {
                target: target,
                files: files,
                overwrite: overwrite
            },
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        }
    },
    /**
     * 复制文件或目录
     * @param {Number} uid 用户ID
     * @param {String} source 原文件所在目录
     * @param {String} target 目标文件所在目录
     * @param {boolean} overwrite 是否覆盖原有文件
     * @param {FileTransferInfo} files 要操作的文件信息
     * @returns {import("_axios@0.21.1@axios").AxiosRequestConfig}
     */
    move(uid, source, target, overwrite = true, files) {
        const conf = this.copy(uid, source, target, overwrite, files)
        conf.method = 'put'
        return conf
    },
    /**
     * 取文件列表
     * @param {String} uid 用户ID
     * @param {String} path 路径
     * @returns
     */
    getFileList(uid, path) {
        if (path == '/') path = ''
        return {
            url: `${this.prefix}/${uid}/fileList/byPath/${path}`,
            method: 'get'
        }
    },
    /**
     * 创建文件夹
     * @param {String} uid 用户ID
     * @param {String} path 所在文件夹路径
     * @param {String} name 文件夹名
     * @returns
     */
    mkdir(uid, path, name) {
        if (path == '/') path = ''
        let url = `${this.prefix}/${uid}/dir/${path}`
        url = url.replace(/\/\/+/, '/')
        return {
            url: url,
            method: 'put',
            data: {
                name: name
            }
        }
    },
    /**
     * 上传文件
     * @param {Number} uid 用户ID
     * @param {String} path 资源路径
     * @param {File} file 文件
     * @param {String} md5 文件MD5
     */
    upload(uid, path, file, md5) {
        path = path.split('/').map(e => encodeURIComponent(e)).join('/')
        if (path == '/') path = ''
        return {
            url: `${this.prefix}/${uid}/file/${path}`,
            method: 'put',
            data: {
                file: file,
                md5: md5
            }
        }
    },
    /**
     *
     * @param {Number} uid 用户ID
     * @param {String} path 路径
     * @param {String[]} names 文件名
     */
    delete(uid, path, names) {
        const u = `/${this.prefix}/${uid}/content/${path}`
        return {
            url: u.replace(/\/+/g, '/'),
            method: 'delete',
            data: {
                fileName: names
            },
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        }
    },
    /**
     * 文件重命名
     * @param {String} uid 用户ID
     * @param {String} path 所在路径
     * @param {String} oldName 原文件名
     * @param {String} newName 新文件名
     * @returns
     */
    rename(uid, path, oldName, newName) {
        if (path == '/') path = ''
        return {
            url: `${this.prefix}/${uid}/name/${path}`,
            method: 'put',
            data: {
                oldName: oldName,
                newName: newName
            }
        }
    },
    /**
     *
     * @param {Number} uid 用户ID
     * @param {String} filePath 文件在网盘中的完整路径
     */
    getContent(uid, filePath) {
        return {
            url: `${this.prefix}/${uid}/content/${filePath}`
        }
    },
    /**
     * 解压文件
     * @param {Number} uid 用户ID
     * @param {String} path 压缩文件所在目录
     * @param {String} name 压缩文件名
     * @param {String} dest 解压位置
     * @returns {import("axios").AxiosRequestConfig}
     */
    unzip(uid, path, name, dest) {
        return {
            url: StringUtils.encodeURLPath(`${this.prefix}/${uid}/extractArchive/${path}`),
            method: 'post',
            data: {
                name: name,
                dest
            }
        }
    }
}

module.exports = file
