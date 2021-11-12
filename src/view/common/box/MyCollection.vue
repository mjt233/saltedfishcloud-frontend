<template>
    <container :loading="loading">
        <div class="mdui-typo">
            <h5 class="title-group"><mdui-btn @click="$router.push('/box')" :icon="'keyboard_backspace'"></mdui-btn><span>文件收集</span></h5>
            <mdui-hr></mdui-hr>
            <!-- 收集列表展示 -->
            <fill-center :width="width" :smWidth="'100%'">
                <simple-collection-info
                    class="info-card"
                    v-for="item in collectionList"
                    :info="item"
                    :key="item.id"
                    @click.native="showDetail(item)"
                />
            </fill-center>
        </div>

        <!-- 详情展示 -->
        <mdui-dialog
            ref="detialDialog"
            :show.sync="detialDialog.show"
            :disableDefBtn="true"
            :title="itemInfo ? itemInfo.title : ''"
            style="user-select: text"
            @open="resetTab"
        >
            <div class="mdui-tab mdui-tab-full-width" mdui-tab style=" overflow: hidden">
                <a @click="detialDialog.tab = 1" ref="collectionTab1" href="#collection-tab1" class="mdui-ripple">基本信息</a>
                <a @click="detialDialog.tab = 2" href="#collection-tab2" class="mdui-ripple">提交记录</a>
            </div>
            <detail-collection-info v-show="detialDialog.tab == 1" @goto="goto" :info="itemInfo" />
            <collection-record v-if="itemInfo" :cid="itemInfo.id" v-show="detialDialog.tab == 2"></collection-record>
            <template slot="btn">
                <button class=" mdui-btn mdui-ripple"  @click="detialDialog.show=false">确定</button>
            </template>
        </mdui-dialog>

        <!-- 新建收集对话框 -->
        <mdui-dialog full :show.sync="showAdd" :title="'创建文件收集'">
            <collection-creator @create="startCreate" ref="creator" />
        </mdui-dialog>
        <mdui-btn @click="showAdd=true" :fab="true" :fixed="true" :icon="'add'" ></mdui-btn>
    </container>
</template>

<script>
import Container from '@/components/layout/Container.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
import mdui from 'mdui'
import API from '@/api'
import SimpleCollectionInfo from '@/components/Collection/SimpleCollectionInfo.vue'
import FillCenter from '@/components/ui/Layout/FillCenter.vue'
import MduiDialog from '@/components/ui/MduiDialog.vue'
import DetailCollectionInfo from '@/components/Collection/DetailCollectionInfo.vue'
import MduiBtn from '@/components/ui/MduiBtn.vue'
import CollectionCreator from '@/components/Collection/CollectionCreator.vue'
import CollectionRecord from '@/components/Collection/CollectionRecord.vue'

export default {
    name: 'myCollection',
    components: {
        Container,
        MduiHr,
        SimpleCollectionInfo,
        FillCenter,
        MduiDialog,
        DetailCollectionInfo,
        MduiBtn,
        CollectionCreator,
        CollectionRecord
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
            detialDialog: {
                show: false,
                tab: 1
            },
            itemInfo: undefined,
            showAdd: false
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
        /**
         * 将收集详情对话框的标签页重置到基本信息，并更新对话框高度
         */
        resetTab() {
            this.$refs.collectionTab1.click()
            this.$nextTick().then(() => {
                this.$refs.detialDialog.update()
            })
        },
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
            this.itemInfo.link = location.origin + '/#/submit?id=' + item.id + '&verification=' + item.verification
            this.$nextTick().then(() => {
                this.$refs.detialDialog.update()
                if (!this.itemInfo.hasParsed) {
                    this.loading = true
                    this.axios(API.resource.parseNodeId(this.userInfo.id, item.saveNode)).then(e => {
                        this.loading = false
                        this.itemInfo.hasParsed = true
                        this.itemInfo.saveNode = e.data.data
                        this.detialDialog.show = true
                    }).catch(e => {
                        if (item.state == 'OPEN') {
                            this.axios(API.collection.close(item.id)).then(() => {
                                mdui.snackbar('该收集保存位置已被删除，收集关闭')
                                this.itemInfo.state = 'CLOSED'
                                this.loadInfo()
                            }).catch(er => {
                                mdui.snackbar(er.toString())
                            }).finally(() => {
                                this.itemInfo.hasParsed = true
                                this.loading = false
                                this.detialDialog.show = true
                            })
                        } else {
                            this.itemInfo.hasParsed = true
                            this.loading = false
                            this.detialDialog.show = true
                        }
                    })
                } else {
                    this.detialDialog.show = true
                }
            })
        },
        async startCreate(e) {
            this.showAdd = false
            this.loading = true
            try {
                if (e.separate) {
                    await this.axios(API.file.mkdir(this.userInfo.id, e.saveNode, e.title))
                    e.saveNode += '/' + e.title
                }
                const d = (await this.axios(API.resource.getNodeInfo(this.userInfo.id, e.saveNode))).data.data
                e.saveNode = d[d.length - 1].id
                console.log(e)
                await this.axios(API.collection.create(e))
                mdui.snackbar('创建成功')
            } catch (err) {
                this.showAdd = true
                mdui.snackbar(err.toString())
            } finally {
                this.loading = false
                this.loadInfo()
            }
        },
        async goto(e) {
            this.detialDialog.show = false
            setTimeout(() => {
                this.$router.push(e)
            }, 100)
            // location.href = '/#' + e
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
.title-group {
    display: flex;
    align-items: center;
    >* {
        margin-right: 10px;
    }
}
</style>
