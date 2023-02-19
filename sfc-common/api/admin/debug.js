const debug = {
    prefix: 'admin/debug',
    getAllOptions() {
        return {
            url: `${this.prefix}/options`
        }
    },
    /**
     * 设置系统保护级别
     * @param {String} level 保护级别，可选null, DATA_MOVING,DATA_CHECKING
     */
    setReadOnlyLevel(level) {
        return {
            url: `${this.prefix}/readOnly`,
            method: 'put',
            data: {
                level: level
            }
        }
    }
}

module.exports = debug
