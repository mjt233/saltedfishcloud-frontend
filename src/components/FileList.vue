<template>
    <container
        @dragover="preventAction"
        @dragleave="preventAction"
        @dragenter="preventAction"
        @drag="drag"
    >
        <div style="position:absolute;top:0;width:calc(100% - 20px)" class="mdui-progress" v-if="loading">
            <div class="mdui-progress-indeterminate"></div>
        </div>
        <slot></slot>
        <ul class="list-container">
            <div class="loading-mask" :class="{'hid':!loading}">
                <!-- <div class="mdui-spinner"></div> -->
            </div>
            <li class="list-item head">
                <div class="file-name">文件名</div>
                <div class="file-size">大小</div>
                <div class="file-date">最后修改日期</div>
            </li>
            <li class="list-item tool-bar mdui-ripple" @click="back" style="overflow: hidden">
                <div class="file-name">返回上一级</div>
                <div class="file-size"></div>
                <div class="file-date"></div>
            </li>
            <li
                style="overflow: hidden"
                v-for="item in fileList"
                v-bind:key="item.name"
                @click="click(item)"
                @dragleave="dragLeave"
                @dragover="dragover"
                @dragenter="dragenter"
                @drop="drop"
                class="list-item mdui-ripple" :class="item.type == 1 ? 'dir' : `file type-${item.suffix}` "
            >
                <div class="file-name">{{item.name}}</div>
                <div class="file-size">{{item.formatSize}}</div>
                <div class="file-date">{{item.formatModified}}</div>
            </li>
            <li v-if="fileList.length==0" class="list-item">
                空空如也
            </li>
        </ul>
    </container>
</template>

<script>
import Container from './Container.vue'
import '../css/FileIcon.css'
export default {
  components: { Container },
    name: "file-list",
    props: {
        'fileList': {
            type: [Array],
            default: () => {return []}
        },
        'loading': {
            type: [Boolean],
            default: false
        }
    },methods: {
        back() {
            this.path.pop()
            this.$emit('back')
        },
        click(item) {
            if (item.type === 1) {
                this.path.push(item.name)
            }
            this.$emit('clickItem', item)
        },
        dragLeave(e) {
            this.preventAction(e)
            let itemElem = this.getElParentByClass(e.target, 'list-item')
            itemElem.classList.remove('selected')
            this.$emit('dragleave', e)
        },
        dragenter(e) {
            this.preventAction(e)
            let itemElem = this.getElParentByClass(e.target, 'list-item')
            itemElem.classList.add('selected')
            this.$emit('dragenter', e)
        },
        dragover(e) {
            this.preventAction(e)
            let itemElem = this.getElParentByClass(e.target, 'list-item')
            itemElem.classList.add('selected')
            this.$emit('dragover', e)
        },
        drop(e) {
            this.preventAction(e)
            let itemElem = this.getElParentByClass(e.target, 'list-item')
            itemElem.classList.remove('selected')
            let name = itemElem.querySelector('.file-name').innerText
            this.$emit('drop', e, {
                name: name,
                type: itemElem.classList.contains('file') ? 'file' : 'dir'
            })
        },
        preventAction(e) {
            e.stopPropagation()
            e.preventDefault()
        },
        getElParentByClass (elem, className) {
            let t = elem
            while(t.nodeName === '#text' || (!t.classList.contains(className) && t.tagName !== 'HTML')) {
                t = t.parentNode
            }
            if (t.tagName === 'HTML') {
                return null
            } else {
                return t
            }
        }
    },data () {
        return {
            path:[]
        }
    }
}
</script>

<style lang="less" scope>
a {
    text-decoration: none;
}
.loading-mask {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    top: 0px;
    left: 0px;
    background-color: rgba(255, 255, 255, 0.5);
    height: 100%;
    width: 100%;
    transition: all .2s;
    &.hid {
        opacity: 0;
        pointer-events: none;
    }
}
.list-container {
    list-style: none;
    padding: 0;
    margin: 0;
    opacity: 0.95;
    width: calc(100%-20px);
    position: relative;
    .file,.dir {
        &:hover {
            &:hover {background-color: rgb(233, 233, 233);}
        }
    }
    .head {
        cursor: unset;
    }
    .list-item {
        font-size: 12px;
        color: #323d55;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 10px;
        background-repeat: no-repeat;
        background-position-y: 10px;
        background-position-x: 10px;
        background-size: 24px 24px;
        overflow: auto;
        transition: all .2s;
        cursor: pointer;
        &.selected {
            background-color: rgb(233,233,233);
        }
        &.tool-bar {
            background-image: url('~@/assets/img/icon/return.png');
            background-size: 16px 16px;
            background-position: 10px
        }
        >.file-name {
            flex-grow: 6;
            text-align: left;
            padding-left: 35px;
        }
        .file-size { flex-grow: 2; flex-basis: 0; flex-shrink: 0;}
        .file-date { flex-grow: 4; flex-basis: 0; flex-shrink: 0;}

        >*{
            flex-basis: 0;
            flex-shrink: 0;
        }
    }
    .list-item + .list-item {
        border-top: solid 1px rgba(0, 0, 0, 0.05);
    }
}

// .dir{ background-image: url("~@/assets/img/icon/dir.png"); }
// .file{ background-image: url("~@/assets/img/icon/file.png"); }
// /* 压缩文件 */
// .type-zip,.type-rar,.type-gz,.type-7z,.type-tar,.type-xz{ background-image: url("~@/assets/img/icon/zipped.png"); }
// /* 视频 */
// .type-mp4,.type-mkv,.type-flv{ background-image: url("~@/assets/img/icon/video.png"); }
// /* 音频 */
// .type-mp3,.type-wav,.type-m4a,.type-flac{ background-image: url("~@/assets/img/icon/audio.png"); }
// /* 图片 */
// .type-jpeg,.type-jpg,.type-gif,.type-png,.type-bmp,.type-icon{ background-image: url("~@/assets/img/icon/picture.png"); }
// /* Office */
// .type-ppt,.type-pptx{ background-image: url("~@/assets/img/icon/ppt.png"); }
// .type-doc,.type-docx{ background-image: url("~@/assets/img/icon/doc.png"); }
// .type-xls,.type-xlsx{ background-image: url("~@/assets/img/icon/excel.png"); }
// /* 文本 */
// .type-txt{background-image: url("~@/assets/img/icon/txt.png");}
// /* EXE */
// .type-exe{ background-image: url("~@/assets/img/icon/exe.png"); }
// /* 镜像类 */
// /* ISO */
// .type-iso{ background-image: url("~@/assets/img/icon/iso.png"); }
// /* 其他 */
// .type-image,.type-dmg{ background-image: url("~@/assets/img/icon/img.png"); }
// /* 代码类文件 */
// /* html */
// .type-html,.type.htm { background-image: url("~@/assets/img/icon/code.png"); }
// /* 配置 */
// .type-ini,.type-conf,.type-cnf{ background-image: url("~@/assets/img/icon/config.png"); }
// .type-apk{ background-image: url("~@/assets/img/icon/android.png"); }

</style>
