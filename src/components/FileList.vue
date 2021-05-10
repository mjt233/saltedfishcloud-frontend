<template>
    <container
        @dragenter.native="preventAction"
        @dragleave.native="preventAction"
        @dragover.native="preventAction"
        @drop.native="drop"
        @contextmenu.native="showMenu"
        ref="list"
        style="overflow:auto;height:0px"
        @click.native="containerClick"
    >
        <!-- 以下为绝对定位图层 -->
        <select-area
            @selectEnd="selected"
            @selectStart="selectStart"
            @selectChange="selectChange"
            v-if="enableDragSelect"
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
                    新建文件夹
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
            <li v-if="(fileInfo && (enableCut || enableCopy)) || enablePaste"  class="mdui-divider"></li>
            <li v-if="fileInfo && enableCopy" class="mdui-menu-item" @click="copy(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">content_copy</i>
                    复制
                </a>
            </li>
            <li v-if="fileInfo && enableCut" class="mdui-menu-item" @click="cut(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">content_cut</i>
                    剪切
                </a>
            </li>
            <li v-if="enablePaste" class="mdui-menu-item" @click="paste">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">content_paste</i>
                    粘贴
                </a>
            </li>
            <li v-if="fileInfo" class="mdui-divider"></li>
            <li v-if="fileInfo" class="mdui-menu-item" @click="rename(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">edit</i>
                    重命名
                </a>
            </li>
            <li v-if="fileInfo && fileInfo.size > 0" class="mdui-menu-item" @click="getURL(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">link</i>
                    获取链接
                </a>
            </li>
            <li v-if="fileInfo" class="mdui-menu-item" @click="deleteItem(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">delete</i>
                    删除
                </a>
            </li>
        </ul>
        <ul :style="{'--item-margin': containerItemMargin}" class="list-container" ref="container" :class="`type-${type}`">
            <!-- 表头 -->
            <div class="loading-mask" :class="{'hid':!loading}">
                <!-- <div class="mdui-spinner"></div> -->
            </div>
            <li class="list-item head" v-if="type == 'list'">
                <div class="file-name" v-if="enableName">文件名</div>
                <div class="file-size" v-if="enableSize">大小</div>
                <div class="file-date" v-if="enableDate">最后修改日期</div>
                <slot name="columnHeader"></slot>
            </li>
            <li v-if="enableReturn && type == 'list'" class="list-item tool-bar mdui-ripple" @click="back">
                <div class="file-name">返回上一级</div>
                <div class="file-size"></div>
                <div class="file-date"></div>
            </li>
            <!-- 文件列表本体 -->
            <li
                style="overflow: hidden"
                v-for="(item, index) in fileList"
                v-bind:key="index"
                @click="click(item, index)"
                @dragleave="dragLeave"
                @dragover="dragover"
                @dragenter="dragenter"
                @drop="drop"
                selectable
                class="list-item mdui-ripple" :class="item.dir ? 'dir' : `file type-${item.suffix}` "
            >
                <div class="file-name" v-if="enableName">
                    <input 
                        v-if="index == targetIndex && statu == 'rename' && type == 'list'"
                        class="rename-input"
                        v-model="newName"
                        @keyup.enter="resetFileInfo"
                    />
                    <textarea 
                        style="border-radius: 0; resize:none"
                        rows="3"
                        v-if="index == targetIndex && statu == 'rename' && type == 'table'"
                        class="rename-input"
                        v-model="newName"
                        @keyup.enter="resetFileInfo"
                    />
                    <span v-if="index != targetIndex || statu != 'rename'">{{item.name}}</span>
                </div>
                <template v-if="enableSize">
                    <div class="file-size" v-if="item.dir">-</div>
                    <div class="file-size" v-else>{{item.size | formatSize}}</div>
                </template>
                <div class="file-date" v-if="enableDate">{{item.formatModified}}</div>
                <slot name="columnItem" v-bind:item="item"></slot>
            </li>
            <li v-if="fileList.length==0" >
                <p style="text-align: center">空空如也</p>
            </li>
        </ul>
        <slot name="footer"></slot>
    </container>
</template>

<script>
import Type from '../typedescribe/type'
import Container from './Container.vue'
import '../css/FileIcon.css'
import mdui from 'mdui'
import selectArea from './SelectArea.vue'
import DOMUtils from '../utils/DOMUtils'
import StringFormatter from '../utils/StringFormatter'
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
        },
        'enableRClickMemu': {
            // 是否启用鼠标右键菜单
            type: Boolean,
            default: true
        },
        'enable': {
            type: String,
            default: ''
        },
        'type': {
            // 文件显示类型，list为列表，table为表格
            type: String,
            default: 'list'
        }
    },
    computed: {
        enableName() {
            return this.enable.indexOf('name') != -1
        },
        enableSize() {
            return this.enable.indexOf('size') != -1
        },
        enableDate() {
            return this.enable.indexOf('date') != -1
        },
        enableReturn() {
            return this.enable.indexOf('return') != -1
        },
        enableMenu() {
            return this.enable.indexOf('menu') != -1
        },
        enableDragSelect() {
            return this.enable.indexOf('drag-select') != -1
        },
        enableCut() {
            return this.enable.indexOf('cut') != -1
        },
        enableCopy() {
            return this.enable.indexOf('copy') != -1
        },
        enablePaste() {
            return this.enable.indexOf('patse') != -1
        }
    },
    filters: {
        formatSize(input) {
            return StringFormatter.formatSizeString(input)
        }
    },
    methods: {
        copy(e) {
            if (this.selectedEl.length != 0) {
                this.$emit('copy', this.selectedEl.map(e => e.querySelector('.file-name').innerText))
            } else {
                this.$emit('copy', [e.name])
            }
        },
        cut(e) {
            if (this.selectedEl.length != 0) {
                this.$emit('cut', this.selectedEl.map(e => e.querySelector('.file-name').innerText))
            } else {
                this.$emit('cut', [e.name])
            }
        },
        paste() {
            this.$emit('paste')
        },
        /**
         * 获取文件下载链接
         */
        getURL(info) {
            this.$emit('getURL', info)
        },
        back() {
            this.$emit('back')
        },
        /**
         * 列表项目被点击时触发的回调
         * @param {Type.BaseFileInfo} item
         */
        click(item, index) {
            this.fileInfo = null
            switch (this.statu) {
                case 'ok':
                    this.$emit('clickItem', item);break;
                case 'rename':
                    if (index !== this.targetIndex) {
                        this.resetFileInfo();
                    }
                    break;
                case 'select':
                    break;
                default:
                    mdui.alert(`当前文件编辑编辑器处于"${this.statu}"状态 无法执行此操作`)
                    break;
            }
        },
        /**
         * @param {MouseEvent} e
         */
        containerClick(e) {
            try {
                if (e.target == this.$refs.list.$el) {
                    this.resetFileInfo()
                }
                if (!this.selecting) {
                    this.resetSelect()
                }
            } catch (error) {
                
            }
        },
        /**
         * 重置当前的文件信息，若文件处于编辑状态 则会触发文件重命名事件
         */
        resetFileInfo() {
            if (this.statu === 'rename') {
                let info = {
                    old: this.fileList[this.targetIndex].name,
                    new: this.newName.replace(/\n/g, '')
                }
                if (info.old != info.new) {
                    this.$emit('rename', info)
                }
            }
            this.targetIndex = undefined
            this.newName = undefined
            this.statu = 'ok'
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
            this.resetFileInfo()
            this.preventAction(e)
            if (!this.enableMenu) {
                return
            }
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
                let container = this.$refs.list.$el
                container.appendChild(div)

                // 实例化菜单对象并打开，打开后用于定位的div可移除
                let menu = new mdui.Menu(div, '#menu', {
                    gutter: 0,
                    fixed: true
                })


                if (target !== null && !target.classList.contains('empty')) {
                    let index = 0
                    this.$el.querySelectorAll('.file,.dir').forEach((e,i) => {
                        if (e == target) {
                            index = i
                        }
                    })
                    this.fileInfo = this.fileList[index]
                    this.targetIndex = index
                } else {
                    this.targetIndex = undefined
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
        /**
         * @param {Type.ServerRawFileInfo} fileInfo
         */
        rename (fileInfo) {
            this.statu = 'rename'
            this.newName = fileInfo.name

            this.$nextTick().then(() => {
                let tagName = this.type == 'table' ? 'textarea' : 'input'
                let input = this.$refs.list.$el.querySelectorAll('.file,.dir')[this.targetIndex].querySelector(tagName)
                input.focus()
                input.select()
            })
        },
        createFolder () {
            this.$emit('createFolder')
        },
        /**
         * 选择结束时触发的selectEnd回调
         * @param {HTMLElement[]} elems
         */
        selected(elems) {
            this.resetSelect()
            this.selectedEl = elems
            elems.forEach(item => item.classList.add('selected'))
            setTimeout(() => {
                this.selecting = false
                this.statu = 'ok'
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
            this.statu = 'select'
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
         * @param {Type.ServerRawFileInfo} file
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
            this.resetSelect()
            this.$emit('delete', fileInfo)
        },
        getFileTableMargin() {
            let elCnt = parseInt(this.containerEl.offsetWidth/125)
            let space = this.containerEl.offsetWidth - elCnt*125
            return space/(elCnt)
        }
    },
    mounted() {
        this.containerEl = this.$refs.container
        let menu = document.querySelector('#menu')
        menu.addEventListener('closed.mdui.menu', event => {
            this.menuClosing = false
        })
        menu.addEventListener('close.mdui.menu', event => {
            this.menuClosing = true
        })
        this.fn = () => {
            this.containerItemMargin = this.getFileTableMargin() + 'px'
        }
        this.fn()
        window.addEventListener('resize', this.fn)
    },
    destroyed() {
        window.removeEventListener('resize', this.fn)
    },
    data () {
        return {
            fn: null,
            containerItemMargin: '0px',
            /**
             * 文件列表容器元素
             * @type {HTMLDocument}
             */
            containerEl: null,
            path:[],
            /**
             * 文件列表被鼠标右键点击时点击的文件
             * @type {Type.ServerRawFileInfo}
             */
            fileInfo: null,
            targetIndex: null,
            newName: null,
            statu: 'ok',
            /**
             * 菜单是否处于关闭中状态
             */
            menuClosing: false,
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
.rename-input {
    width: 80%;
    outline: none;
}
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
    &.type-table {
        >.list-item {
            display: inline-block;
            width: 120px;
            height: 120px;
            margin: 0 0 var(--item-margin) var(--item-margin);
            overflow: hidden;
            border: none !important;
            background-size: 48px 48px;
            background-position-x: center;
            background-position-y: 16px;
            padding: 0;
            .file-size,.file-date {display: none;}
            .file-name {
                position: absolute;
                display: block;
                text-align: center;
                bottom: 0;
                height: 45px;
                padding: 0;
                width: 100%;
            }
        }
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
        // transition: all .2s;
        cursor: pointer;
        overflow: hidden;
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
            text-overflow: ellipsis;
            word-wrap: break-all;
            &>span {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
                word-wrap: break-all;
            }
        }

        >*{
            display: flex;
            align-items: center;
            height: 100%;
            padding: 0 5px;
            overflow: hidden;
            flex-shrink: 0;
            flex-basis: 0;
            flex-grow: 3;
        }
    }
    .list-item + .list-item {
        border-top: solid 1px rgba(0, 0, 0, 0.05);
    }
}


</style>
