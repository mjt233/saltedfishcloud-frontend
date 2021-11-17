<template>
    <div class=" mdui-container my-share-list" v-if="uid">
        <mdui-loading :loading="loading"></mdui-loading>
        <pager @change="pageChange" :pageCount="pageCount" v-show="pageCount > 1"></pager>
        <p v-show="shareList.length == 0">分享空空如也o(*￣▽￣*)o</p>
        <mdui-panel accordion class="list-panel">
            <simple-share-item @deleteShare="deleteShare" v-for="item in shareList" :key="item.id" :shareInfo="item"></simple-share-item>
        </mdui-panel>
    </div>
</template>

<script>
import API from '@/api'
import SimpleShareItem from './SimpleShareItem.vue'
import MduiLoading from '../ui/MduiLoading.vue'
import mdui from 'mdui'
import MduiPanel from '../ui/MduiPanel.vue'
import Pager from '../ui/pager.vue'

export default {
    components: { SimpleShareItem, MduiLoading, MduiPanel, Pager },
    name: 'myShareList',
    data() {
        return {
            shareList: [],
            page: 1,
            pageCount: 0,
            loading: false
        }
    },
    props: {
        uid: {
            type: Number
        }
    },
    mounted() {
        this.loadList()
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    methods: {
        loadList() {
            const uid = this.uid == this.userInfo.id ? undefined : this.uid
            this.loading = true
            this.axios(API.share.getShareList(uid, this.page, 10)).then(e => {
                this.shareList = e.data.data.content
                this.pageCount = e.data.data.totalPage
                this.$emit('load')
            }).catch(err => {
                mdui.snackbar(err.toString())
            }).finally(() => {
                this.loading = false
            })
        },
        pageChange(e) {
            this.page = e
            this.loadList()
        },
        deleteShare(e) {
            this.loading = true
            this.axios(API.share.deleteShare(e.id)).then(() => {
                mdui.snackbar('已取消分享')
                this.loadList()
            }).catch(e => {
                mdui.snackbar(e.toString())
                this.loading = false
            })
        }
    }
}
</script>

<style scoped>
.my-share-list {
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    margin-top: 8px;
}
.list-panel {
    margin: 24px 0;
}
</style>
