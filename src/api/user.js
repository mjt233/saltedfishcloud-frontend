const user = {
    prefix: 'user',
    /**
     * 设置用户的类型
     * @param {Number} uid      目标用户ID
     * @param {Boolean} isAdmin 是否设为管理员
     */
    setUserType(uid, isAdmin) {
        return {
            url: `${this.prefix}/${uid}/type/${isAdmin ? '1' : '0'}`,
            method: 'put'
        }
    },
    /**
     * 获取用户列表
     * @param {Number} page 页码
     * @returns
     */
    getUserList(page = 1) {
        return {
            url: `${this.prefix}/list`,
            params: {
                page: page
            }
        }
    },
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
            method: 'post',
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
        const fd = new FormData()
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
            url: this.prefix + '/avatar' + (username ? `/${username}` : '')
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
    },

    /**
     *
     * @param {Number} uid 用户ID
     * @param {String} oldPasswd 旧密码
     * @param {String} newPasswd 新密码
     * @param {String} force     强制修改
     * @returns
     */
    modifyPasswd(uid, oldPasswd, newPasswd, force) {
        const res = {
            url: `${this.prefix}/${uid}/passwd`,
            method: 'post',
            data: {
                old: oldPasswd,
                new: newPasswd
            }
        }
        if (force) {
            res.data.force = true
        }
        return res
    }
}

module.exports = user
