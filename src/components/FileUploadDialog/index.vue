<template>
    <div>
        <!-- 上传队列存在任务时显示的悬浮小图标，用于唤醒文件上传队列信息窗口 -->
        <div @click='showList = true' class="file-upload-dialog mdui-color-blue" v-if="fileQueue.length !==0">
            <i class="font mdui-icon material-icons">&#xe2c6;</i>
            <span class="dot">{{fileQueue.length}}</span>
        </div>

        <!-- 上传队列消息窗口 -->
        <div class="file-task-list mdui-color-theme-50" :class="{'show':showList}">
            <!-- header -->
            <div class="header mdui-color-theme-200">
                <span style="padding-left:10px;color:white">文件上传队列</span>
                <div>
                    <button @click="startUpload"><i class="mdui-icon material-icons">{{dialogBtnContent}}</i></button>
                    <button @click="showList = false"><i class="mdui-icon material-icons">close</i></button>
                </div>
            </div>
            <!-- body -->
            <ul class="task-list">
                <li v-for="(file,index) in fileQueue" :key="index">
                    <div
                        class="upload-item file"
                        :class="classObj(file)"
                        :style="`--prog:${file.prog}%`"
                    >
                        <p class="file-name">{{file.file.name}}</p>
                        <div class="info">
                            <span v-if="file.status === 'waiting'">大小：{{file.file.size | formatSizeString}}</span>
                            <span v-if="file.status === 'preparing'">文件读取中...{{file.prog}}%</span>
                            <span v-if="file.status === 'computing'">正在计算文件md5</span>
                            <span v-if="file.status === 'processing'">上传完成，服务器正在处理</span>
                            <span v-if="file.status === 'uploading'">上传进度：{{file.prog.toFixed(2)}}% 速度：{{file.speed | formatSizeString}}/s</span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import '@/css/FileIcon.css'
import StringFormatter from '@/utils/StringFormatter'
import mdui from 'mdui'
import { FileQueueHandler as FileQueue } from '@/service/FileUpload/FileUploadQueue/FileQueueHandler'
import { QueueStatus } from '@/service/FileUpload/FileUploadQueue/FileUploadQueueInfo'
export default {
    name: 'FileUploadDialog',
    data() {
        return {
            fileQueue: FileQueue.getQueue(),
            showList: false,
            executing: false,
            status: QueueStatus.EMPTY
        }
    },
    computed: {
        dialogBtnContent() {
            if (this.status == QueueStatus.EXECUTING) {
                return 'pause'
            } else {
                return 'play_arrow'
            }
        }
    },
    mounted() {
        FileQueue.addEventHandler('statusChange', s => {
            this.status = s
        }).addEventHandler('add', () => {
            if (!FileQueue.isExecuting()) {
                FileQueue.executeQueue()
                this.showList = true
            }
        }).addEventHandler('complete', () => {
            mdui.snackbar('上传任务完成')
            this.showList = false
        })
    },
    methods: {
        getFileSuffix(name) {
            return name.split('.').pop()
        },
        startUpload() {
            if (this.status === QueueStatus.EXECUTING) {
                FileQueue.pause()
            } else {
                FileQueue.resume()
            }
        },
        /**
         * @param {FileInfo} file
         */
        classObj(file) {
            const typeKey = `type-${this.getFileSuffix(file.file.name)}`
            const obj = {}
            obj['preparing-item'] = file.status === 'preparing' || file.status == 'computing'
            obj[typeKey] = true
            return obj
        }
    },
    filters: {
        formatSizeString(input) {
            return StringFormatter.formatSizeString(input)
        }
    }
}
</script>

<style lang="less" scoped>
@import './style.less';
</style>
<style>
</style>
