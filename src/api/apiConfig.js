const apiConfig = {
    server: 'http://127.0.0.1:8087',
    user: {
        regUser: {
            url: 'regUser',
            method: 'post'
        },
        login(user, passwd) {
            return {
                url: 'User/login',
                method: 'post',
                data: {
                    user: user,
                    passwd: passwd
                }
            }
        },
        getUserInfo: {
            url: 'user',
            method: 'get'
        }
    },
    resource: {
        parseNodeId: {
            url: 'resource/getPath',
            method: 'get'
        },
        getFileList(uid, path) {
            return {
                url: `fileList/${uid}/${path}`,
                method: 'get'
            }
        },
        /**
         * 
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
        search(uid) {
            return {
                url: `resource/search/${uid}`,
                method: 'get'
            }
        },
        mkdir(uid, path, name) {
            return {
                url: `mkdir/${uid}/${path}`,
                method: 'post',
                data: {
                    name: name
                }
            }
        },
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
export default apiConfig