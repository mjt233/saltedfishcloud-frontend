<template>
    <container
        @dragenter.native="preventAction"
        @dragleave.native="preventAction"
        @dragover.native="preventAction"
        @drop.native="drop"
        @contextmenu.native="showMenu"
        ref="list"
        id="container"
        style="overflow:auto;height:0px"
        @click.native="containerClick"
    >
        <!-- 以下为绝对定位图层 -->
        <select-area
            @selectEnd="selected"
            @selectStart="selectStart"
            @selectChange="selectChange"
        >

        </select-area>
        <div style="position:absolute;top:0;width:calc(100% - 20px)" class="mdui-progress" v-if="loading">
            <div class="mdui-progress-indeterminate"></div>
        </div>
        <!-- 以上为绝对定位图层 -->
        <slot></slot>
        <ul class="mdui-menu" id="menu">
            <li class="mdui-menu-item">
                <a href="javascript:;" class="mdui-ripple" @click="createFolder">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">create_new_folder</i>
                    新建目录
                </a>
            </li>
            <li class="mdui-menu-item">
                <a href="javascript:;" @click="refresh">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">refresh</i>
                    刷新
                </a>
            </li>
            <li class="mdui-menu-item" @click="upload">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">file_upload</i>
                    上传
                </a>
            </li>
            <li v-if="fileInfo" class="mdui-divider"></li>
            <li v-if="fileInfo" class="mdui-menu-item" @click="deleteItem(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">delete</i>
                    删除
                </a>
            </li>
        </ul>
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
                selectable
                class="list-item mdui-ripple" :class="item.type == 1 ? 'dir' : `file type-${item.suffix}` "
            >
                <div class="file-name">{{item.name}}</div>
                <div class="file-size">{{item.formatSize}}</div>
                <div class="file-date">{{item.formatModified}}</div>
            </li>
            <li v-if="fileList.length==0" class="list-item empty">
                空空如也
            </li>
        </ul>
    </container>
</template>

<script>
import Type from '../typedescribe/type'
import Container from './Container.vue'
import '../css/FileIcon.css'
import mdui from 'mdui'
import selectArea from './SelectArea.vue'
import DOMUtils from '../utils/DOMUtils'
export default {
  components: { Container, selectArea },
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
            this.$emit('back')
        },
        click(item) {
            if (this.selecting === false) {
                this.$emit('clickItem', item)
            }
        },
        containerClick() {
            if (!this.selecting) {
                this.resetSelect()
            }
        },
        dragLeave(e) {
            this.preventAction(e)
            let itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
            itemElem.classList.remove('selected')
            this.$emit('dragleave', e)
        },
        dragenter(e) {
            this.preventAction(e)
            let itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
            itemElem.classList.add('selected')
            this.$emit('dragenter', e)
        },
        dragover(e) {
            this.preventAction(e)
            let itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
            itemElem.classList.add('selected')
            this.$emit('dragover', e)
        },
        drop(e) {
            this.preventAction(e)
            let itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
            let name = ''
            let type = ''
            if (!itemElem) {
                // 拖动到非列表项目中
                type = 'dir'
                if (this.path.length === 0) {
                    name = '/'
                } else {
                    name = this.path[this.path.length - 1]
                }
            } else {
                // 拖动到列表项目中
                itemElem.classList.remove('selected')
                name = itemElem.querySelector('.file-name').innerText
                type = itemElem.classList.contains('file') ? 'file' : 'dir'

            }
            this.$emit('drop', e, {
                name: name,
                type: type
            })
        },
        preventAction(e) {
            e.stopPropagation()
            e.preventDefault()
        },
        /**
         * @param {MouseEvent} e
         */
        showMenu (e) {
            this.preventAction(e)
            let show = () => {
                let target = DOMUtils.getElParentByClass(e.target, 'list-item')
                if (target !== null && target.classList.contains('tool-bar')) {
                    return
                }
                // 先创建一个div插入到鼠标点击位置，利用该div作为mdui菜单的触发位置锚点
                let div = document.createElement('div')
                div.style.position = 'fixed'
                div.style.top = e.pageY + 'px'
                div.style.left = e.pageX + 'px'
                let container = document.getElementById('container')
                container.appendChild(div)

                // 实例化菜单对象并打开，打开后用于定位的div可移除
                let menu = new mdui.Menu(div, '#menu', {
                    gutter: 0,
                    fixed: true
                })

                let menu_el = document.querySelector('#menu')

                if (target !== null && !target.classList.contains('empty')) {
                    this.fileInfo = {
                        name: target.querySelector('.file-name').innerText,
                        type: target.classList.contains('file') ? 'file' : 'dir'
                    }
                } else {
                    this.fileInfo = null
                }
                // 
                menu.open()
                div.remove()
            }
            if (this.menuClosing) {
                setTimeout(() => {
                    show()
                }, 250)
            } else {
                show()
            }
        },
        upload () {
            this.$emit('upload')
        },
        refresh () {
            this.$emit('refresh')
        },
        createFolder () {
            mdui.prompt('文件夹名', text => {
                if (this.fileList.filter(item => item.name === text).length !== 0) {
                    mdui.alert('文件名冲突')
                } else {
                    this.$emit('createFolder', text)
                }
            }, () => {}, {
                defaultValue: '新建文件夹'
            })
        },
        /**
         * @param {HTMLElement[]} elems
         */
        selected(elems) {
            setTimeout(() => {
                this.selecting = false
            }, 100)
        },
        /**
         * 鼠标选区触发selectChange时的回调
         * @param {HTMLElement[]} elems
         */
        selectChange(elems) {
            this.resetSelect()
            this.selectedEl = elems
            elems.forEach(item => item.classList.add('selected'))
        },
        /**
         * 鼠标选区触发selectStart时的回调
         */
        selectStart() {
            this.resetSelect()
            this.selecting = true
        },
        /**
         * 重置已选元素为空
         */
        resetSelect() {
            this.selectedEl = []
            this.$el.querySelectorAll("*[selectable]").forEach(item => item.classList.remove('selected'))
        },
        /**
         * @param {Type.BaseFileInfo} file
         */
        deleteItem(file) {
            let fileInfo = []
            if (this.selectedEl.length !== 0) {
                this.selectedEl.forEach(item => {
                    fileInfo.push({
                        name: item.querySelector('.file-name').innerText,
                        type: item.classList.contains('file') ? 'file' : 'dir'
                    })
                })
            } else {
                fileInfo.push(file)
            }
            this.$emit('delete', fileInfo)
        }
    },
    mounted() {
        let menu = document.querySelector('#menu')
        menu.addEventListener('closed.mdui.menu', event => {
            this.menuClosing = false
        })
        menu.addEventListener('close.mdui.menu', event => {
            this.menuClosing = true
        })
        this.listEl = this.$refs.list.$el
    },
    data () {
        return {
            path:[],
            /**
             * @type {Type.BaseFileInfo}
             */
            fileInfo: null,
            menuClosing: false,
            downX: 0,
            downY: 0,
            /**
             * @type {Element}
             */
            selectPanel: undefined,
            selectPanelOpened: false,
            /**
             * @type {Element}
             */
            listEl: null,
            selecting: false,
            /**
             * 被选中的元素
             * @type {HTMLElement[]}
             */
            selectedEl: []
        }
    }
}
</script>

<style lang="less" scope>
.select-panel {
    position: fixed;
    width: 30px;
    height: 30px;
    background-color: rgba(0, 153, 255, 0.2);
    opacity: 0;
    transition: opacity .2s;
    pointer-events: none;
    z-index: 10;
    &.show {
        opacity: 1;
    }
}
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
    user-select: none;
    overflow: auto;
    .file,.dir {
        &:hover {background-color: rgb(233, 233, 233);}
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
            background-color: rgb(201, 229, 248);
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


</style>
