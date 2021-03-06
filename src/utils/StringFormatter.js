const StringFormatter = {
    /**
     * 将字节大小转化为可阅读的单位
     * @param {Number} size 文件大小（单位字节）
     * @param {Number=} B Byte显示为B
     * @return {String}
     */
    toSize(size, B = false) {
        let showSize = size
        let suffix = B ? 'Byte' : 'B'
        if (size > 1024 && size <= 1048576) {
            suffix = 'KiB'
            showSize = size / 1024
        } else if (size > 1048576 && size <= 1073741824) {
            suffix = 'MiB'
            showSize = size / 1048576
        } else if (size > 1073741824) {
            suffix = 'GiB'
            showSize = size / 1073741824
        }
        return showSize.toFixed(2) + suffix
    },
    /**
     * 将Unix时间戳格式化为方便阅读的格式
     * @param {Number|String} inputDate Unix时间戳（毫秒）
     * @returns {String}
     */
    toDate(inputDate) {
        const date = new Date(inputDate)
        var month = date.getMonth() + 1
        var day = date.getDate()
        return `${date.getFullYear()}-${StringFormatter.fillLength(month, 2)}-${StringFormatter.fillLength(day, 2)} ${StringFormatter.fillLength(date.getHours(),2)}:${StringFormatter.fillLength(date.getMinutes(), 2)}`
    },
    /**
     * 将字符串填充至指定长度
     * @param {String|Number} str 待处理的字符串
     * @param {Number} len 目标长度
     * @param {'left'|'right'} position 占位字符填充位置
     * @param {String} char 占位字符
     */
    fillLength(str, len, position = 'left', char = '0') {
        const input = '' + str
        if (input.length >= len) {
            return str
        }
        const fillLength = len - input.length
        let fillBody = ''
        for(let i = 0; i < fillLength; i++) {
            fillBody += char
        }
        if (position == 'left') {
            return fillBody + input
        } else {
            return input + fillBody
        }
    }
}
module.exports = StringFormatter
