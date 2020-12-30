/**
 * @typedef {Object}    UserInfo
 * @property {String}   user        -   用户名
 * @property {Number}   type        -   用户类型 1是管理员 0是普通用户
 * @property {String}   username    -   用户名 与user相同
 */
const Global = {
    /**
     * @type {UserInfo} 用户信息
     */
    userInfo: {}
}
module.exports = Global