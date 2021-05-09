const user = {
    prefix: 'user',
    /**
     * 注册新用户
     * @param {String} user 用户名
     * @param {String} passwd 密码
     * @param {String} regcode 注册码
     * @returns {Object}
     */
    regUser(user, passwd, regcode) {
        return {
            url: this.prefix,
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
            url: this.prefix + '/token',
            method: 'get',
            params: {
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
            url: this.prefix,
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
            url: this.prefix + '/avatar',
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
            url: this.prefix + '/avatar/' + username || '',
        }
    },
    /**
     * 获取配额使用情况
     * @returns 
     */
    getQuotaUsed() {
        return {
            url: this.prefix + '/quota'
        }
    }
}

module.exports = user