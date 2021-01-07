<template>
    <file-list 
        class="list"
        @clickItem="listClick"
        @back="back"
        @drop="drop"
        @upload="upload"
        @delete="deleteItem"
        @createFolder="createFolder"
        @refresh="loadList();$emit('refresh', paths)"
        :loading="loading || loadingControl"
        :file-list="fileList">
        <div>
            <div v-if="showPath">
                <span>{{pathLabel}}</span>
                <ul class="path-bar mdui-typo">
                    <li><a :href='`/#/${prefix}`'>{{rootName}}</a></li>
                    <li v-for="(path,index) in paths" :key="index"><a :href="`/#/${prefix}/`+paths.slice(0,index+1).join('/')">{{path | urlDecode}}</a></li>
                </ul>
            </div>
            <slot></slot>
        </div>
    </file-list>
</template>

<script>
import fileList from '@/components/FileList.vue'
import Container from '../components/Container.vue'
import Pageniate from '../components/Pageniate.vue'
import Type from "../typedescribe/type";
import FileUtils from '../utils/FileUtils';
import mdui from 'mdui';
export default {
    name: 'FileBrowser',
    props: {
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
        }
    },
    data () {
        return {
            fileList:[],
            paths:[],
            loading:false
        }
    },
    mounted() {
        this.updatePath()
        this.loadList()
    },
    methods: {
        /**
         * @param {DragEvent}           e
         * @param {Type.DropItemInfo}   fileName
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
        loadList() {
            this.loading = true
            let url = `${this.api}/${this.paths.join('/')}`
            this.$axios.get(url).then(e => {
                this.loading = false
                this.fileList = e.data.data[0].concat(e.data.data[1])
            }).catch(() => this.loading = false)
        },
        updatePath() {
            this.paths = this.$route.path.substring(`/${this.prefix}`.length).split('/').filter(i => i.length > 0)
        },
        back() {
            if (this.paths.length === 0) {
                return
            }
            this.paths.pop()
            location.href = `/#/${this.prefix}/${this.paths.join('/')}`
            this.loadList()
        },
        upload () {
            FileUtils.openFileDialog(filelist => {
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
         * @param {Type.BaseFileInfo[]} fileInfo
         */
        deleteItem (fileInfo) {
            let msg = '确定要删除<br>'
            let haveDir = false
            haveDir = fileInfo.filter(item => item.type === 'dir').length !== 0
            for (let i = 0; i < fileInfo.length && i < 6; i++) {
                const file = fileInfo[i]
                msg += `<strong>${file.name}</strong><br>`
            }
            if (fileInfo.length > 6) {
                msg += ` 等共${fileInfo.length}个文件`
            }
            if (haveDir) {
                msg += '及其子目录'
            }
            msg += '吗'
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
        createFolder (name) {
            this.$emit('createFolder', {
                name: name,
                path: this.paths
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
.path-bar {
    display: inline-block;
    margin: 0;
    padding: 0;
    li {
        a {
            display: inline-block;
            padding: 0 10px;
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
