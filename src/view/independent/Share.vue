<template>
    <full-container header :title="'咸鱼云网盘资源分享'">
        <mdui-loading :loading="loading"></mdui-loading>
        <share-not-found v-if="notfound" />
        <share-extractor v-if="shareInfo && !shareInfo.validateSuccess" :msg="msg" :shareInfo="shareInfo" @extract="extract"></share-extractor>
        <share-browser :shareInfo="shareInfo" v-if="shareInfo && shareInfo.validateSuccess"></share-browser>
    </full-container>
</template>

<script>
import FullContainer from '@/components/FullContainer.vue'
import API from '@/api'
import mdui from 'mdui'
import ShareNotFound from '@/components/Share/ShareNotFound.vue'
import ShareExtractor from '@/components/Share/ShareExtractor.vue'
import ShareBrowser from '@/components/Share/ShareBrowser.vue'
export default {
    components: {
        FullContainer,
        ShareNotFound,
        ShareExtractor,
        ShareBrowser
    },
    data() {
        return {
            sid: null,
            verification: null,
            extractCode: '',
            loading: false,
            notfound: false,
            msg: '',
            shareInfo: null
        }
    },
    mounted() {
        this.sid = this.$route.params.sid
        this.verification = this.$route.params.verification
        this.loadInfo()
    },
    methods: {
        loadInfo() {
            this.loading = true
            this.axios(API.share.getBaseShareInfo(this.sid, this.verification, this.extractCode)).then(e => {
                const data = e.data.data
                if (this.shareInfo && !data.validateSuccess) {
                    this.msg = '提取码错误'
                }
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
