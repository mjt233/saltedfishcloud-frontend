<template>
    <search-result 
        v-if="searchMode"
        :searchKey='searchKey'
        :uid='uid'
        :rootName="uid == 0 ? '公共网盘' : '私人网盘'"
        @back='searchMode = false'
        @clickFile='fileClick'
        @clickDir='dirClick'
    >
        <div class="mdui-typo">
            <a>返回</a>
        </div>
    </search-result>
    <file-browser
        v-else-if="!searchMode && hasLogin"
        :api="`fileList/${uid}`"
        :uid="uid"
        :prefix="uid == 0 ? 'public' : 'private'"
        :rootName="uid == 0 ? '公共网盘' : '私人网盘'"
        :showPath="true"
        :pathLabel="'当前路径：'"
        :loadingControl="loading"
        :showToolBar="true"
        @clickFile='clickFile'
        @dropFile='addUploadFile'
        @upload='upload'
        @delete='deleteItem'
        @createFolder='createFolder'
        @rename='rename'
        @search='search'
        ref='browser'
    >
    </file-browser>
    <container class="mdui-typo" v-else>
        <h3>未登录，请先<router-link to="/login">登录</router-link> </h3>
    </container>
</template>

<script>
import Type from '../typedescribe/type'
import mdui from 'mdui'
import FileBrowser from "../components/FileBrowser.vue"
import FileQueue from '../global/FileQueue'
import axios from 'axios'
import FileList from '../components/FileList.vue'
import Container from "@/components/Container.vue"
import SearchResult from '@/components/SearchResult'
import apiConfig from '../api/apiConfig'
export default {
    components: { FileBrowser, FileList, Container, SearchResult },
    name: 'FileHandler',
    props: {
        'uid': {
            type: Number
        }
    },
    data() {
        return {
            loading: false,
            searchRes: [],
            searchMode: false,
            searchKey: '测试'
        }
    },
    mounted () {
    },
    computed: {
        hasLogin() {
            return this.uid != null
        },
        viewRouteName() {
            return this.uid == 0 ? 'public' : 'private'
        }
    },
    methods: {
        fileClick(path) {
            let url = `/download/${this.uid}/${path}`
            location.href = url
        },
        dirClick(path) {
            this.searchMode = false
            location.href = `/#/${this.viewRouteName}` + path
        },
        search(key) {
            this.searchMode = !this.searchMode
            this.searchKey = key
        },
        rename(info) {
            let url = `rename/${this.uid}/${info.path.join('/')}`
            this.loading = true
            let conf = apiConfig.resource.rename(this.uid, info.path.join('/'), info.old, info.new)
            this.$axios(conf).then(e => {
                this.$refs.browser.loadList()
                mdui.snackbar('重命名成功')
                this.loading = false
            }).catch(e => {
                if (e.code === -4) {
                    mdui.snackbar('文件名冲突')
                } else {
                    mdui.snackbar(`出错：${e.msg}`)
                }
                this.loading = false
            })
        },
        /**
         * 文件被点击时执行的回调
         */
        clickFile(e) {
            let exp = new RegExp(`^(.*)\/${this.viewRouteName}`)
            let filePath = location.href.replace(exp, '/') + `/${encodeURIComponent(e.name)}`
            let newPath = `${apiConfig.server}/download/${this.uid}${filePath.replace(/\/+/g, '/')}`
            location.href = newPath
        },
        /**
         * 有文件被拖到文件列表时执行的回调
         * @param {Type.DropItemInfo} fileInfo
         */
        addUploadFile(fileInfo) {
            for (let i = 0; i < fileInfo.files.length; i++) {
                const file = fileInfo.files[i]
                let target = fileInfo.path.join('/')
                target = fileInfo.target.type === 'file' ? target : target + fileInfo.target.name
                FileQueue.addFile({
                    api: `private/${target}`,
                    file: file,
                    path: fileInfo.path
                })
            }
        },
        /**
         * 文件列表上传按钮被点击时执行的回调
         * @param {Type.DropItemInfo} info
         */
        upload (info) {
            for (let i = 0; i < info.files.length; i++) {
                const file = info.files[i]
                let conf = apiConfig.resource.upload(this.uid, info.path)
                FileQueue.addFile({
                    api: conf.url,
                    file: file,
                    params: {},
                    path: info.path
                })
            }
        },
        /**
         * 文件列表删除按钮被点击时执行的回调
         * @param {Type.FileInfo[]} itemInfo
         */
        deleteItem (itemInfo) {
            let fileList = itemInfo.map(file => file.name)
            let path = itemInfo[0].path.join('/')
            let url = `delete/private/${path}`
            this.loading = true
            /**
             * 请求完成时的回调
             * @param {String} msg 提示信息
             */
            let cb = msg => {
                this.loading = false
                mdui.snackbar(msg, {
                    position: 'bottom'
                })
                this.$refs.browser.loadList()
            }
            let conf = apiConfig.resource.delete(this.uid, path, fileList)
            console.log(conf)
            /**
             * 发起删除请求
             */
            axios(conf).then(() => cb('删除成功'))
                .catch(() => cb('删除失败'))
        },
        /**
         * 文件列表创建目录按钮被点击时执行的回调函数
         */
        createFolder (info) {
            let path = info.path.join('/')
            let conf = apiConfig.resource.mkdir(this.uid, path, info.name)
            this.loading = true
            this.$axios(conf).then(e=>{
                this.loading = false
                this.$refs.browser.loadList()
            }).catch(e => {
                mdui.alert(e.msg, () => {
                    this.loading = false
                    this.$refs.browser.loadList()
                })
            })
        }
    }
}
</script>

<style>

</style>