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
        :loading="loading || loadingControl"
        :showToolBar='showToolBar'
        :file-list="fileList"
        :enable="`name size date return drag-select menu cut ${clipBoard ? 'patse' : ''}`"
    >
        <div>
            <!-- 路径显示 -->
            <div v-if="showPath">
                <span style="font-size: 13px">{{pathLabel}}</span>
                <ul class="path-bar mdui-typo">
                    <li><a :href='`/#/${prefix}`'>{{rootName}}</a></li>
                    <li v-for="(path,index) in paths" :key="index"><a :href="`/#/${prefix}/`+paths.slice(0,index+1).join('/')">{{path | urlDecode}}</a></li>
                </ul>
            </div>
            <!-- 工具条 -->
            <div class="mdui-toolbar">
                <button  @click="upload" class="mdui-btn mdui-ripple mdui-btn-icon">
                    <i class="mdui-icon material-icons">file_upload</i>
                </button>
                <button @click="createFolder" class="mdui-btn mdui-ripple mdui-btn-icon">
                    <i class="mdui-icon material-icons">create_new_folder</i>
                </button>
                <button @click="refresh" class="mdui-btn mdui-ripple mdui-btn-icon">
                    <i class="mdui-icon material-icons">refresh</i>
                </button>
                <div class="mdui-toolbar-spacer"></div>
                <div class="mdui-textfield search">
                    <input v-model="searchName" placeholder="搜索文件 回车执行" @keydown.enter="search" type="text" class="mdui-textfield-input">
                </div> 
            </div>
            <slot></slot>
        </div>
    </file-list>
</template>

<script>
import fileList from '@/components/FileList.vue'
import Pageniate from '../components/Pageniate.vue'
import Type from "../typedescribe/type"
import FileUtils from '../utils/FileUtils'
import mdui from 'mdui'
import apiConfig from '../api/apiConfig'
export default {
    name: 'FileBrowser',
    props: {
        'uid': {
            /**
             * 用户ID
             */
            type: Number
        },
        'api': {
            /**
             * API接口地址，用于持续浏览
             * 在该组件内部，将按照以下规则进行API URL拼接的方式进行调用
             * `${api}/${文件相对路径}`
             */
            type: String
        },
        'prefix': {
            // 浏览路由前缀
            type: String,
            default: '/public'
        },
        'showPath': {
            // 是否显示路径
            type: Boolean,
            default: false
        },
        'rootName': {
            // 根路径名称
            type: String,
            default: '/'
        },
        'pathLabel': {
            // 路径标签文字
            type: String,
            default: '当前路径'
        },
        'loadingControl': {
            // 父组件加载控制，为true时将进入加载中状态
            type: Boolean,
            default: false
        },
        'showToolBar': {
            // 是否显示工具栏
            type: Boolean,
            default: false
        },
        'refreshDelay': {
            // 自动刷新延迟 单位ms
            type: Number,
            default: 1000
        }
    },
    data () {
        return {
            /**
             * @type {Type.ServerRawFileInfo}
             */
            fileList:[],
            paths:[],
            loading:false,
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
            clipBoard: null
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
        /**
         * @param {Type.ServerRawFileInfo} fileInfo
         */
        cut(fileInfo) {
            this.clipBoard = {
                type: 'cut',
                fileInfo: fileInfo,
                path: '/' + this.paths.join('/')
            }
            console.log(this.clipBoard);
            mdui.snackbar('已剪切，在目标目录可粘贴', {position: 'top'})
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
            } else if(e.dataTransfer.files.length !== 0) {
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
        listClick (e) {
            if (e.type === 1) {
                location.href += `/${encodeURIComponent(e.name)}`
            } else {
                this.$emit('clickFile', {
                    path: this.paths,
                    name: e.name
                })
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
            let refresh = () => {
                this.lastLoadPath = this.paths.join('/')
                this.loading = true
                this.$axios(apiConfig.resource.getFileList(this.uid, this.lastLoadPath))
                .then(e => {
                    this.loading = false
                    this.fileList = e.data.data[0].concat(e.data.data[1])
                }).catch(e => {
                    if (e.code !== -1) {
                        mdui.alert(e.msg)
                    }
                    this.loading = false
                })
            }

            // 调用限频，防止刷新被按爆或大量小文件上传触发极频繁的自动刷新
            let strPath = this.paths.join('/')
            if (strPath !== this.lastLoadPath) {
                refresh()
                return
            }
            let now = new Date().getTime()
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
            this.paths = this.$route.path.substring(`/${this.prefix}`.length).split('/').filter(i => i.length > 0)
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
        upload () {
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
        deleteItem (fileInfo) {
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
                let itemInfo = []
                fileInfo.forEach(file => {
                    itemInfo.push({
                        name: file.name,
                        type: file.type,
                        path: this.paths
                    })
                })
                this.$emit('delete', itemInfo)
            }, ()=>{}, {
                confirmText: '删除',
                cancelText: '取消'
            })
        },
        /**
         * 菜单“新建文件夹”被点击时触发的回调
         */
        createFolder () {
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
        $route(to, from) {
            if (to.path != from.path) {
                this.updatePath()
                this.loadList()
            }
        }
    },
    filters: {
        urlDecode(input) {
            return decodeURI(input)
        }
    },
    components: { fileList, Pageniate }
}
</script>

<style scope lang="less">
@media screen and (max-width: 720px) {
    .btn-text {
        display: none;
    }
    .mdui-toolbar>button {
        width: 120px;
    }
}
.search {
    input::placeholder {
        font-size: 12px;
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
    opacity: .95;
}
</style>
