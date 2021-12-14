<template>
    <container
        @dragenter.native="preventAction"
        @dragleave.native="preventAction"
        @dragover.native="preventAction"
        @drop.native="drop"
        @contextmenu.native="showMenu"
        ref="list"
        @click.native="containerClick"
        style="overflow:auto;height:0px"
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

        <!-- 右键菜单 -->
        <ul class="mdui-menu" style="width: 200px; user-select: none" ref="menu" :class="{'mdui-menu-cascade': !mobileMenu}">
            <li class="mdui-menu-item" v-if="enableMkdir">
                <a href="javascript:;" class="mdui-ripple" @click="createFolder">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">create_new_folder</i>
                    新建文件夹
                </a>
            </li>
            <li class="mdui-divider" v-if="enableMkdir"></li>
            <li class="mdui-menu-item">
                <a href="javascript:;" @click="refresh">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">refresh</i>
                    刷新
                </a>
            </li>
            <li class="mdui-menu-item" @click="upload" v-if="enableUpload">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">file_upload</i>
                    上传
                </a>
            </li>
            <li v-if="(fileInfo && (enableCut || enableCopy)) || enablePaste"  class="mdui-divider"></li>
            <li v-if="enableUnzip && fileInfo && !fileInfo.dir && selectedEl.length <= 1 && fileInfo.name.endsWith('.zip')" class="mdui-menu-item" @click="$emit('unzip', fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">unarchive</i>
                    解压文件
                </a>
            </li>
            <li v-if="enableCompress && fileInfo" class="mdui-menu-item" @click="compress">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">archive</i>
                    压缩
                </a>
            </li>
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
            <li v-if="fileInfo && enableRename" class="mdui-divider"></li>
            <li v-if="enableRename " class="mdui-menu-item" @click="rename(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">edit</i>
                    重命名
                </a>
            </li>
            <li class="mdui-divider" v-if="enableCreateDownload"></li>
            <li class="mdui-menu-item" v-if="enableCreateDownload">
                <a href="javascript:;" @click="$emit('createDownload')">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">file_download</i>
                    创建下载任务
                </a>
            </li>
            <li class="mdui-menu-item" v-if="enableCreateDownload">
                <a href="javascript:;" @click="$emit('queryDownload')">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">playlist_play</i>
                    查看下载任务
                </a>
            </li>
            <li class="mdui-divider" v-if="enableCreateDownload && fileInfo"></li>
            <li v-if="enableShare && fileInfo && selectedEl.length <= 1" class="mdui-menu-item" @click="createShare(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">share</i>
                    分享
                </a>
            </li>
            <li v-if="fileInfo && fileInfo.size > 0 && selectedEl.length == 1" class="mdui-menu-item" @click="getURL(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">link</i>
                    获取直链
                </a>
            </li>
            <li v-if="fileInfo && enableDelete" class="mdui-menu-item" @click="deleteItem(fileInfo)">
                <a href="javascript:;" class="mdui-ripple">
                    <i class="mdui-menu-item-icon mdui-icon material-icons">delete</i>
                    删除
                </a>
            </li>
        </ul>
        <ul class="file-list-container" ref="container" :class="`type-${type}`">
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
            <!-- <li v-if="enableReturn && type == 'list'" class="list-item tool-bar mdui-ripple" @click="back">
                <div class="file-name">返回上一级</div>
                <div class="file-size"></div>
                <div class="file-date"></div>
            </li> -->
            <!-- 文件列表本体 -->
            <li
                style="overflow: hidden"
                v-for="(item, index) in fileList"
                v-bind:key="index"
                @click="click(item, index, $event)"
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
            <li v-if="fileList.length==0" style="list-style-type: none" >
                <p style="text-align: center">空空如也</p>
            </li>
        </ul>
        <slot name="footer"></slot>
    </container>
</template>

<script>
import Container from '@/components/layout/Container.vue'
import '@/css/FileIcon.css'
import mdui from 'mdui'
import selectArea from '@/components/ui/SelectArea.vue'
import DOMUtils from '@/utils/DOMUtils'
import StringFormatter from '@/utils/StringFormatter'
export default {
    components: { Container, selectArea },
    name: 'FileList',
    props: {
        fileList: {
            type: [Array],
            default: () => { return [] }
        },
        loading: {
            type: [Boolean],
            default: false
        },
        enableRClickMemu: {
            // 是否启用鼠标右键菜单
            type: Boolean,
            default: true
        },
        enable: {
            /**
             * 启用的组件，可选值：
             * name - 文件名显示
             * size - 文件大小显示
             * date - 文件日期显示
             * return - 启用返回上一级
             * menu - 启用右键菜单
             * drag-select - 启用拖动选择
             * cut - 启用剪切
             * copy - 启用复制
             * paste - 启用粘贴
             * share - 文件分享
             * create-download - 启用创建下载
             * mkdir - 启用新建文件夹
             * upload - 启用上传
             */
            type: String,
            default: ''
        },
        type: {
            // 文件显示类型，list为列表，table为表格
            type: String,
            default: 'list'
        }
    },
    computed: {
        enableShare() {
            return this.enable.indexOf('share') != -1
        },
        enableRename() {
            return this.enable.indexOf('rename') != -1 && this.fileInfo && this.selectedEl.length <= 1
        },
        enableDelete() {
            return this.enable.indexOf('delete') != -1
        },
        enableUpload() {
            return this.enable.indexOf('upload') != -1
        },
        enableMkdir() {
            return this.enable.indexOf('mkdir') != -1
        },
        enableCreateDownload() {
            return this.enable.indexOf('create-download') != -1
        },
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
        },
        enableUnzip() {
            return this.enable.indexOf('unzip') != -1
        },
        enableCompress() {
            return this.enable.indexOf('compress') != -1
        }
    },
    filters: {
        formatSize(input) {
            return StringFormatter.toSize(input)
        }
    },
    methods: {
        createShare(e) {
            this.$emit('share', e)
        },
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
        compress() {
            const files = this.selectedEl.map(e => e.querySelector('.file-name').innerText)
            this.$emit('compress', files)
        },
        getSelectedFiles() {

        },
        /**
         * 列表项目被点击时触发的回调
         * @param {Type.BaseFileInfo} item  被单击的文件信息
         * @param {Number} index            被单击的文件索引
         * @param {MouseEvent} e            单击事件
         */
        click(item, index, e) {
            this.fileInfo = null

            //  按住Ctrl单击文件
            if (e.ctrlKey) {
                const el = document.querySelectorAll('.dir,.file')[index]
                const t = this.selectedEl
                let index2 = 0

                //  切换选中状态
                if (el.classList.contains('selected')) {
                    t.forEach((elem, i) => { if (elem == el) index2 = i })
                    t.splice(index2, 1)
                } else {
                    t.push(el)
                }
                this.selectChange(t)
                return
            }

            //  一般情况
            switch (this.statu) {
            case 'ok':
                this.$emit('clickItem', item); break
            case 'rename':
                if (index !== this.targetIndex) {
                    this.resetFileInfo()
                }
                break
            case 'select':
                break
            default:
                mdui.alert(`当前文件编辑编辑器处于"${this.statu}"状态 无法执行此操作`)
                break
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

                //
                /**
                 *  选择文件结束时，也会触发该事件
                 *  不清空选择状态的情况
                 *  1. 选择刚刚完成的一瞬间触发的该方法
                 *  2. 按住Ctrl时点击文件
                 *  3. 点击删除按钮
                 */
                // eslint-disable-next-line no-empty
                if ((e.ctrlKey && DOMUtils.getElParentByClass(e.target, 'list-item')) || this.selecting) {

                } else {
                    this.resetSelect()
                }
            } catch (error) { }
        },
        /**
         * 重置当前的文件信息，若文件处于编辑状态 则会触发文件重命名事件
         */
        resetFileInfo() {
            if (this.statu === 'rename') {
                const info = {
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
            const itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
            itemElem.classList.remove('selected')
            this.$emit('dragleave', e)
        },
        dragenter(e) {
            this.preventAction(e)
            const itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
            itemElem.classList.add('selected')
            this.$emit('dragenter', e)
        },
        dragover(e) {
            this.preventAction(e)
            const itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
            itemElem.classList.add('selected')
            this.$emit('dragover', e)
        },
        drop(e) {
            this.preventAction(e)
            const itemElem = DOMUtils.getElParentByClass(e.target, 'list-item')
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
        showMenu(e) {
            this.resetFileInfo()
            this.preventAction(e)
            if (!this.enableMenu) {
                return
            }
            //  文件列表区域外的右键点击事件忽略

            /**
             * 触发的文件元素
             */
            const target = DOMUtils.getElParentByClass(e.target, 'list-item')
            if (target !== null && target.classList.contains('tool-bar')) {
                return
            }
            const show = () => {
                // 先创建一个div插入到鼠标点击位置，利用该div作为mdui菜单的触发位置锚点
                const div = document.createElement('div')
                div.style.position = 'fixed'
                div.style.top = e.pageY + 'px'
                div.style.left = e.pageX + 'px'
                const container = this.$refs.list.$el
                container.appendChild(div)

                // 实例化菜单对象并打开，打开后用于定位的div可移除
                const menu = new mdui.Menu(div, this.$refs.menu, {
                    gutter: 0,
                    fixed: true
                })

                if (target !== null && !target.classList.contains('empty')) {
                    //  找出右键触发位置的项目所在的索引，以便从文件列表(this.fileList)中取出对应的文件信息
                    let index = 0
                    this.$refs.container.querySelectorAll('.file,.dir').forEach((e, i) => {
                        // debugger
                        if (e == target) {
                            index = i
                        }
                    })
                    this.fileInfo = this.fileList[index]
                    this.targetIndex = index

                    //  若触发右键的元素是未选中状态，则重置选中状态同时只选择该元素
                    if (!target.classList.contains('selected')) {
                        this.selectChange([target])
                    }
                } else {
                    this.targetIndex = undefined
                    this.fileInfo = null
                }
                this.$refs.menu.style.width = this.mobileMenu ? '' : '200px'
                this.$nextTick().then(() => {
                    menu.open()
                    div.remove()
                })
            }
            if (this.menuClosing) {
                setTimeout(() => {
                    show()
                }, 250)
            } else {
                show()
            }
        },
        upload() {
            this.$emit('upload')
        },
        refresh() {
            this.$emit('refresh')
        },
        /**
         * @param {Type.ServerRawFileInfo} fileInfo
         */
        rename(fileInfo) {
            this.statu = 'rename'
            this.newName = fileInfo.name

            this.$nextTick().then(() => {
                const tagName = this.type == 'table' ? 'textarea' : 'input'
                const input = this.$refs.list.$el.querySelectorAll('.file,.dir')[this.targetIndex].querySelector(tagName)
                input.focus()
                input.select()
            })
        },
        createFolder() {
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
            this.$el.querySelectorAll('*[selectable]').forEach(item => item.classList.remove('selected'))
        },
        /**
         * @param {Type.ServerRawFileInfo} file
         */
        deleteItem(file) {
            const fileInfo = []
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
            const elCnt = parseInt(this.containerEl.offsetWidth / 125)
            const space = this.containerEl.offsetWidth - elCnt * 125
            return space / (elCnt)
        }
    },
    mounted() {
        this.containerEl = this.$refs.container
        const menu = this.$refs.menu
        menu.addEventListener('closed.mdui.menu', event => {
            this.menuClosing = false
        })
        menu.addEventListener('close.mdui.menu', event => {
            this.menuClosing = true
        })
    },
    data() {
        return {
            /**
             * 是否启用移动端菜单
             */
            mobileMenu: false,
            fn: null,
            containerItemMargin: '0px',
            /**
             * 文件列表容器元素
             * @type {HTMLDocument}
             */
            containerEl: null,
            path: [],
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

<style lang="less">
@import './style.less';

</style>
