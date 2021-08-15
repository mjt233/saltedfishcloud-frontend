import md5 from 'js-md5'
import { sliceFile } from './sliceFile'

/**
* @typedef {Object} Prog
* @property {Number} loaded
* @property {Number} total
*/

/**
 * @callback ProgCallback
 * @param {Prog} prog
 */

/**
 * @callback Md5Callback
 * @param {String} res
 */

/**
 * @callback ProgressCallback
 * @param {ProgressEvent<FileReader>} res
 */

/**
 * 将Blob转为ArrayBuffer
 * @param {Blob} blob blob数据
 * @param {ProgressCallback} onprogress 读取进度事件
 * @returns {Promise<ArrayBuffer>}
 */
function blobToArrayBuffer(blob, onprogress) {
    const reader = new FileReader()
    return new Promise((res, rej) => {
        reader.onload = () => {
            res(reader.result)
        }
        reader.onerror = rej
        reader.onprogress = e => {
            onprogress && onprogress(e)
        }
        reader.readAsArrayBuffer(blob)
    })
}
/**
 * 计算文件的md5
 * @param {File} file     文件对象
 * @param {Object} options  选项
 * @param {Md5Callback} options.success 文件读取成功且完成md5计算时执行的回调
 * @param {ProgressCallback} options.error 文件读取失败时执行的回调
 * @param {ProgCallback} options.prog   文件读取和md5计算中执行的回调
 * @author xiaotao233 <mjt233@qq.com>
 */
async function computeMd5(file, { success, error, prog }) {
    const md5obj = md5.create()

    // 按每16MiB分块读取
    const chunkSize = 1024 * 1024 * 16

    // 已读大小
    let cnt = 0
    const generator = sliceFile(file, chunkSize)
    let part
    while (!(part = generator.next()).done) {
        try {
            const buffer = await blobToArrayBuffer(part.value, e => {
                prog && prog({
                    total: file.size,
                    loaded: cnt + e.loaded
                })
            })
            md5obj.update(buffer)
            cnt += buffer.byteLength
        } catch (err) {
            error && error(err)
        }
    }
    const res = md5obj.hex()
    success && success(res)
    return res
}

export {
    computeMd5,
    blobToArrayBuffer
}
