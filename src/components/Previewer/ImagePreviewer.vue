<template>
    <dialog-mask
        ref="dialog"
        class="image-previewer"
        @close="$emit('close')"
    >
        <div class="image-container" :class="{ 'fullscreen': isFullScreen }">
            <mdui-loading :loading="loading"></mdui-loading>
            <!-- 图片本体 -->
            <img :src="imgSrc" ref="img" class="main-image">

            <!-- 下方攻击条 -->
            <div class="image-tool-bar">

                <!-- 图片后退/前进预览 -->
                <div class="image-tool-jumper">
                    <mdui-btn @click="back" icon="arrow_back" :themeColor="false"></mdui-btn>
                    <span>{{activeIdx + 1}}/{{imgList.length}}</span>
                    <mdui-btn @click="forward" icon="arrow_forward" :themeColor="false"></mdui-btn>
                </div>
                <!-- 全屏/取消全屏 -->
                <mdui-btn ref="fullScreenBtn" @click="toggleFullScreen" :icon="isFullScreen ? 'fullscreen_exit' : 'fullscreen'" :themeColor="false"></mdui-btn>
            </div>
            
        </div>
        <div class="thumb-bar thumb-bar-left" ref="thumbBar">
            <fill-center :width="160" style="width: 100%;margin-top: 20px">
                <div v-for="(file, index) in imgList" ref="imgThumb" :key="file.name" class="thumb-bar-item" @click="showImage(index)">
                    <file-icon class="item-thumb" :class="{'active': index == activeIdx}" :md5="file.md5" :fileName="file.name" :dir="false" :showThumb="true" />
                    <span class="item-name mdui-text-truncate">{{file.name}}</span>
                </div>
            </fill-center>
        </div>
    </dialog-mask>
</template>

<script>
import GlobalAttr from '@/GlobalAttr'
import FileIcon from '../FileIcon/FileIcon.vue'
import FillCenter from '../ui/Layout/FillCenter.vue'
import API from '@/api'
import StringUtils from '@/utils/StringUtils'
import mdui from 'mdui'
import MduiLoading from '../ui/MduiLoading.vue'
import MduiBtn from '../ui/MduiBtn.vue'
export default {
    components: { FileIcon, FillCenter, MduiLoading, MduiBtn },
    name: 'ImagePreviewer',
    props: {
        fileList: {
            type: Array
        }
    },
    data() {
        return {
            imgSrc: '',
            activeIdx: null,
            loading: true,
            isFullScreen: false
        }
    },
    computed: {
        imgList() {
            if (!this.fileList) {
                return null
            }
            return this.fileList.filter(e => {
                return !e.dir && GlobalAttr.isImage(e.name)
            })
        }
    },
    mounted() {
        document.body.addEventListener('keydown', this.keydownCallback)
        this.$refs.img.addEventListener('load', () => {
            this.loading = false
        })
        document.body.addEventListener('fullscreenchange', this.fullScreenCallback)
    },
    destroyed() {
        document.body.removeEventListener('keydown', this.keydownCallback)
        document.body.removeEventListener('fullscreenchange', this.fullScreenCallback)
    },
    methods: {
        fullScreenCallback(e) {
            if (!document.fullscreenElement) {
                this.isFullScreen = false
            }
        },
        toggleFullScreen() {
            this.isFullScreen = !this.isFullScreen
            if (this.isFullScreen) {
                document.body.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        },
        toClose() {
            this.$refs.dialog.toClose()
        },
        /**
         * @param {KeyboardEvent} e
         */
        keydownCallback(e) {
            if (e.key == 'ArrowLeft') {
                this.back()
            } else if (e.key == 'ArrowRight') {
                this.forward()
            } else if (e.key == 'Escape') {
                // 如果在全屏模式先退出全屏
                if (this.isFullScreen) {
                    this.isFullScreen = false
                } else {
                    this.toClose()
                }
            }
        },
        showImage(index) {
            this.loading = true
            const file = this.imgList[index]
            const conf = API.resource.downloadFileByMD5(file.md5, file.name)
            const url = StringUtils.appendPath(this.axios.defaults.baseURL || '', conf.url)
            this.imgSrc = null
            this.$nextTick(() => {
                this.imgSrc = url
                this.activeIdx = index
                this.resetImgSize()
                this.updateBarScrollTop()
            })
        },
        updateBarScrollTop() {
            /**
             * @type {HTMLElement}
             */
            const thumb = this.$refs.imgThumb[this.activeIdx]
            /**
             * @type {HTMLElement}
             */
            const bar = this.$refs.thumbBar

            bar.scrollTop = thumb.offsetTop - (bar.clientHeight / 2 - thumb.clientHeight / 2)
        },
        getImgList() {
            return this.imgList
        },
        resetImgSize() {
            this.$refs.img.removeAttribute('style')
        },
        forward() {
            if (this.activeIdx < (this.imgList.length - 1)) {
                this.showImage(this.activeIdx + 1)
            } else {
                mdui.snackbar('已经是最后一张了')
            }
        },
        back() {
            if (this.activeIdx == 0) {
                mdui.snackbar('已经是第一张了')
            } else {
                this.showImage(this.activeIdx - 1)
            }
        }
    }
}
</script>

<style lang="less" scoped>

.active-border {
    border-color: rgb(255, 255, 255);
}
.image-container {
    position: relative;
    left: 210px;
    width: calc(100% - 210px);
    height: calc(100% - 20px);
    transition: all .2s;

    // 窄屏主图显示
    @media screen and (max-width: 1024px) {
        left: 0;
        width: 100%;
        height: calc(100% - 380px);
    };

    // 主图img标签
    .main-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    // 工具条
    .image-tool-bar {
        display: flex;
        position: absolute;
        bottom: 0px;
        width: 100%;
        align-items: center;
        justify-content: center;
        span,button{
            text-shadow: 0 0 2px black !important;
        }
        .image-tool-jumper {
            display: flex;
            align-items: center;
            button {
                margin: 0 10px;
            }
        }
    }

    // 显示区域全屏模式
    &.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: black;
        z-index: 9999;

        >.image-tool-bar {
            bottom: 20px;
        }
    }
}

.thumb-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: rgb(22, 22, 22);
    height: 100%;
    width: 210px;
    overflow: auto;
    scroll-behavior:smooth;

    // 窄屏列表栏变成在底部
    @media screen and (max-width: 1024px) {
        height: 360px;
        width: 100%;
    }

    .thumb-bar-item {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        &:hover {
            .item-thumb {
                .active-border()
            }
        }
        .item-thumb {
            height: 72px;
            width: 128px;
            border: 6px solid rgb(77, 77, 77);

            &.active {
                .active-border()
            }
        }
        .item-name {
            padding: 5px 10px;
            font-size: 12px;
            width: 100%;
            color: rgb(204, 204, 204);
        }
    }
}
</style>
