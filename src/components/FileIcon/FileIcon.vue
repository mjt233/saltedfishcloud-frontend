<template>
    <div class="file-icon" v-if="renderIcon">
        <file-thumb
            v-if="showThumb && canLoadThumbnail"
            v-show="!showCommon"
            @error="showCommon = true"
            @load="showCommon = false"
            :md5="md5"
            :name="fileName"
            :type="type"
        />
        <common-file-icon
            v-show="showCommon || dir"
            :fileName="fileName"
            :type="type"
            :dir="dir"
        />
    </div>
</template>

<script>
import { Debouncer } from '@/utils/EventUtils'
import CommonFileIcon from './CommonFileIcon.vue'
import FileThumb from './FileThumb.vue'
export default {
    components: { CommonFileIcon, FileThumb },
    name: 'fileIcon',
    props: {
        /**
         * 文件MD5，缩略图的生成依赖该值
         */
        md5: {
            type: String
        },
        /**
         * 文件拓展名类型，用于生成type
         */
        fileName: {
            type: String
        },
        /**
         * 文件拓展名类型，优先级高于fileName
         */
        type: {
            type: String
        },
        /**
         * 是否显示文件内容缩略图
         */
        showThumb: {
            type: Boolean
        },
        /**
         * 是否为目录
         */
        dir: {
            type: Boolean
        }
    },
    data() {
        return {
            /**
             * 显示一般通用图标
             */
            showCommon: true,
            renderIcon: true,
            debouncer: new Debouncer()
        }
    },
    computed: {
        canLoadThumbnail() {
            if (!this.md5) {
                return false
            }

            let haveThumbnailType = []
            if (window.feature) {
                haveThumbnailType = window.feature.thumbType
            }
            return !this.isDir && haveThumbnailType.find(t => {
                return this.fileName.toLowerCase().endsWith(`.${t}`)
            })
        }
    },
    methods: {
        refresh() {
            console.log('refresh')
            this.debouncer.execute(() => {
                this.renderIcon = false
                this.$nextTick().then(() => {
                    this.renderIcon = true
                })
            }, 500, true, true)
        }
    },
    watch: {
        md5: 'refresh',
        type: 'refresh',
        fileName: 'refresh',
        dir: 'refresh'
    }
}
</script>

<style lang="less" scoped>
.file-icon {
    display: inline-block;
    position: relative;
    pointer-events: none;
    &>* {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}
</style>
