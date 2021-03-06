<template>
    <full-container header :title="'咸鱼云网盘资源分享'">
        <mdui-loading :loading="loading"></mdui-loading>
        <share-not-found v-if="notfound" />
        <share-extractor v-if="shareInfo && !shareInfo.validateSuccess" :msg="msg" :shareInfo="shareInfo" @extract="extract"></share-extractor>
        <share-browser
            v-if="shareInfo && shareInfo.validateSuccess"
            :shareInfo="shareInfo"
            :extractCode="extractCode"
            @clickFile="clickFile"
            sticky
            @download="downloadFile"
            @selectChange="selectChange"
            :style="browserStyle"
            ref="browser"
        />
        <mdui-btn class="download-btn"  @click="wrapDownload" :fab="true" :hid="selectInfo.files.length == 0" :icon="'file_download'"></mdui-btn>
    </full-container>
</template>

<script>
import FullContainer from '@/components/FullContainer.vue'
import API from '@/api'
import mdui from 'mdui'
import ShareNotFound from '@/components/Share/ShareNotFound.vue'
import ShareExtractor from '@/components/Share/ShareExtractor.vue'
import ShareBrowser from '@/components/Share/ShareBrowser.vue'
import qs from 'qs'
import MduiBtn from '@/components/ui/MduiBtn.vue'
import GlobalAttr from '@/GlobalAttr'
import SfcUtils from '@/utils/SfcUtils'
export default {
    components: {
        FullContainer,
        ShareNotFound,
        ShareExtractor,
        ShareBrowser,
        MduiBtn
    },
    data() {
        return {
            sid: null,
            verification: null,
            extractCode: '',
            loading: false,
            notfound: false,
            msg: '',
            shareInfo: null,
            selectInfo: {
                path: '/',
                files: []
            }
        }
    },
    mounted() {
        this.sid = this.$route.params.sid
        this.verification = this.$route.params.verification
        this.loadInfo()
    },
    computed: {
        browserStyle() {
            if (this.shareInfo) {
                if (this.shareInfo.type == 'DIR') {
                    return 'height: calc(100vh - 96px); overflow: auto'
                }
            }
            return ''
        }
    },
    methods: {
        wrapDownload() {
            if (this.selectInfo.files.length == 1 && !this.selectInfo.files[0].dir) {
                this.downloadFile({
                    path: this.selectInfo.path,
                    name: this.selectInfo.files[0].name
                })
                return
            }
            this.loading = true
            const conf = API.share.createWrap(this.sid, this.verification, this.extractCode, {
                source: this.selectInfo.path,
                filenames: this.selectInfo.files.map(e => e.name)
            })
            this.axios(conf)
                .then(e => {
                    let alias = this.selectInfo.path.split('/').pop().replace(/^\s+/, '')
                    if (alias === '') {
                        alias = this.shareInfo.name
                    }
                    const base = this.axios.defaults.baseURL.replace(/\/+$/, '')
                    const url = base + (API.file.downloadWrap(e.data.data, alias + '_打包.zip').url)
                    window.open(url)
                    this.loading = false
                }).catch(e => {
                    mdui.snackbar(e.toString())
                    this.loading = false
                })
        },
        selectChange(e) {
            this.selectInfo = e
        },
        /**
         * 下载文件
         * @param {Object=} e 包含path和name属性的对象（仅当分享类型为目录时使用），path - 文件所在目录，name - 文件名
         */
        downloadFile(e) {
            if(this.shareInfo.type != 'FILE' && GlobalAttr.isImage(e.name)) {
                SfcUtils.previewImage(this.$refs.browser.getFileList(), e)
                return
            }
            const req = API.share.getFileContent(this.shareInfo.id, this.verification, this.extractCode, e.path, e.name)
            const params = qs.stringify(req.params)
            const url = req.url + '?' + params
            window.open(location.origin + this.axios.defaults.baseURL + url)
        },
        clickFile(e) {
            this.downloadFile({
                path: e.path,
                name: e.file.name
            })
        },
        loadInfo() {
            this.loading = true
            this.axios(API.share.getBaseShareInfo(this.sid, this.verification, this.extractCode)).then(e => {
                const data = e.data.data
                if (this.shareInfo && !data.validateSuccess) {
                    this.msg = '提取码错误'
                }
                data.verification = this.verification
                this.shareInfo = data
                this.shareInfo.imgUrl = this.axios.defaults.baseURL + '/' + API.user.getAvatar(e.data.data.username).url
                this.loading = false
            }).catch(e => {
                if (e.status == 404) {
                    this.notfound = true
                }
                mdui.snackbar(e.toString())
                this.loading = false
            })
        },
        extract(e) {
            if (!e) {
                this.msg = '请输入提取码'
                return
            }
            this.extractCode = e
            this.loadInfo()
        }
    }
}
</script>

<style scoped>
.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    box-shadow: 0 0px 3px 0px black;
}
.input-field {
    padding: 20px 0;
}
.download-btn {
    position: absolute;
    bottom: 48px;
    right: 48px;
}
</style>
