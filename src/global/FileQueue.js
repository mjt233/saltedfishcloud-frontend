const { default: mdui} = require('mdui')
const { default: axios } = require("axios")

/**
 * @typedef {Object} FileInfo
 * @property {File} file            -   文件对象
 * @property {String} api           -   上传的API地址
 * @property {Object} params        -   上传时附带的参数
 * @property {String} status        -   状态 ready-就绪 uploading-正在上传 finish-完成
 * @property {Number} prog          -   进度 -1为未开始 0为开始，100为完成
 * @property {Number} speed         -   传输速度 单位Byte/s
 * 
 */
let obj = {
    /**
     * @type {FileInfo[]}
     */
    queue: [],
    executing: false,
    /**
     * 
     * @param {Object} fileInfo 
     * @param {String} fileInfo.api             -   上传的API地址
     * @param {File}    fileInfo.file           -   文件对象
     * @param {Object=} fileInfo.params         -   上传时附带的参数
     */
    addFile(fileInfo) {
        // 利用FileReader读取这个文件 若发生错误则为文件夹，成功则为文件
        // 缺陷： 文件过大导致读取时间长
        let reader = new FileReader
        reader.readAsArrayBuffer(fileInfo.file)
        reader.addEventListener('error', e=> {
            mdui.alert(`"${fileInfo.file.name}"是个文件夹，浏览器不支持文件夹上传`, '提示')
        })
        reader.addEventListener('load', () => {
            fileInfo.status = 'ready'
            fileInfo.prog = -1
            fileInfo.speed = 0
            fileInfo.params = fileInfo.params ? fileInfo.params : {}
            this.queue.push(fileInfo)
        })
    },
    shift() {
        return this.queue.shift()
    },
    /**
     * @returns {FileInfo}
     */
    getQueue() {
        return this.queue
    },
    /**
     * 输入当前队列信息
     */
    printInfo() {
        console.log(this.queue)
    },
    /**
     * 开始执行上传任务队列
     * @param {Function} finish
     */
    executeQueue(finish) {
        if (this.executing) {
            return
        }
        if (this.queue.length === 0) {
            this.executing = false
            if (finish !== undefined) {
                finish()
            }
            return
        }
        let task = this.queue[0]

        // 使用FormData上传文件
        let fd = new FormData
        fd.append('file', task.file)
        // 将Params参数附加到FormData中
        for (const key in task.params) {
            if (Object.hasOwnProperty.call(task.params, key)) {
                const value = task.params[key]
                fd.append(key, value)
            }
        }
        task.lastRecord = {
            date: new Date(),
            loaded: 0
        }
        axios.post(task.api, fd, {
            /**
             * @param {ProgressEvent} e
             */
            onUploadProgress: e => {
                let curr = new Date()
                task.speed = (e.loaded - task.lastRecord.loaded)*1000/(curr - task.lastRecord.date)
                task.prog = (e.loaded/e.total)*100
                task.lastRecord = {
                    date: curr,
                    loaded: e.loaded
                }
            }
        }).then(e => {
            this.shift()
            setTimeout(() => {
                this.executeQueue()
            }, 100)
        })
    }
}


module.exports = obj