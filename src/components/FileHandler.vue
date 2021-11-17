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
        :modifiable="modifiable"
        @clickFile='clickFile'
        @dropFile='addUploadFile'
        @upload='upload'
        @delete='deleteItem'
        @createFolder='createFolder'
        @rename='rename'
        @search='search'
        @getURL='openDialog'
        @share='openShareDialog'
        @createDownload='showDownload = true'
        @queryDownload='showQueryDownload = true'
        ref='browser'
    >
        <create-download-dialog
            v-show="modifiable"
            :show.sync="showDownload"
            @confirm="createDownload"
            @cancel="createCancel"
        />
        <query-download-dialog
            v-show="modifiable"
            :show.sync="showQueryDownload"
            :uid="uid"
            @createTask="toCreate"
        />
        <!-- 创建直链对话框 -->
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

        <!-- 直链展示对话框 -->
        <mdui-dialog disableDefBtn :title="'下载链接'" ref="linkResDialog">
            <div style="margin: 20px auto; width: 90%">
                <a target="_blank" :href="link.res" style="word-break: break-all">{{link.res}}</a>
            </div>
            <template v-slot:btn>
                <mdui-btn v-clipboard:copy="link.res" @click="onCopy(true)" :themeColor="false">复制链接</mdui-btn>
                <mdui-btn @click="$refs.linkResDialog.close()" :themeColor="false">关闭</mdui-btn>
            </template>
        </mdui-dialog>

        <!-- 创建分享 -->
        <mdui-dialog :title="`分享文件：${shareDialog.info ? shareDialog.info.resource.name : ''}`" ref="shareDialog" :show.sync="shareDialog.show" @confirm="createShare">
            <mdui-loading :loading="shareDialog.loading"></mdui-loading>
            <div style="overflow: hidden">
                <mdui-row>
                    <mdui-col :xs="12">
                        <span>
                            <label>有效期：</label><mdui-select v-model="shareDialog.date"  fixed :options="shareDialog.options"></mdui-select>
                        </span>
                    </mdui-col>
                    <mdui-col :xs="12">
                        <span>
                            <label>提取码：</label>
                            <mdui-input
                                style="padding-right: 50px;top: 12px"
                                :maxLength="16"
                                v-model="shareDialog.code"
                                :floatLabel="false"
                                :placeholder="'可选，最长16个字符'"
                                ref="codeInput"
                                mini
                            />
                            <mdui-btn :themeColor="false" dense @click="randomCode">随机生成</mdui-btn>
                        </span>
                    </mdui-col>
                </mdui-row>
            </div>
        </mdui-dialog>

        <!-- 查看创建的分享 -->
        <mdui-dialog :title="'分享成功'" ref="shareInfo" :show.sync="shareDialog.showInfo" :disableDefBtn="true">
            <div v-if="shareDialog.shareInfo">
                <p>分享链接：<span style="user-select: text">{{shareDialog.shareInfo.link}}</span></p>
                <p v-if="shareDialog.shareInfo.needExtractCode">提取码：{{shareDialog.shareInfo.extractCode}}</p>
            </div>
            <template slot="btn" v-if="shareDialog.shareInfo">
                <mdui-btn :themeColor="false" v-clipboard:copy="shareDialog.shareInfo.copyText" @click="onCopy(true)">复制</mdui-btn>
                <mdui-btn :themeColor="false" @click="shareDialog.showInfo = false">确定</mdui-btn>
            </template>
        </mdui-dialog>
    </file-browser>
    <container class="mdui-typo" v-else>
        <h3>未登录，请先<router-link to="/login">登录</router-link> </h3>
    </container>
</template>

<script>
import mdui from 'mdui'
import FileBrowser from '@/components/FileBrowser.vue'
import { FileQueueHandler as FileQueue } from '@/service/FileUpload/FileUploadQueue/FileQueueHandler'
import axios from 'axios'
import SearchResult from '@/components/SearchResult.vue'
import API from '@/api'
import FormUtils from '@/utils/FormUtils'
import MduiDialog from './ui/MduiDialog.vue'
import MduiCheckbox from './ui/MduiCheckbox.vue'
import MduiBtn from './ui/MduiBtn.vue'
import CreateDownloadDialog from './CreateDownloadDialog.vue'
import QueryDownloadDialog from './QueryDownloadDialog/index.vue'
import MduiSelect from './ui/MduiSelect.vue'
import MduiInput from './ui/MduiInput.vue'
import MduiRow from './ui/MduiRow.vue'
import MduiCol from './ui/MduiCol.vue'
import StringUtils from '@/utils/StringUtils'
import MduiLoading from './ui/MduiLoading.vue'
export default {
    components: { FileBrowser, SearchResult, MduiDialog, MduiCheckbox, MduiBtn, CreateDownloadDialog, QueryDownloadDialog, MduiSelect, MduiInput, MduiCol, MduiRow, MduiLoading },
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
            showDownload: false,
            showQueryDownload: false,
            toDownload: false, // 创建下载任务是否由任务列表对话框触发
            link: {
                expr: 32,
                preview: true,
                info: {},
                res: ''
            },
            shareDialog: {
                info: null,
                show: false,
                showInfo: false,
                loading: false,
                shareInfo: null,
                code: '',
                date: '1',
                options: [
                    { value: 1, label: '1天' },
                    { value: 7, label: '7天' },
                    { value: 30, label: '30天' },
                    { value: -1, label: '永久' }
                ]
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
        /**
         * 生成随机提取码
         */
        async randomCode() {
            this.shareDialog.code = StringUtils.getRandomStr(4, { withNumber: true })
            await this.$nextTick()
            this.$refs.codeInput.focus()
        },
        /**
         * 创建分享
         */
        createShare() {
            /**
             * 请求配置
             * @type {import('@/api/share').CreateShareConfig}
             */
            const config = {
                path: '/' + this.shareDialog.info.path.join('/'),
                name: this.shareDialog.info.resource.name
            }
            if (parseInt(this.shareDialog.date) > 0) {
                config.expiredAt = new Date().getTime() + parseInt(this.shareDialog.date) * 24 * 60 * 60 * 1000
            }
            config.extractCode = this.shareDialog.code || null
            const req = API.share.createShare(config)
            this.shareDialog.loading = true

            this.axios(req).then(e => {
                const data = e.data.data
                this.shareDialog.show = false
                this.shareDialog.shareInfo = data
                this.shareDialog.shareInfo.link = `${location.origin}/#/s/${data.id}/${data.verification}`
                this.shareDialog.shareInfo.copyText = `呐呐呐(。・∀・)ノ，我用咸鱼云向你分享了文件：${data.name}\n链接：${this.shareDialog.shareInfo.link}`
                if (data.needExtractCode) this.shareDialog.shareInfo.copyText += `\n提取码：${data.extractCode}`
                this.shareDialog.showInfo = true
            }).catch(err => {
                mdui.snackbar(err.toString())
            }).finally(() => {
                this.shareDialog.loading = false
            })
        },
        /**
         * 打开创建分享对话框
         */
        async openShareDialog(e) {
            this.shareDialog.info = e
            this.shareDialog.code = ''
            this.shareDialog.show = true
            await this.$nextTick()
            this.$refs.codeInput.focus()
        },
        /**
         * 取消创建离线下载
         */
        createCancel() {
            if (this.toDownload) {
                this.toDownload = false
                this.showQueryDownload = true
            }
        },
        /**
         * 从查询离线下载对话框切换到创建下载对话框
         */
        toCreate() {
            this.showQueryDownload = false
            this.showDownload = true
            this.toDownload = true
        },
        /**
         * 创建下载任务
         */
        async createDownload(task) {
            this.showDownload = false
            if (!task.url) {
                mdui.alert('下载URL不能为空', () => {
                    this.showDownload = true
                })
                return
            }
            const conf = API.task.download.create({
                uid: this.uid,
                savePath: '/' + this.path,
                ...task
            })
            this.loading = true
            try {
                await this.$axios(conf)
                mdui.snackbar('任务创建成功，保存位置：' + conf.data.savePath)
                if (this.toDownload) {
                    this.toDownload = false
                    this.showQueryDownload = true
                }
            } catch (error) {
                mdui.alert(error.msg, () => { this.showDownload = true })
            }
            this.loading = false
        },
        /**
         * 复制直链
         */
        onCopy(e) {
            if (e) {
                mdui.snackbar('复制成功！')
            } else {
                mdui.snackbar('复制失败！')
            }
        },
        /**
         * 获取文件直链
         */
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
        /**
         * 打开创建直链对话框
         */
        openDialog(info) {
            this.link.info = info
            this.$refs.dialog.open()
        },
        /**
         * 搜索框中的文件被点击时，打开下载
         */
        fileClick(path) {
            const url = (API.server || location.origin) + '/api/' + API.file.getContent(this.uid, path).url.replace(/\/+/g, '/')
            FormUtils.jumpWithPost(url, true, {
                Token: this.token
            })
        },
        /**
         * 搜索框中的目录被点击时，打开网盘目录对应的视图
         * @param {String} path
         */
        dirClick(path) {
            path = path.split('/').map(encodeURIComponent).join('/')
            this.searchMode = false
            location.href = `/#/${this.viewRouteName}` + path
        },
        /**
         * 设置搜索选项
         */
        search(key) {
            this.searchMode = !this.searchMode
            this.searchKey = key
        },
        /**
         * 对文件进行重命名
         */
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
         * 文件浏览器列表文件被点击时执行的回调
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
