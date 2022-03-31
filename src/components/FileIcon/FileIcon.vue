<template>
    <div class="file-icon" v-if="renderIcon">
        <file-thumb
            class="file-icon-entry"
            v-if="showThumb && canLoadThumbnail"
            v-show="!showCommon"
            @error="showCommon = true"
            @load="showCommon = false"
            :md5="md5"
            :name="fileName"
            :type="type"
        />
        <common-file-icon
            class="file-icon-entry"
            v-show="showCommon || dir"
            :fileName="fileName"
            :type="type"
            :dir="dir"
        />
        <i v-show="showPlayIcon" class="mdui-icon material-icons play-icon">play_circle_outline</i>
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
        },
        showPlayIcon() {
            const mediaType = ['mp4', 'mp3', 'flac']
            const type = this.type || this.fileName.toLowerCase().split('.').pop()
            return mediaType.includes(type)
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
    display: inline-flex;
    position: relative;
    pointer-events: none;
    justify-content: center;
    &>.file-icon-entry {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .play-icon {
        position: relative;
        font-size: 32px;
        color: white;
        text-shadow: 2px 2px 5px rgb(0, 0, 0);
        opacity: .9;
    }
}
</style>
