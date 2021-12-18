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
        />
        <mdui-btn @click="wrapDownload" :fixed="true" :fab="true" :hid="selectInfo.files.length == 0" :icon="'file_download'"></mdui-btn>
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
            this.loading = true
            const conf = API.share.createWrap(this.sid, this.verification, this.extractCode, {
                source: this.selectInfo.path,
                filenames: this.selectInfo.files.map(e => e.name)
            })
            this.axios(conf)
                .then(e => {
                    const url = this.axios.defaults.baseURL + '/' + (API.file.downloadWrap(e.data.data, this.shareInfo.name + '.zip').url)
                    window.open(url)
                }).catch(e => {
                    mdui.snackbar(e.toString())
                }).finally(_ => {
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
            const req = API.share.getFileContent(this.shareInfo.id, this.verification, this.extractCode, e.path, e.file ? e.file.name : undefined)
            const params = qs.stringify(req.params)
            const url = req.url + '?' + params
            window.open(location.origin + this.axios.defaults.baseURL + url)
        },
        clickFile(e) {
            this.downloadFile(e)
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
            }).catch(e => {
                if (e.status == 404) {
                    this.notfound = true
                }
                mdui.snackbar(e.toString())
            }).finally(() => {
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
</style>
