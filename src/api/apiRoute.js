const route = {
    regUser: {
        url: 'regUser',
        method: 'post'
    },
    login: {
        url: 'User/login',
        method: 'post'
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
    }

}
module.exports = route