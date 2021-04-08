const apiConfig = {
    //  webpack-dev-server反代的目标服务器
    proxyServer: 'http://127.0.0.1:8087',

    //  请求的服务器地址
    server: '',
    user: {
        /**
         * 注册新用户
         * @param {String} user 用户名
         * @param {String} passwd 密码
         * @param {String} regcode 注册码
         * @returns {Object}
         */
        regUser(user, passwd, regcode) {
            return {
                url: 'regUser',
                method: 'post',
                data: {
                    user: user,
                    passwd: passwd,
                    regcode: regcode
                }
            }
        },
        /**
         * 用户登录
         * @param {String} user 用户
         * @param {String} passwd 密码
         * @returns 
         */
        login(user, passwd) {
            return {
                url: 'login',
                method: 'post',
                data: {
                    user: user,
                    passwd: passwd
                }
            }
        },
        /**
         * 获取用户信息
         */
        getUserInfo() {
            return {
                url: 'user',
                method: 'get'
            }
        },
        /**
         * 上传用户头像
         * @param {File} img 头像文件
         * @returns 
         */
        uploadAvatar(img) {
            let fd = new FormData
            fd.append('file', img)
            return {
                url: 'uploadAvatar',
                method: 'post',
                data: fd
            }
        },
        /**
         * 获取用户头像
         * @param {String} username 用户名
         * @returns 
         */
        getAvatar(username) {
            return {
                url: username ? `getAvatar/${username}` : 'getAvatar',
            }
        },
        /**
         * 获取配额使用情况
         * @returns 
         */
        getQuotaUsed() {
            return {
                url: 'quotaUsed'
            }
        }
    },
    resource: {
        /**
         * 获取使用文件下载码下载文件的链接
         * @param {String} dc 下载码
         * @returns 
         */
        downloadUseFileDC(dc) {
            let server = apiConfig.server || location.origin
            return {
                url: `${server}/api/fdc/${dc}`
            }
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
                url: `resource/getFDC/${uid}/${path}`,
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
                url: 'resource/getPath',
                method: 'get',
                data: {
                    uid: uid,
                    nodeId: nodeId
                }
            }
        },
        /**
         * 取文件列表
         * @param {String} uid 用户ID
         * @param {String} path 路径
         * @returns 
         */
        getFileList(uid, path) {
            return {
                url: `fileList/${uid}/${path}`,
                method: 'get'
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
            return {
                url: `fileList/${uid}/${path}`,
                method: 'put',
                data: {
                    file: file,
                    md5: md5
                }
            }
        },
        /**
         * 搜索文件
         * @param {String} uid 用户ID
         * @returns 
         */
        search(uid) {
            return {
                url: `resource/search/${uid}`,
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
            return {
                url: `mkdir/${uid}/${path}`,
                method: 'post',
                data: {
                    name: name
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
            return {
                url: `rename/${uid}/${path}`,
                method: 'post',
                data: {
                    oldName: oldName,
                    newName: newName
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
            return {
                url: `resource/${uid}/${path}`,
                method: 'delete',
                data: {
                    fileName: names
                },
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
        }
    }

}
module.exports = apiConfig