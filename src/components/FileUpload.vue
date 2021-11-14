<template>
    <mdui-card class="mdui-upload">
        <p
            @dragenter.prevent="1"
            @dragleave.prevent="1"
            @dragover.prevent="1"
            @dragend.prevent="1"
            v-show="files.length == 0"
            @click="selectFile"
            @drop.prevent.stop="drop"
            class="mdui-upload-header mdui-ripple"
        >
            <mdui-icon :size="28" :icon="'backup'"></mdui-icon>
            <span style="text-indent: .5rem">拖动文件或点击这里</span>
        </p>
        <ul v-show="files.length != 0" class="file-list">
            <li v-for="(file, index) in files" :key="index" class="file-info">
               <mdui-icon :size="16" :icon="'attach_file'"></mdui-icon>
               <span class=" mdui-text-truncate file-name">{{file.name}}</span>
               <mdui-icon :size="16" :icon="'close'" @click.native="removeFile(index)"></mdui-icon>
            </li>
        </ul>
    </mdui-card>
</template>

<script>
import FileUtils from '@/utils/FileUtils'
import MduiCard from './ui/MduiCard.vue'
import MduiIcon from './ui/MduiIcon.vue'
import mdui from 'mdui'
export default {
    name: 'fileUpload',
    components: {
        MduiCard,
        MduiIcon
    },
    data() {
        return {
            files: []
        }
    },
    methods: {
        selectFile() {
            FileUtils.openFileDialog().then(e => {
                this.files.push(e[0])
                this.$emit('select', e[0])
            })
        },
        removeFile(i) {
            const file = this.files.splice(i, 1)
            this.$emit('remove', file)
        },
        /**
         * @param {DragEvent} e
         */
        drop(e) {
            try {
                const file = e.dataTransfer.files[0]
                if (file.type) {
                    this.files.push(file)
                } else {
                    if (e.dataTransfer.items[0].webkitGetAsEntry().isFile) {
                        this.files.push(file)
                    } else {
                        mdui.snackbar('不支持文件夹')
                    }
                }
            } catch (err) {
                mdui.snackbar('类型错误')
            }
        }
    }
}
</script>

<style lang="less">
.mdui-upload {
    max-width: 320px;
    width: 100%;
    cursor: pointer;
    >.mdui-card-content {
        padding: 0;
    }
    .mdui-upload-header {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 16px 0;
        margin: 0;
    }
    .file-list {
        list-style: none;
        padding: 0;
        min-height: 60px;
        display: inline-flex;
        justify-content: center;
        width: 100%;
        .file-info {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            padding: 3px 24px;
            width: 100%;
            &:hover {
                background-color: #eee;
            }
            .file-name {
                display: inline-block;
                width: 240px;
                position: relative;
            }
            .mdui-icon {
                position: relative;
            }
        }
    }
}
</style>
