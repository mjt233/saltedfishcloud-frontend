import { FileSliceUploader } from '@/utils/FormUtils/FileFormUtils'
import { FileUploadQueue as queueInfo, QueueStatus } from './FileUploadQueueInfo'
import { emit } from './QueueUtils'
import Vue from 'vue'
import mdui from 'mdui'
import axios from 'axios'
import FileUtils from '@/utils/FileUtils'
import API from '@/api'
import { getChunkSize } from '@/utils/FileUtils/sliceFile'


/**
 * @typedef {'add'|'pause'|'stop'|'upload'|'complete'|'statusChange'|'paused'|'pausing'|'resume'} QueueEvent
 */

/**
 * @typedef {'waiting'|'preparing'|'computing'|'uploading'|'paused'|'pausing'|'processing'|'finish'} FileStatus
 */

/**
 * @typedef {Object} FileInfo
 * @property {File} file            -   文件对象
 * @property {String} api           -   上传的API地址
 * @property {Object} params        -   上传时附带的参数
 * @property {FileStatus} status    -   状态 waiting-等待队列中 preparing-正在准备 computing-正在计算md5 uploading-正在上传 processing-服务器处理中 finish-完成
 * @property {Number} prog          -   进度 -1为未开始 0为开始，100为完成
 * @property {Number} speed         -   传输速度 单位Byte/s
 * @property {String} md5           -   文件的md5值
 *
 */

/**
 * @callback QueueEventHandler
 * @param {FileInfo} e
 */


const queueHandler = {
    isExecuting() {
        return queueInfo.queue.length != 0 && queueInfo.queue[0].status != 'waiting'
    },
    /**
     * 添加一个事件绑定
     * @param {QueueEvent} event 要添加绑定事件名称
     * @param {QueueEventHandler} handler 事件回调
     * @returns {queueHandler}
     */
    addEventHandler(event, handler) {
        queueInfo.eventBinding[event].push(handler)
        return this
    },
    /**
     * 移除一个事件绑定
     * @param {QueueEvent} event 要添加绑定事件名称
     * @param {QueueEventHandler} handler 事件回调
     */
    removeEventHandler(event, handler) {
        let targetIndex
        queueInfo.eventBinding[event].forEach((e, i) => {
            if (e === handler) {
                targetIndex = i
            }
        })
        queueInfo.eventBinding[event].splice(targetIndex, 1)
    },
    /**
     *
     * @param {Object} fileInfo
     * @param {String} fileInfo.api             -   上传的API地址
     * @param {File}    fileInfo.file           -   文件对象
     * @param {Object=} fileInfo.params         -   上传时附带的参数
     */
    addFile(fileInfo) {
        fileInfo.status = 'waiting'
        fileInfo.prog = -1
        fileInfo.speed = 0
        fileInfo.params = fileInfo.params ? fileInfo.params : {}
        queueInfo.queue.push(fileInfo)
        emit(queueInfo.eventBinding.add, fileInfo)
    },
    shift() {
        return queueInfo.queue.shift()
    },
    /**
     * @returns {FileInfo}
     */
    getQueue() {
        return queueInfo.queue
    },
    /**
     * 输出当前队列信息
     */
    printInfo() {
        console.log(queueInfo.queue)
    },
    /**
     * 暂停队列，若正在上传，则会等待当前文件块上传完毕
     * @todo 修改为终止当前上传的文件块
     */
    pause() {
        if (queueInfo.uploader) {
            emit(queueInfo.eventBinding.pausing)
            queueInfo.uploader.pause()
            queueInfo.status = QueueStatus.PAUSING
        }
    },
    /**
     * 从暂停状态中恢复
     */
    resume() {
        if (!queueInfo.uploader) return
        queueInfo.uploader.resume()
        queueInfo.status = QueueStatus.EXECUTING
    },
    /**
     * 开始执行上传任务队列
     * @todo 未做上传失败时的例外处理
     * @todo 使用责任链模式处理发送前后动作
     */
    executeQueue() {
        // 正在执行任务时忽略本次（若任务被暂停需要使用resume方法）
        if (queueInfo.uploader) {
            return
        }

        // 队列为空则为已完成
        if (queueInfo.queue.length === 0) {
            emit(queueInfo.eventBinding.complete)
            queueInfo.status = QueueStatus.EMPTY
            return
        }

        const task = queueInfo.queue[0]
        task.status = 'preparing'
        queueInfo.status = QueueStatus.EXECUTING
        const successCallback = () => {
            queueInfo.uploader = null
            Vue.prototype.$eventBus.$emit('uploaded', queueInfo.queue[0])
            emit(queueInfo.eventBinding.upload, queueInfo.queue[0])
            this.shift()
            this.executeQueue()
        }
        FileUtils.computeMd5(task.file, {
            success: e => {
                setTimeout(async() => {
                    task.status = 'ready'
                    task.prog = 0
                    task.md5 = e
                    const quickSaveRes = await axios(API.file.quickSave(task.uid, task.path, task.file.name, task.md5))
                    if (quickSaveRes.data.code == 200) {
                        successCallback()
                        console.log('秒传')
                    } else {
                        uploadHandler()
                    }
                }, 100)
            },
            error: e => {
                mdui.alert(`${task.file.name} 为文件夹，无法上传`)
                this.shift()
                this.executeQueue()
            },
            prog: e => {
                task.prog = ((e.loaded / e.total) * 100).toFixed(2)
                if (task.prog == 100) {
                    task.status = 'computing'
                }
            }
        })
        /**
         * 上传动作函数
         */
        const uploadHandler = async() => {
            queueInfo.uploader = new FileSliceUploader({
                file: task.file,
                chunckSize: getChunkSize(task.file.size),
                onUploadProgress: e => {
                    const curr = new Date()
                    const speed = (e.loaded - task.lastRecord.loaded) * 1000 / (curr - task.lastRecord.date)
                    if (speed > 0) {
                        task.speed = speed
                    }
                    task.prog = (e.loaded / e.total) * 100
                    task.lastRecord = {
                        date: curr,
                        loaded: e.loaded
                    }
                    if (task.prog == 100) {
                        task.status = 'processing'
                    }
                },
                onPause() {
                    emit(queueInfo.eventBinding.paused)
                    queueInfo.status = QueueStatus.PAUSED
                }
            })
            // 构造表单参数
            const fd = new FormData()
            fd.append('md5', task.md5)
            //   将文件信息中的params附加到表单中
            for (const key in task.params) {
                if (Object.hasOwnProperty.call(task.params, key)) {
                    const value = task.params[key]
                    fd.append(key, value)
                }
            }
            // 开始上传
            task.status = 'uploading'
            task.lastRecord = {
                date: new Date(),
                loaded: 0
            }
            const taskId = await queueInfo.uploader.ready()
            queueInfo.uploader.start()
            await queueInfo.uploader.wait()
            try {
                await axios.put(`${task.api}?breakpoint_id=${taskId}`, fd)
                // 上传成功
                task.status = 'finish'
                successCallback()
            } catch (e) {
                queueInfo.uploader = null
                const msg = `
                    <strong>错误：${e.msg}</strong><br>
                    <p>文件名：${task.file.name}</p>
                    <p>大小：${task.file.size}</p>
                    <p style="word-break:break-all">上传API地址：${decodeURIComponent(task.api)}</p>
                `
                mdui.alert(msg, () => {
                    task.status = 'error'
                    Vue.prototype.$eventBus.$emit('uploaderr', {
                        file: this.shift(),
                        error: e
                    })
                    this.executeQueue()
                }, {
                    modal: true
                })
            }
        }
    }
}

export {
    queueHandler as FileQueueHandler
}
