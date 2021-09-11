/**
 * @typedef {Object} ProxyInfo
 * @property {String} name
 * @property {('HTTP'|'SOCKS')} type
 * @property {Number} port
 * @property {Strinig} address
 */
const sys = {
    prefix: 'admin/sys',
    configKey: {
        STORE_TYPE: 'STORE_TYPE',
        REG_CODE: 'REG_CODE',
        SYNC_DELAY: 'SYNC_DELAY'
    },
    proxy: {
        prefix: '/admin/sys/proxy',
        /**
         * 删除一个代理
         * @param {String} name 代理名称
         * @returns {import("axios").AxiosRequestConfig}
         */
        deleteProxy(name) {
            return {
                url: this.prefix,
                method: 'delete',
                params: {
                    proxyName: name
                }
            }
        },
        /**
         * 添加一个代理节点
         * @param {ProxyInfo} proxy 代理信息
         * @returns {import("axios").AxiosRequestConfig}
         */
        addProxy(proxy) {
            return {
                url: this.prefix,
                method: 'post',
                data: proxy
            }
        },
        /**
         * 获取所有代理信息
         * @returns {import("axios").AxiosRequestConfig}
         */
        getAllProxy() {
            return {
                url: this.prefix,
                method: 'get'
            }
        },
        /**
         * 更新一个代理信息
         * @param {String} name 原代理名称
         * @param {ProxyInfo} proxy 代理信息
         * @returns {import("axios").AxiosRequestConfig}
         */
        updateProxy(name, proxy) {
            return {
                url: this.prefix,
                method: 'put',
                params: {
                    proxyName: name,
                    type: proxy.type,
                    port: proxy.port,
                    address: proxy.address,
                    name: proxy.name
                }
            }
        }
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
