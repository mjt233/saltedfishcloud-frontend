const { default: Vue } = require('vue')
const { default: mdui } = require('mdui')
const { default: axios } = require('axios')
const { default: FileUtils } = require('@/utils/FileUtils')
const { emit } = require('./QueueUtils')
/**
 * @typedef {'add'|'pause'|'stop'|'upload'|'complete'|'statusChange'} QueueEvent
 */

/**
 * @typedef {Object} FileInfo
 * @property {File} file            -   文件对象
 * @property {String} api           -   上传的API地址
 * @property {Object} params        -   上传时附带的参数
 * @property {'waiting'|'preparing'|'computing'|'uploading'|'processing'|'finish'} status - 状态 waiting-等待队列中 preparing-正在准备 computing-正在计算md5 uploading-正在上传 processing-服务器处理中 finish-完成
 * @property {Number} prog          -   进度 -1为未开始 0为开始，100为完成
 * @property {Number} speed         -   传输速度 单位Byte/s
 * @property {String} md5           -   文件的md5值
 *
 */

/**
 * @callback QueueEventHandler
 * @param {FileInfo} e
 */

const queueInfo = {
    eventBinding: {
        add: [],
        pause: [],
        stop: [],
        upload: [],
        complete: [],
        statusChange: []
    },
    /**
     * @type {FileInfo[]}
     */
    queue: [],
    executing: false
}
Object.defineProperty(queueInfo, 'executing', {
    old: queueInfo.executing,
    get(v) {
        return v
    },
    set(v) {
        if (this.old != v) {
            emit(queueInfo.eventBinding.statusChange, v)
        }
        this.old = v
    }
})

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
     * 开始执行上传任务队列
     * @todo 未做上传失败时的例外处理
     */
    executeQueue() {
        // 队列状态判断
        if (this.isExecuting()) {
            return
        }

        if (queueInfo.queue.length === 0) {
            emit(queueInfo.eventBinding.complete)
            this.executing = false
            return
        }

        queueInfo.executing = true
        const task = queueInfo.queue[0]
        task.status = 'preparing'
        FileUtils.computeMd5(task.file, {
            success: e => {
                setTimeout(() => {
                    task.status = 'ready'
                    task.prog = 0
                    task.md5 = e
                    uploadHandler()
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
        const uploadHandler = () => {
            // 构造表单参数
            const fd = new FormData()
            fd.append('file', task.file)
            fd.append('md5', task.md5)
            //   将文件信息中的params附加到表单中
            for (const key in task.params) {
                if (Object.hasOwnProperty.call(task.params, key)) {
                    const value = task.params[key]
                    fd.append(key, value)
                }
            }
            // 初始化事件记录 该记录用于上传测速
            task.lastRecord = {
                date: new Date(),
                loaded: 0
            }
            // 开始上传
            task.status = 'uploading'
            axios.put(task.api, fd, {
                /**
                 * 实时更新上传进度和计算上传速度
                 * @param {ProgressEvent} e
                 */
                onUploadProgress: e => {
                    const curr = new Date()
                    task.speed = (e.loaded - task.lastRecord.loaded) * 1000 / (curr - task.lastRecord.date)
                    task.prog = (e.loaded / e.total) * 100
                    task.lastRecord = {
                        date: curr,
                        loaded: e.loaded
                    }
                    if (task.prog == 100) {
                        task.status = 'processing'
                    }
                }
            }).then(e => {
                // 上传成功
                task.status = 'finish'
                Vue.prototype.$eventBus.$emit('uploaded', queueInfo.queue[0])
                emit(queueInfo.eventBinding.upload, queueInfo.queue[0])
                this.shift()
                this.executeQueue()
            }).catch(e => {
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
            })
        }
    }
}

export default queueHandler
