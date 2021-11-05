<template>
    <container class="mdui-typo" :loading="loading">
        <h5>文件收集</h5>
        <mdui-hr></mdui-hr>
        <fill-center :width="width" :smWidth="'100%'">
            <simple-collection-info
                class="info-card"
                v-for="item in collectionList"
                :info="item"
                :key="item.id"
            />
        </fill-center>
    </container>
</template>

<script>
import Container from '@/components/layout/Container.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
import mdui from 'mdui'
import API from '@/api'
import SimpleCollectionInfo from '@/components/ui/Collection/SimpleCollectionInfo.vue'
import FillCenter from '@/components/ui/Layout/FillCenter.vue'

export default {
    name: 'myCollection',
    components: {
        Container,
        MduiHr,
        SimpleCollectionInfo,
        FillCenter
    },
    computed: {
        userInfo() {
            return this.$store.getters.userInfo
        }
    },
    data() {
        return {
            collectionList: [],
            loading: false,
            width: 300
        }
    },
    mounted() {
        if (!this.userInfo) {
            mdui.alert('未登录，请先登录', () => {
                this.$router.back()
            })
        }
        this.loadInfo()
    },
    methods: {
        loadInfo() {
            this.loading = true
            this.axios(API.collection.getCreated()).then(e => {
                this.collectionList = e.data
                this.loading = false
            }).catch(e => {
                console.log(e)
                mdui.alert(e.msg)
            })
        }
    }

}
</script>

<style lang="less" scoped>
.info-card {
    @media (max-width: 640px) {
        width: 100% !important;
    }
    width: auto;
}
</style>
