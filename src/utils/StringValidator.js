const StringValidator = {

    /**
     * 判断输入的字符串是否为有效的邮箱格式
     * @param {String} email 待验证的邮箱地址
     */
    isEmail(email) {
        return email.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/) != null
    }
}


module.exports = StringValidator
