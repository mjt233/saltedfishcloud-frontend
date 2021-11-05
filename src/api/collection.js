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
 * @property {Number} expiredAt 收集过期日期
 * @property {String} saveNode 收集到的文件保存目录节点ID
 * @property {String=} descript 收集任务描述
 * @property {String=} pattern 文件名匹配表达式
 * @property {Number=} allowMax 最多接收的文件次数
 * @property {Number=} maxSize 允许最大的文件大小，-1为无限制
 * @property {Boolean=} allowAnonymous 是否允许匿名用户上传
 * @property {String=} extPattern 使用字段类型收集时允许的源文件后缀名表达式
 * @property {CollectionInfoField[]=} field 字段
 */
const collection = {
    prefix: '/collection',
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
    }
}
module.exports = collection
