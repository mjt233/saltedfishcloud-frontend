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
                @click.native="showDetail(item)"
            />
        </fill-center>
        <mdui-dialog
            ref="dialog"
            :show.sync="showDialog"
            :disableDefBtn="true"
            :title="itemInfo ? itemInfo.title : ''"
            style="user-select: text"
        >
            <detail-collection-info :info="itemInfo" />
            <template slot="btn">
                <mdui-btn style="margin:0 16px 8px 0" dense @click="showDialog=false">确定</mdui-btn>
            </template>
        </mdui-dialog>
    </container>
</template>

<script>
import Container from '@/components/layout/Container.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
import mdui from 'mdui'
import API from '@/api'
import SimpleCollectionInfo from '@/components/ui/Collection/SimpleCollectionInfo.vue'
import FillCenter from '@/components/ui/Layout/FillCenter.vue'
import MduiDialog from '@/components/ui/MduiDialog.vue'
import DetailCollectionInfo from '@/components/ui/Collection/DetailCollectionInfo.vue'
import MduiBtn from '@/components/ui/MduiBtn.vue'

export default {
    name: 'myCollection',
    components: {
        Container,
        MduiHr,
        SimpleCollectionInfo,
        FillCenter,
        MduiDialog,
        DetailCollectionInfo,
        MduiBtn
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
            width: 300,
            showDialog: false,
            itemInfo: undefined
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
        },
        showDetail(item) {
            this.itemInfo = item
            this.$nextTick().then(() => {
                this.$refs.dialog.update()
                const nid = this.itemInfo.saveNode
                if (!nid.startsWith('/')) {
                    this.loading = true
                    this.axios(API.resource.parseNodeId(this.userInfo.id, item.saveNode)).then(e => {
                        this.loading = false
                        this.itemInfo.saveNode = e.data.data
                        this.showDialog = true
                    }).catch(e => {
                        mdui.snackbar('节点' + nid + '已丢失')
                        this.loading = false
                        this.showDialog = true
                    })
                } else {
                    this.showDialog = true
                }
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
    cursor: pointer;
}
</style>
