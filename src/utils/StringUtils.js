/**
 * @typedef {Object}    RandomStrOption
 * @property {Boolean}  withNumber  是否带数字
 */

let StringUtils = {
    /**
     * 取随机字符串
     * @param {Number} len 字符长度
     * @param {RandomStrOption} opt 选项
     * @return {String}
     */
    getRandomStr(len, opt) {
        let pattern = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
        if (opt !== undefined && opt.withNumber == true) {
            pattern += '1234567890'
        }
        let res = ''
        for (let i = 0; i < len; i++) {
            let index = (Math.random()*10000)%pattern.length
            res += pattern.charAt(index)
        }
        return res
    }

}

module.exports = StringUtils