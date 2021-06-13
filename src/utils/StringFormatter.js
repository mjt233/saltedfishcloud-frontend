const StringFormatter = {
    /**
     * 将字节大小转化为可阅读的单位
     * @param {Number} size 文件大小（单位字节）
     * @return {String}
     */
    formatSizeString(size) {
        let showSize = size
        let suffix = 'Byte'
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
    }
}
module.exports = StringFormatter
