const user = {
    prefix: 'user',
    /**
     * 更新token
     */
    updateToken() {
        return {
            url: `${this.prefix}/updateToken`,
            method: 'post'
        }
    },
    /**
     * 绑定新邮箱
     * @param {String} newEmail 新邮箱
     * @param {String} originCode 旧邮箱验证码，若先前未绑定邮箱则不需要
     * @param {String} newCode 新邮箱验证码
     * @returns {import("axios").AxiosRequestConfig}
     */
    bindNewEmail(newEmail, originCode, newCode) {
        return {
            url: `${this.prefix}/newMail`,
            method: 'post',
            data: {
                email: newEmail,
                originCode: originCode,
                newCode: newCode
            }
        }
    },
    /**
     * 用于验证旧邮箱的验证码是否正确
     * @param {String} code 验证码
     * @returns {import("axios").AxiosRequestConfig}
     */
    verifyEmail(code) {
        return {
            url: `${this.prefix}/verifyEmail`,
            method: 'post',
            data: {
                code: code
            }
        }
    },
    /**
     * 发送用于验证旧邮箱的验证码
     * @returns {import("axios").AxiosRequestConfig}
     */
    sendVerifyEmail() {
        return {
            url: `${this.prefix}/sendVerifyEmail`,
            method: 'post'
        }
    },
    /**
     * 发送重置密码邮箱验证码
     * @param {String} account 用户名或邮箱
     * @param {String} code 验证码
     * @param {String} password 新密码
     * @returns {import("axios").AxiosRequestConfig}
     */
    resetPassword(account, code, password) {
        return {
            url: `${this.prefix}/resetPassword`,
            data: {
                account: account,
                code: code,
                password: password
            },
            method: 'post'
        }
    },
    /**
     * 发送重置密码邮箱验证码
     * @param {String} account 用户名或邮箱
     * @returns {import("axios").AxiosRequestConfig}
     */
    sendResetPasswordEmail(account) {
        return {
            url: `${this.prefix}/sendResetPasswordEmail`,
            data: {
                account: account
            },
            method: 'post'
        }
    },
    /**
     * 获取邮箱注册验证码
     * @param {String} email 接收的邮箱
     */
    getEmailRegCode(email) {
        return {
            url: `${this.prefix}/regcode`,
            data: {
                email: email
            },
            method: 'post'
        }
    },
    /**
     * 获取系统开放的注册类型
     */
    getRegType() {
        return {
            url: `${this.prefix}/regType`
        }
    },
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
