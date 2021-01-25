/**
 * 用户信息
 * @typedef {Object} UserInfo
 * @property {String} user 用户名
 * @property {String} username 用户名
 * @property {Number} type 类型 1是管理员 0是普通用户
 * @property {Number} id 用户ID编号
 */

/**
 * 服务器传来的原始文件信息
 * @typedef {Object} ServerRawFileInfo
 * @property {String} name 文件名
 * @property {Number} type 文件类型 1为目录 0为文件
 */

/**
 * 基础文件信息 
 * @typedef {Object} BaseFileInfo
 * @property {String}   name    -   文件名
 * @property {String}   type    -   文件类型 dir或file
 */
/**
 * @typedef {Object}    DropItemInfo
 * @property {FileList|DataTransferItemList}   files               -   文件对象列表
 * @property {String[]}   path              -   路径数组
 * @property {BaseFileInfo}   target        -   被拖动到的对象属性
 */

 /**
  * @typedef {Object} FileInfo
  * @property {String}   name    -   文件名
  * @property {String}   type    -   文件类型 dir或file
  * @property {String[]} path    -   文件所在路径
  */
module.exports = {}