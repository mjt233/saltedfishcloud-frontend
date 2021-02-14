const apiConfig = {
    server: 'http://127.0.0.1:8087',
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
    },
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
    search(uid) {
        return {
            url: `resource/search/${uid}`,
            method: 'get'
        }
    }

}
export default apiConfig