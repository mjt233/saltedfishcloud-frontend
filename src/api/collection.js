/**
 * @typedef {Object} CollectionInfoField
 * @property {String} name 字段名
 * @property {('TEXT'|'OPTION')} type 字段类型
 * @property {String=} value 默认值
 * @property {String=} describe 字段描述
 * @property {String=} pattern 要求字段值匹配的正则
 * @property {String[]=} options 候选项（仅当type为OPTION时有效）
 */

/**
 * @typedef {Object} CollectionInfo
 * @property {String} title 标题
 * @property {String} nickname 接收者署名
 * @property {Number} expireddAt 收集过期日期
 * @property {String} saveNode 收集到的文件保存目录节点ID
 * @property {String=} describe 收集任务描述
 * @property {String=} pattern 文件名匹配表达式
 * @property {Number=} allowMax 最多接收的文件次数
 * @property {Number=} maxSize 允许最大的文件大小，-1为无限制
 * @property {Boolean=} allowAnonymous 是否允许匿名用户上传
 * @property {String=} extPattern 使用字段类型收集时允许的源文件后缀名表达式
 * @property {CollectionInfoField[]=} field 字段
 */

/**
 * @typedef {Object} FieldInfo
 * @property {String} name 字段名称
 * @property {String} value 值
 */

/**
 * @typedef {Object} SubmitInfo
 * @property {String} filename 文件名
 * @property {FieldInfo[]} field 字段数组
 */
const collection = {
    prefix: '/collection',
    /**
     * 提交一个文件到收集任务中
     * @param {Number} cid 收集ID
     * @param {String} vid 校验码
     * @param {SubmitInfo} submitInfo 附加提交信息
     * @param {File} file 文件
     * @returns {import("axios").AxiosRequestConfig}
     */
    submit(cid, vid, submitInfo, file) {
        console.log(submitInfo)
        const fd = new FormData()
        fd.append('submitInfo', new Blob([window.JSON.stringify(submitInfo)], { type: 'application/json' }))
        fd.append('file', file)
        return {
            url: `${this.prefix}/${cid}/${vid}`,
            method: 'post',
            data: fd
        }
    },
    /**
     * 创建一个收集任务
     * @param {CollectionInfo} collectionInfo
     * @returns {import("axios").AxiosRequestConfig}
     */
    create(collectionInfo) {
        return {
            method: 'post',
            url: this.prefix,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            data: collectionInfo
        }
    },
    /**
     * 获取当前用户创建的收集任务
     * @returns {import("axios").AxiosRequestConfig}
     */
    getCreated() {
        return {
            url: this.prefix
        }
    },
    /**
     * 获取收集信息
     * @param {Number} cid 收集ID
     * @param {Number} verification 校验码
     */
    getCollectionInfo(cid, verification) {
        return {
            url: `${this.prefix}/${cid}/${verification}`
        }
    }
}
module.exports = collection
