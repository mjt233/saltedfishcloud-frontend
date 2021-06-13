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
        :api="`diskFile/${uid}/file`"
        :uid="uid"
        :prefix="uid == 0 ? 'public' : 'private'"
        :rootName="uid == 0 ? '公共网盘' : '私人网盘'"
        :showPath="true"
        :pathLabel="'当前路径：'"
        :loadingControl="loading"
        :showToolBar="true"
        :path="path"
        @clickFile='clickFile'
        @dropFile='addUploadFile'
        @upload='upload'
        @delete='deleteItem'
        @createFolder='createFolder'
        @rename='rename'
        @search='search'
        @getURL='openDialog'
        ref='browser'
    >
        <mdui-dialog id='attr-dialog' :title="'设置下载链接属性'" ref="dialog" @confirm='getURL'>
            <div style="margin: 20px auto; width: 90%" class="mdui-typo">
                <span>链接有效时长：<span style="color: red;font-weight: 900" class="mdui-text-color-theme">{{link.expr == 32 ? '无限制' : link.expr + '天'}}</span></span>
                <label class="mdui-slider">
                    <input type="range" v-model="link.expr" step="1" min="1" max="32"/>
                </label>
                <mdui-checkbox :label="'启用预览'" v-model="link.preview" />
                <p class="mdui-text-color-theme-300">注意：若原文件位置改变，重命名或删除链接将失效</p>
            </div>
        </mdui-dialog>
        <mdui-dialog disableDefBtn :title="'下载链接'" ref="linkResDialog">
            <div style="margin: 20px auto; width: 90%">
                <a target="_blank" :href="link.res" style="word-break: break-all">{{link.res}}</a>
            </div>
            <template v-slot:btn>
                <mdui-btn v-clipboard:copy="link.res" @click="onCopy(true)" :themeColor="false">复制链接</mdui-btn>
                <mdui-btn @click="$refs.linkResDialog.close()" :themeColor="false">关闭</mdui-btn>
            </template>
        </mdui-dialog>
    </file-browser>
    <container class="mdui-typo" v-else>
        <h3>未登录，请先<router-link to="/login">登录</router-link> </h3>
    </container>
</template>

<script>
import mdui from 'mdui'
import FileBrowser from '../components/FileBrowser.vue'
import FileQueue from '../global/FileQueue'
import axios from 'axios'
import Container from '../components/layout/Container.vue'
import SearchResult from '@/components/SearchResult'
import API from '../api/API'
import FormUtils from '../utils/FormUtils'
import MduiDialog from './ui/MduiDialog.vue'
import MduiCheckbox from './ui/MduiCheckbox'
import MduiBtn from './ui/MduiBtn.vue'
export default {
    components: { FileBrowser, Container, SearchResult, MduiDialog, MduiCheckbox, MduiBtn },
    name: 'FileHandler',
    props: {
        uid: {
            type: Number
        },
        modifiable: {
            type: Boolean,
            default: true
        },
        path: {
            //  访问的路径
            type: String,
            default: ''
        }
    },
    data() {
        return {
            loading: false,
            searchRes: [],
            searchMode: false,
            searchKey: '测试',
            link: {
                expr: 32,
                preview: true,
                info: {},
                res: ''
            }
        }
    },
    filters: {
        fixed(i) {
            return i.toFixed(0)
        }
    },
    computed: {
        hasLogin() {
            return this.uid != null
        },
        viewRouteName() {
            return this.uid == 0 ? 'public' : 'private'
        },
        token() {
            return this.$store.state.token
        }
    },
    methods: {
        onCopy(e) {
            if (e) {
                mdui.snackbar('复制成功！')
            } else {
                mdui.snackbar('复制失败！')
            }
        },

        async getURL() {
            const e = (await this.$axios(
                API.resource.getFileDC(this.uid,
                    this.link.info.path.join('/'),
                    this.link.info.fileInfo.name,
                    this.link.info.fileInfo.md5,
                    this.link.expr == 32 ? -1 : this.link.expr)
            ))

            const url = API.getServer() + '/api/' + API.resource.downloadUseFileDC(e.data.data, !this.link.preview, this.link.info.fileInfo.name)
            this.link.res = url
            // let content = `
            //     <h3>下载链接</h3>
            //     <a target="_blank" href="${url}" style="word-break: break-all">
            //         ${url}
            //     </a>
            // `
            this.$refs.dialog.close()
            // mdui.alert(content)
            this.$refs.linkResDialog.open()
        },
        openDialog(info) {
            this.link.info = info
            this.$refs.dialog.open()
        },
        fileClick(path) {
            const url = (API.server || location.origin) + '/api/' + API.file.getContent(this.uid, path).url.replace(/\/+/g, '/')
            FormUtils.jumpWithPost(url, true, {
                Token: this.token
            })
        },
        /**
         * @param {String} path
         */
        dirClick(path) {
            path = path.split('/').map(encodeURIComponent).join('/')
            this.searchMode = false
            location.href = `/#/${this.viewRouteName}` + path
        },
        search(key) {
            this.searchMode = !this.searchMode
            this.searchKey = key
        },
        rename(info) {
            if (!this.modifiable) {
                mdui.alert('无权操作')
                return
            }
            this.loading = true
            const conf = API.file.rename(this.uid, info.path.join('/'), info.old, info.new)
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
            const res = API.getServer() + '/api/' + API.resource.downloadFileByMD5(e.md5, e.name).url
            window.open(res)
        },
        /**
         * 有文件被拖到文件列表时执行的回调
         * @param {Type.DropItemInfo} fileInfo
         */
        addUploadFile(fileInfo) {
            if (!this.modifiable) {
                mdui.alert('无权操作')
                return
            }
            for (let i = 0; i < fileInfo.files.length; i++) {
                const file = fileInfo.files[i]
                let target = fileInfo.path.join('/')
                target = fileInfo.target.type === 'file' ? target : target + fileInfo.target.name
                FileQueue.addFile({
                    api: API.file.upload(this.uid, fileInfo.path.join('/')).url,
                    file: file,
                    path: fileInfo.path
                })
            }
        },
        /**
         * 文件列表上传按钮被点击时执行的回调
         * @param {Type.DropItemInfo} info
         */
        upload(info) {
            if (!this.modifiable) {
                mdui.alert('无权操作')
                return
            }
            for (let i = 0; i < info.files.length; i++) {
                const file = info.files[i]
                const conf = API.file.upload(this.uid, info.path.join('/'))
                FileQueue.addFile({
                    api: conf.url,
                    file: file
                })
            }
        },
        /**
         * 文件列表删除按钮被点击时执行的回调
         * @param {Type.FileInfo[]} itemInfo
         */
        deleteItem(itemInfo) {
            if (!this.modifiable) {
                mdui.alert('无权操作')
                return
            }
            const fileList = itemInfo.map(file => file.name)
            const path = itemInfo[0].path.join('/')
            this.loading = true
            /**
             * 请求完成时的回调
             * @param {String} msg 提示信息
             */
            const cb = msg => {
                this.loading = false
                mdui.snackbar(msg, {
                    position: 'bottom'
                })
                this.$refs.browser.loadList()
            }
            const conf = API.file.delete(this.uid, path, fileList)
            /**
             * 发起删除请求
             */
            // eslint-disable-next-line node/no-callback-literal
            axios(conf).then(() => cb('删除成功')).catch(() => cb('删除失败'))
        },
        /**
         * 文件列表创建目录按钮被点击时执行的回调函数
         */
        createFolder(info) {
            if (!this.modifiable) {
                mdui.alert('无权操作')
                return
            }
            const path = info.path.join('/')
            const conf = API.file.mkdir(this.uid, path, info.name)
            this.loading = true
            this.$axios(conf).then(e => {
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
