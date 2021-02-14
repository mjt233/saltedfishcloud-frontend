const { default: axios } = require("axios")
const apiRoute = require('./apiRoute')
const api = {
    server: 'http://127.0.0.1:8087',
    login(user, passwd) {
        let conf = apiRoute.login
        conf.data = {
            user: user,
            passwd: passwd
        }
        return new Promise( (res, rej) => {
            axios(conf)
            .then(() => res())
            .catch(e => rej(e))
        })
    },
    getUserInfo() {
        return new Promise( (res, rej) => {
            axios(apiRoute.getUserInfo)
            .then(e => res(e.data.data))
            .catch(e => rej(e))
        })
    },
    getFileList(uid, path) {
        let conf = apiRoute.getFileList(uid, path)
        return new Promise( (res, rej) => {
            axios(conf)
            .then(e => res(e.data.data))
            .catch(e => rej(e))
        })
    }
}

export default api