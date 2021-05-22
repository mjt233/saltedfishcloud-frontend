const sys = {
    prefix: 'admin/sys',
    configKey: {
        STORE_TYPE: 'STORE_TYPE',
        REG_CODE: 'REG_CODE',
        SYNC_DELAY: 'SYNC_DELAY',
    },
    /**
     * 读取所有配置项信息
     */
    getAllConfig() {
        return {
            url: `${this.prefix}/config`
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
     * 设置配置项
     * @param {'STORE_TYPE' | 'REG_CODE' | 'SYNC_DELAY'} key      配置项名
     * @param {String} value    值
     */
    setConfig(key, value) {
        return {
            url: `${this.prefix}/config/${key}/${value}`,
            method: 'put'
        }
    },
    /**
     * 读配置项名
     * @param {'STORE_TYPE' | 'REG_CODE' | 'SYNC_DELAY'} key      配置项名
     * @returns 
     */
    getConfig(key) {
        return {
            url: `${this.prefix}/config/${key}`
        }
    }
}

module.exports = sys