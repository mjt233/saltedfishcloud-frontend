/**
 * @typedef {Object} ProgressInfo
 * @property {Number} total
 * @property {Number} loaded
 */

/**
 * @callback UploadProgress
 * @param {ProgressInfo} e
 */


/**
 * @typedef {Object} UploadSliceFileOpt
 * @property {File} file
 * @property {Number} begin
 * @property {String?} taskId
 * @property {UploadProgress} onUploadProg
 * @property {UploadProgress} onBlockFinish
 */

import API from '@/api'
import axios from '@/axios.config'
import FileUtils from '@/utils/FileUtils'
import { FileSliceUploader } from '@/service/FileUpload/FileUploader/FileSliceUploader'
const defsultChunkSize = 1024 * 1024 * 2

/**
 * @param {Generator<Blob>} file 文件切片生成器
 * @param {Number?|null} count 切片合并数量
 */
function nextFileSlice(file, count = 1) {
    let cnt = 0
    let tmp
    let res = new Blob()
    while (cnt < count && !(tmp = file.next()).done) {
        res = new Blob([res, tmp.value])
        cnt++
    }
    return res.size == 0 ? null : res
}


/**
 *
 * @param {UploadSliceFileOpt} param0 a
 */
async function uploadSliceFile({ file, begin = 1, taskId, onUploadProg, onBlockFinish }) {
    const record = {
        total: file.size,
        loaded: 0
    }
    const chunkRecord = {
        total: 0,
        loaded: 0
    }
    const generator = FileUtils.sliceFile(file)
    let sliceMultipie = 1
    let pos = 1
    let fileData
    const chunkCount = Math.ceil(file.size / (defsultChunkSize))

    // 创建新任务ID
    if (!taskId) {
        taskId = (await axios(API.breakpoint.createTask(file.name, file.size))).data.taskId
    }
    // 跳过前面部分
    for (let i = 1; i < pos; i++, pos++) {
        record.loaded += generator.next().value.size
    }

    let startNum = begin
    const getPartNum = (startPos, count) => {
        let endPos = startPos + count
        if (endPos > chunkCount) {
            endPos = chunkCount
        }
        return `${startPos == endPos ? startPos : `${startPos}-${endPos}`}`
    }

    const emit = isChunkFinish => {
        if (isChunkFinish) {
            record.loaded += chunkRecord.total
            onBlockFinish && onBlockFinish(record)
            onUploadProg && onUploadProg(record)
        } else {
            const data = {
                total: record.total,
                loaded: record.loaded + chunkRecord.loaded
            }
            onUploadProg && onUploadProg(data)
        }
    }

    while ((fileData = nextFileSlice(generator, sliceMultipie))) {
        chunkRecord.total = fileData.size
        chunkRecord.loaded = 0
        const start = Date.now()
        const range = getPartNum(startNum, sliceMultipie)
        const conf = API.breakpoint.uploadPart(taskId, fileData, range)
        conf.onUploadProgress = e => {
            chunkRecord.loaded = e.loaded
            emit()
        }
        await axios(conf)
        emit(true)
        const executeTime = Date.now() - start
        startNum += sliceMultipie


        if (executeTime < 1500 || executeTime > 5000) {
            const change = Math.ceil(1500 / (executeTime / sliceMultipie))
            console.log(`${sliceMultipie} -> ${change} time: ${executeTime}`)
            sliceMultipie = change
        }
    }
    return taskId
}

export {
    uploadSliceFile,
    FileSliceUploader
}
