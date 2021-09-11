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
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
    }
}
module.exports = StringFormatter
