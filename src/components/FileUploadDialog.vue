<template>
    <div>
        <div @click='showList = true' class="file-upload-dialog mdui-color-blue" v-if="fileQueue.length !==0">
            <i class="font mdui-icon material-icons">&#xe2c6;</i>
            <span class="dot">{{fileQueue.length}}</span>
        </div>
        <div class="file-task-list mdui-color-theme-50" :class="{'show':showList}">
            <div class="header mdui-color-theme-200">
                <span style="padding-left:10px;color:white">文件上传队列</span>
                <div>
                    <button @click="startUpload">上传</button>
                    <button @click="showList = false">隐藏</button>
                </div>
            </div>
            <ul class="task-list">
                <li v-for="(file,index) in fileQueue" :key="index">
                    <div
                        class="upload-item file"
                        :class="classObj(file)"
                        :style="`--prog:${file.prog}%`"
                    >
                        <p class="file-name">{{file.file.name}}</p>
                        <div class="info">
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
import FileQueue from '../global/FileQueue'
import '../css/FileIcon.css'
import StringFormatter from '../utils/StringFormatter'
export default {
    name: 'FileUploadDialog',
    data() {
        return {
            fileQueue: FileQueue.getQueue(),
            prepareInfo: FileQueue.preparing,
            showList: false
        }
    },
    methods: {
        getFileSuffix(name) {
            return name.split('\.').pop()
        },
        startUpload() {
            FileQueue.executeQueue()
        },
        /**
         * @param {FileInfo} file
         */
        classObj(file) {
            let typeKey = `type-${this.getFileSuffix(file.file.name)}`
            let obj = {}
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
.file-upload-dialog {
    position: fixed;
    bottom: 64px;
    right: 64px;
    padding: 12px;
    border-radius: 50%;
    cursor: pointer;
    user-select: none;
    >.font {
        font-size: 24px;
        color: white;
    }
    >.dot {
        position: absolute;
        text-align: center;
        top: 0;
        right: 0;
        line-height: 18px;
        width: 18px;
        height: 18px;
        background-color: red;
        color: black;
        border-radius: 50%;
        font-size: 4px;
    }
}
.file-task-list {
    --totalHeight: 320px;
    position: fixed;
    bottom: 0px;
    transform: translateY(var(--totalHeight));
    max-width: 640px;
    right: 0;
    width: 100%;
    height: var(--totalHeight);
    box-shadow: 0 0 5px 0 darkgray;
    transition: all .35s;
    &.show {
        transform: translateY(0px);
    }
    >.header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 30px;
        background-color: darkgray;
        >* { line-height: 30px; }
        button {
            background-color: transparent;
            border: none;
            outline: none;
            cursor: pointer;
        }
    }
    >.task-list {
        margin: 0;
        padding: 0;
        height: calc( var(--totalHeight) - 30px);
        overflow: auto;
        .preparing-item {
            &::before {
                background-color: rgb(255, 233, 133) !important;
            }
        }
        .upload-item {
            position: relative;
            height: 32px;
            padding: 10px;
            padding-left: 48px;
            background-repeat: no-repeat;
            background-size: 32px 32px;
            background-position: 10px 10px;
            // z-index: 2;
            .info {
                line-height: 20px;
                font-size: 10px;
                color: green;
            }
            .file-name {
                margin: 0;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            &::before {
                position: absolute;
                display: inline-block;
                content: '';
                width: var(--prog);
                height: 100%;
                top: 0;
                left: 0;
                background-color: rgb(133, 206, 255);
                z-index: -1;
            }
        }
    }
}
</style>
<style>
</style>
