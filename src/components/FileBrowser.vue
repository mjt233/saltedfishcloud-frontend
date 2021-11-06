<template>
    <file-list
        class="list"
        @clickItem="listClick"
        @back="back"
        @drop="drop"
        @upload="upload"
        @delete="deleteItem"
        @createFolder="createFolder"
        @rename="rename"
        @refresh="refresh"
        @getURL='getURL'
        @cut='cut'
        @copy='copy'
        @paste='paste'
        @createDownload='$emit("createDownload")'
        @queryDownload='$emit("queryDownload")'
        :type='listType'
        :loading="loading || loadingControl"
        :showToolBar='showToolBar'
        :file-list="fileList"
        :enable="`name size date return menu ${clipBoard.fileInfo.length != 0 ?  'patse' : ''} ${modifiable ? modifiAttr:''}`"
    >
        <div>
            <!-- 工具烂 -->
            <div class=" mdui-text-color-theme mdui-container-fluid">
                <div class="mdui-row">
                    <!-- 按钮组 -->
                    <div class="mdui-col-md-6 mdui-col-xs-12 handler-group">
                        <!-- 文件操作按钮组 -->
                        <mdui-btn v-if="modifiable" @click="upload">
                            <mdui-icon :icon="'file_upload'">
                            </mdui-icon><span>上传</span>
                        </mdui-btn>
                        <mdui-btn v-if="modifiable" @click="createFolder" :themeColor="false" >
                            <mdui-icon :icon="'create_new_folder'">
                            </mdui-icon><span>新建</span>
                        </mdui-btn>
                        <mdui-btn v-if="modifiable" mdui-menu="{target: '#download_menu'}" :themeColor="false">
                            <mdui-icon :icon="'file_download'">
                            </mdui-icon><span>离线下载</span>
                        </mdui-btn>
                        <!-- 布局按钮组 -->
                        <div class="mdui-btn-group layout-group">
                            <button @click="listType = 'table'" class="mdui-btn mdui-ripple mdui-btn-icon" :class="{'mdui-btn-active': listType == 'table'}">
                                <i class="mdui-icon material-icons">apps</i>
                            </button>
                            <button @click="listType = 'list'" class="mdui-btn mdui-ripple mdui-btn-icon" :class="{'mdui-btn-active': listType == 'list'}">
                                <i class="mdui-icon material-icons">format_align_justify</i>
                            </button>
                        </div>
                        <ul class="mdui-menu " id="download_menu">
                            <li class="mdui-menu-item">
                                <a href="javascript:;" @click="$emit('createDownload')">
                                    <i class="mdui-menu-item-icon mdui-icon material-icons">file_download</i>
                                    创建下载
                                </a>
                            </li>
                            <li class="mdui-menu-item">
                                <a href="javascript:;" @click="$emit('queryDownload')">
                                    <i class="mdui-menu-item-icon mdui-icon material-icons">playlist_play</i>
                                    查看下载
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class=" mdui-col-md-6 mdui-col-xs-12">
                        <div class="search">
                            <input v-model="searchName" placeholder="搜索文件 回车执行" @keydown.enter="search" type="text">
                        </div>
                    </div>
                </div>
            </div>

            <!-- 路径显示 -->
            <div v-if="showPath" class="path-handler">
                <button @click="back" class="mdui-btn mdui-btn-icon mdui-btn-dense">
                    <i class="mdui-icon material-icons">keyboard_backspace</i>
                </button>
                <ul class="path-bar mdui-typo">
                    <li><a :href='`/#/${prefix}`'>{{rootName}}</a></li>
                    <li v-for="(path,index) in paths" :key="index"><a :href="`/#/${prefix}/`+paths.slice(0,index+1).join('/')">{{path | urlDecode}}</a></li>
                </ul>
            </div>
            <mdui-hr></mdui-hr>
            <slot></slot>
        </div>
    </file-list>
</template>

<script>
import MduiBtn from '@/components/ui/MduiBtn.vue'
import MduiIcon from '@/components/ui/MduiIcon.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
import fileList from '@/components/FileList/'
import FileUtils from '@/utils/FileUtils'
import mdui from 'mdui'
import apiConfig from '@/api'
export default {
    name: 'FileBrowser',
    props: {
        uid: {
            /**
             * 用户ID
             */
            type: Number
        },
        api: {
            /**
             * API接口地址，用于持续浏览
             * 在该组件内部，将按照以下规则进行API URL拼接的方式进行调用
             * `${api}/${文件相对路径}`
             */
            type: String
        },
        prefix: {
            // 浏览路由前缀
            type: String,
            default: '/public'
        },
        showPath: {
            // 是否显示路径
            type: Boolean,
            default: false
        },
        rootName: {
            // 根路径名称
            type: String,
            default: '/'
        },
        pathLabel: {
            // 路径标签文字
            type: String,
            default: '当前路径'
        },
        loadingControl: {
            // 父组件加载控制，为true时将进入加载中状态
            type: Boolean,
            default: false
        },
        showToolBar: {
            // 是否显示工具栏
            type: Boolean,
            default: false
        },
        refreshDelay: {
            // 自动刷新延迟 单位ms
            type: Number,
            default: 1000
        },
        path: {
            // 访问的文件夹路径
            type: String,
            default: ''
        },
        modifiable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            modifiAttr: 'mkdir upload copy cut create-download drag-select delete rename',
            listType: 'table',
            /**
             * @type {Type.ServerRawFileInfo[]}
             */
            fileList: [],
            paths: [],
            loading: false,
            /**
             * 上次自动刷新的时间
             * @type {Number}
             */
            lastRefresh: 0,
            lastLoadPath: '/',
            /**
             * 自动刷新是否处于阻塞状态
             * @type {Boolean}
             */
            blocking: false,
            searchName: '',
            /**
             * 剪切板的文件信息和路径
             */
            clipBoard: {
                fileInfo: [],
                path: null
            }
        }
    },
    mounted() {
        this.updatePath()
        this.loadList()
        /**
         * 捕获到上传完成事件时自动刷新文件列表
         */
        this.$eventBus.$on('uploaded', item => {
            // 当然 上传完成的文件路径与当前正在浏览的路径相同的时候才刷新
            if (item.api.replace(/\/+$/g, '') == this.fullApi.replace(/\/+$/g, '')) {
                this.loadList()
            }
        })
    },
    computed: {
        /**
         * @return {String} 当前页面的取列表API地址
         */
        fullApi() {
            return `${this.api}/${this.paths.join('/')}`
        }
    },
    methods: {
        paste() {
            // 判断当前目录是否存在同名文件或目录
            const curNameMap = new Map(this.fileList.map(e => [e.name, 1]))
            const sameName = this.clipBoard.fileInfo.filter(e => curNameMap.get(e))
            const createRequest = () => {
                const files = []
                this.loading = true
                /**
                 * @type {import("_axios@0.21.1@axios").AxiosRequestConfig}
                 */
                let conf = {}
                // 使用事件传递的多个文件名创建多个axios请求对象
                this.clipBoard.fileInfo.forEach(item => {
                    files.push({
                        source: item,
                        target: item
                    })
                })
                if (this.clipBoard.type === 'cut') {
                    conf = apiConfig.file.move(this.uid, this.clipBoard.path, '/' + this.paths.join('/'), true, files)
                } else {
                    conf = apiConfig.file.copy(this.uid, this.clipBoard.path, '/' + this.paths.join('/'), true, files)
                }
                this.$axios(conf).then(e => {
                    mdui.snackbar('粘贴成功')
                    setTimeout(() => this.loadList(), 100)
                    this.loading = false
                    if (this.clipBoard.type === 'cut') {
                        this.clipBoard = {
                            fileInfo: [],
                            path: null
                        }
                    }
                }).catch(e => {
                    mdui.alert(e.msg)
                    this.loading = false
                })
            }
            if (sameName.length > 0) {
                mdui.confirm(`存在同名目录<strong>"${sameName.join('，')}"</strong>,是否继续?<br>(将合并文件夹和覆盖文件)`, '文件名冲突', e => {
                    createRequest()
                }, e => mdui.snackbar('操作取消'))
            } else {
                createRequest()
            }
        },
        copy(fileInfo) {
            this.clipBoard = {
                type: 'copy',
                fileInfo: fileInfo,
                path: this.paths.join('/')
            }
            mdui.snackbar('已复制，在目标目录可粘贴', { position: 'top' })
        },
        cut(fileInfo) {
            this.clipBoard = {
                type: 'cut',
                fileInfo: fileInfo,
                path: this.paths.join('/')
            }
            mdui.snackbar('已剪切，在目标目录可粘贴', { position: 'top' })
        },
        /**
         * @param {Type.ServerRawFileInfo} fileInfo
         */
        getURL(fileInfo) {
            this.$emit('getURL', {
                path: this.paths,
                fileInfo: fileInfo
            })
        },
        refresh() {
            this.loadList()
            this.$emit('refresh', this.paths)
        },
        rename(info) {
            info.path = this.paths
            this.$emit('rename', info)
        },
        /**
         * 搜索
         */
        search() {
            this.$emit('search', this.searchName)
        },
        /**
         * 文件列表组件被拖入文件时的回调
         * @param {DragEvent}           e
         * @param {Type.DropItemInfo}   fileName
         * @emits dropFile|dropItem
         */
        drop(e, fileName) {
            if (e.dataTransfer.files.length !== 0) {
                this.$emit('dropFile', {
                    files: e.dataTransfer.files,
                    path: this.paths,
                    target: fileName
                })
            } else if (e.dataTransfer.files.length !== 0) {
                this.$emit('dropItem', {
                    files: e.dataTransfer.items,
                    path: this.paths,
                    target: fileName
                })
            }
        },
        /**
         * 文件列表有项目被点击时触发的回调，点击到文件夹则发起请求获取新的文件，点击到文件则向父组件传递clickFile事件
         * @param {Type.ServerRawFileInfo} e
         * @emits clickFile
         */
        listClick(e) {
            if (e.type === 1) {
                location.href += `/${encodeURIComponent(e.name)}`
            } else {
                e.path = this.paths
                this.$emit('clickFile', e)
            }
        },
        /**
         * 从服务器加载文件列表
         * 加载参数由组件参数api和组件数据paths决定
         */
        loadList() {
            // 在上次请求未响应之前 不执行
            if (this.loading) {
                return
            }

            // 刷新请求API本体动作函数
            const refresh = () => {
                this.lastLoadPath = this.paths.map(e => encodeURIComponent(e)).join('/')
                this.loading = true
                this.$axios(apiConfig.file.getFileList(this.uid, this.lastLoadPath))
                    .then(e => {
                        this.loading = false
                        this.fileList = e.data.data[0].concat(e.data.data[1])
                    }).catch(e => {
                        console.log(e.msg)
                        if (e.code === 404) {
                            mdui.alert(`请求的路径<strong>${'/' + this.paths.join('/')}</strong>不存在,即将返回根目录`, () => {
                                this.$router.push(location.href = '/#/' + this.prefix)
                            })
                        } else if (e.code !== -1) {
                            mdui.alert(e.msg)
                        }
                        this.loading = false
                    })
            }

            // 调用限频，防止刷新被按爆或大量小文件上传触发极频繁的自动刷新
            const strPath = this.paths.join('/')
            if (strPath !== this.lastLoadPath) {
                refresh()
                return
            }
            const now = new Date().getTime()
            if (now - this.lastRefresh >= (this.refreshDelay + 50)) {
                //  刷新间隔大于延迟，可立即刷新
                this.lastRefresh = now
                refresh()
            } else if (!this.blocking) {
                //  刷新间隔过小，设置阻塞不再接收调用请求，并将等待一段时间后自动刷新一次同时解除阻塞。
                this.blocking = true
                setTimeout(() => {
                    this.lastRefresh = new Date().getTime()
                    this.blocking = false
                    refresh()
                }, this.refreshDelay)
            }
        },
        /**
         * 根据当前路由更新组件的paths
         */
        updatePath() {
            this.paths = this.path.split('/').filter(i => i.length > 0)
        },
        /**
         * 返回上一级目录
         */
        back() {
            if (this.paths.length === 0) {
                return
            }
            this.paths.pop()
            location.href = `/#/${this.prefix}/${this.paths.join('/')}`
            this.loadList()
        },
        /**
         * 点击菜单的上传按钮时触发的回调，用户选择好文件后提交一个upload事件给父组件
         * @emits upload
         */
        upload() {
            FileUtils.openFileDialog({
                multiple: true
            }).then(filelist => {
                this.$emit('upload', {
                    files: filelist,
                    path: this.paths,
                    target: {
                        name: this.paths.length === 0 ? '/' : this.paths[this.paths.length - 1],
                        type: 'dir'
                    }
                })
            })
        },
        /**
         * 点击菜单中的删除按钮时触发的事件，删除确认后产生一个delete事件
         * @param {Type.BaseFileInfo[]} fileInfo
         * @emits delete
         */
        deleteItem(fileInfo) {
            let msg = '<div class="mdui-typo"><strong>确定要删除</strong><hr>'
            let haveDir = false
            haveDir = fileInfo.filter(item => item.type === 'dir').length !== 0
            for (let i = 0; i < fileInfo.length && i < 6; i++) {
                const file = fileInfo[i]
                msg += `${file.name}<br>`
            }
            if (fileInfo.length > 6) {
                msg += '...<br>'
            }
            msg += `<hr>共<span style="font-weight:bold;font-size:16px;color:red">${fileInfo.length}</span>个文件`
            if (haveDir) {
                msg += '及其子目录'
            }
            msg += '吗（不可逆操作）</div>'
            mdui.confirm(msg, () => {
                /**
                 * @type {Type.FileInfo[]}
                 */
                const itemInfo = []
                fileInfo.forEach(file => {
                    itemInfo.push({
                        name: file.name,
                        type: file.type,
                        path: this.paths
                    })
                })
                this.$emit('delete', itemInfo)
            }, () => {}, {
                confirmText: '删除',
                cancelText: '取消'
            })
        },
        /**
         * 菜单“新建文件夹”被点击时触发的回调
         */
        createFolder() {
            mdui.prompt('文件夹名', text => {
                if (this.fileList.filter(item => item.name === text).length !== 0) {
                    mdui.alert('文件名冲突')
                } else {
                    this.$emit('createFolder', {
                        name: text,
                        path: this.paths
                    })
                }
            }, () => {}, {
                defaultValue: '新建文件夹'
            })
        }
    },
    watch: {
        path(n, o) {
            this.updatePath()
            this.loadList()
        }
        // $route(to, from) {
        //     if (to.path != from.path) {
        //         this.updatePath()
        //         this.loadList()
        //     }
        // }
    },
    filters: {
        urlDecode(input) {
            return decodeURI(input)
        }
    },
    components: { fileList, MduiBtn, MduiIcon, MduiHr }
}
</script>

<style scope lang="less">
.path-handler {
    display: flex;
    align-items: center;
}
.handler-group {
    padding: 0;
    > * {
        margin-right: 10px !important;
        margin-bottom: 15px !important;
    }
}
.search {
    margin-bottom: 15px;
    input::placeholder {
        font-size: 12px;
    }
    input {
        width: 60%;
        height: 36px;
        outline: none;
        background-color: transparent;
        border: none;
        border-bottom: 1px solid darkgray;
    }
    @media screen and (max-width: 1024px) {
        input {
            width: 100%;
        }
    }
}
.path-bar {
    display: inline-block;
    margin: 0;
    padding: 0;
    font-size: 13px;
    li {
        a {
            display: inline-block;
            padding: 0 2px;
        }
        display: inline-block;
        color: blue;
        & + li::before {
            content: '>';
            color: rgb(160, 160, 160);
            font-size: 10px;
            margin: 0 3px;
        }
    }
}
.list {
    margin: 0 auto;
}
</style>
