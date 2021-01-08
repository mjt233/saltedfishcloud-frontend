const { default: Vue} = require('vue')
const { default: mdui} = require('mdui')
const { default: axios } = require("axios")
const md5 = require('js-md5')

/**
 * @typedef {Object} FileInfo
 * @property {File} file            -   文件对象
 * @property {String} api           -   上传的API地址
 * @property {Object} params        -   上传时附带的参数
 * @property {String} status        -   状态 waiting-等待队列中 preparing-正在准备 computing-正在计算md5 uploading-正在上传 processing-服务器处理中 finish-完成
 * @property {Number} prog          -   进度 -1为未开始 0为开始，100为完成
 * @property {Number} speed         -   传输速度 单位Byte/s
 * @property {String} md5           -   文件的md5值
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
     * @param {String[]}  path                  -   文件所在路径
     * @param {Object=} fileInfo.params         -   上传时附带的参数
     */
    addFile(fileInfo) {
        fileInfo.status = 'waiting'
        fileInfo.prog = -1
        fileInfo.speed = 0
        fileInfo.params = fileInfo.params ? fileInfo.params : {}
        this.queue.push(fileInfo)
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
     * @todo 未做上传失败时的例外处理
     * @param {Function} finish
     */
    executeQueue(finish) {
        if (this.executing) {
            mdui.snackbar('已经正在上传了,剩余任务数量：' + this.queue.length)
            return
        }
        if (this.queue.length === 0) {
            mdui.snackbar('上传任务完成')
            this.executing = false
            if (finish !== undefined) {
                finish()
            }
            return
        }
        this.executing = true
        let task = this.queue[0]

        // 先读取文件md5
        let reader = new FileReader
        reader.readAsArrayBuffer(task.file)
        task.status = 'preparing'
        reader.onerror = () => {
            mdui.alert(`${task.file.name} 为文件夹，无法上传`)
            this.executing = false
            this.queue.shift()
            this.executeQueue()
        }
        reader.onprogress = e => {
            task.prog = ((e.loaded/e.total)*100).toFixed(2)
            if (task.prog == 100) {
                task.status = 'computing'
            }
        }

        reader.onload = () => {
            setTimeout(() => {
                task.status = 'ready'
                task.prog = 0
                task.md5 = md5(reader.result)
                uploadHandler()
            }, 100)
        }
        /**
         * 上传动作函数
         */
        let uploadHandler = () => {

            // 构造表单参数
            let fd = new FormData
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
                    let curr = new Date()
                    task.speed = (e.loaded - task.lastRecord.loaded)*1000/(curr - task.lastRecord.date)
                    task.prog = (e.loaded/e.total)*100
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
                Vue.prototype.$eventBus.$emit('uploaded', this.queue[0])
                this.executing = false
                this.shift()
                this.executeQueue()
            }).catch(e => {
                let msg = `
                    <strong>错误：${e}</strong><br>
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
                    this.executing = false
                    this.executeQueue()
                },{
                    modal: true
                })
            })
        }
    }
}


module.exports = obj