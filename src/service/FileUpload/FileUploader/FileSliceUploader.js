import API from '@/api'
import FileUtils from '@/utils/FileUtils'
import axios from 'axios'

/**
 * @typedef {Object} FileSliceUploadOpt
 * @property {File} file 文件
 * @property {Number=} chunckSize 分块大小
 * @property {import('@/utils/FormUtils/FileFormUtils').UploadProgress=} onUploadProgress 上传进度回调
 * @property {import('@/utils/FormUtils/FileFormUtils').UploadProgress=} onBlockFinish 上传分块完成回调
 * @property {Function=} onPause 进入暂停状态时的回调
 * @property {Function=} onResume 从暂停状态恢复时的回调
 */

/**
 * 尽可能获取指定份数长度的文件切片
 * 若count大于实际可获取的文件切片长度，则最终只返回可获取的文件切片。
 * 若文件生成器无法再继续获取文件切片，则返回null
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
 * 生成符合断点续传接口解析规则的文件切片长度范围字符串
 * @param {Number} startPos 起始位置
 * @param {Number} count 分片数量
 * @param {Number} chunkCount 允许的总切片分块数量
 * @returns 切片范围字符串
 */
function getPartNum(startPos, count, chunkCount) {
    let endPos = startPos + count
    if (endPos > chunkCount) {
        endPos = chunkCount
    }
    return `${startPos == endPos ? startPos : `${startPos}-${endPos}`}`
}

/**
 * 文件分片上传执行器，负责实际文件上传的执行。
 * 最好不要在外部修改该对象任意属性值，所有操作均通过{@link FileSliceUploader}进行
 */
class FileSliceUploaderExecutor {
    /**
     * 初始化一个分片上传任务
     * @param {FileSliceUploadOpt}
     */
    constructor({ file, chunckSize = 1024 * 1024 * 2, onUploadProgress, onBlockFinish, onPause, onResume }) {
        // 初始化对象属性
        this.onUploadProgress = onUploadProgress
        this.onBlockFinish = onBlockFinish
        this.onPause = onPause
        this.onResume = onResume
        this.complete = false
        // 上传总记录
        this.record = {
            total: file.size,
            loaded: 0
        }
        //  当前分块记录
        this.chunkRecord = {
            total: 0,
            loaded: 0
        }
        // 切片长度倍数
        this.sliceMultipie = 1
        // 文件切片进度
        this.startNum = 1
        this.chunkCount = Math.ceil(file.size / chunckSize)
        this.generator = FileUtils.sliceFile(file, chunckSize)
        // 是否已开始上传的标识
        this.started = false
        // 进入暂停标识
        this.inPause = false

        // 上传等待中的Promise，文件上传完成后Promise状态则为resolve
        this.wait = new Promise((resolve, reject) => {
            this.completeHandler = resolve
        })

        // 初始化Promise，创建断点续传任务和获取ID，任务初始化完成后Promise为resolve
        this.ready = new Promise((resolve, reject) => {
            axios(API.breakpoint.createTask(file.name, file.size, chunckSize)).then(e => {
                this.taskId = e.data.taskId
                resolve(this.taskId)
            }).catch(reject)
        })
    }

    /**
     * 提交事件回调，并更新进度记录
     * @param {Boolean} isChunkFinish 是否完成一个分块
     */
    emit(isChunkFinish) {
        if (isChunkFinish) {
            this.record.loaded += this.chunkRecord.total
            this.onBlockFinish && this.onBlockFinish(this.record)
            this.onUploadProgress && this.onUploadProgress(this.record)
        } else {
            const data = {
                total: this.record.total,
                loaded: this.record.loaded + this.chunkRecord.loaded
            }
            this.onUploadProgress && this.onUploadProgress(data)
        }
    }

    async upload() {
        let fileData
        while ((fileData = nextFileSlice(this.generator, this.sliceMultipie))) {
            // 重置分块记录
            this.chunkRecord.loaded = 0
            this.chunkRecord.total = fileData.size
            // 生成分块范围字符串
            const part = getPartNum(this.startNum, this.sliceMultipie, this.chunkCount)
            const conf = API.breakpoint.uploadPart(this.taskId, fileData, part)
            conf.onUploadProgress = e => {
                this.chunkRecord.loaded = e.loaded
                this.emit()
            }
            await this.canContinue()
            const start = Date.now()
            await axios(conf)
            this.emit(true)
            const executeTime = Date.now() - start
            this.startNum += this.sliceMultipie

            if (executeTime < 1500 || executeTime > 5000) {
                this.sliceMultipie = Math.ceil(1500 / (executeTime / this.sliceMultipie))
            }
        }
        this.completeHandler()
        this.complete = true
    }

    canContinue() {
        return new Promise((resolve, reject) => {
            if (!this.inPause) {
                resolve()
            } else {
                this.onPause && this.onPause()
                this.resume = resolve
            }
        })
    }
}

class FileSliceUploader {
    /**
     * 初始化一个分片上传任务
     * @param {FileSliceUploadOpt}
     */
    constructor({ file, chunckSize = 1024 * 1024 * 2, onUploadProgress, onBlockFinish, onPause, onResume }) {
        this.executor = new FileSliceUploaderExecutor({
            file: file,
            chunckSize: chunckSize,
            onUploadProgress: onUploadProgress,
            onBlockFinish: onBlockFinish,
            onPause: onPause,
            onResume: onResume
        })
    }

    /**
     * 等待任务初始化就绪，若已就绪，则Promise的resolve值为任务ID
     */
    ready() {
        return this.executor.ready
    }

    /**
     * 开始执行上传
     */
    start() {
        if (this.executor.started) return
        this.executor.started = true
        this.executor.ready.then(e => {
            this.executor.upload()
        })
    }

    /**
     * 暂停任务
     */
    pause() {
        this.executor.inPause = true
    }

    /**
     * 恢复任务
     */
    resume() {
        if (this.executor.inPause) {
            this.executor.inPause = false
            this.executor.onResume && this.executor.onResume()
            this.executor.resume()
        }
    }

    /**
     * 等待任务上传完成，若任务已完成，则该Promise为resolve
     */
    wait() {
        return this.executor.wait
    }

    isComplete() {
        return this.executor.complete
    }
}

export {
    FileSliceUploader
}
