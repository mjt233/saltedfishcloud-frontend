const store = {
    prefix: 'admin/store',

    /**
     * 执行数据同步
     * @param {Boolean} all 是否同步所有用户的文件数据
     * @returns {import("axios").AxiosRequestConfig}
     */
    sync(all = false) {
        return {
            url: `${this.prefix}/sync?all=${all}`,
            method: 'post'
        }
    }
}
module.exports = store
