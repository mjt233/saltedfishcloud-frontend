const sys = {
    prefix: 'admin/sys',
    /**
     * 获取系统常规设置选项
     */
    getSysSettings() {
        return {
            url: `${this.prefix}/settings`
        }
    },
    /**
     * 获取系统总览信息
     */
    getOverviewInfo() {
        return {
            url: `${this.prefix}/overview`
        }
    },
    /**
     * 设置邀请码
     * @param {String} code 邀请码
     */
    setInviteRegCode(code) {
        return {
            url: `${this.prefix}/regCode/${code}`,
            method: 'put'
        }
    }
}

module.exports = sys