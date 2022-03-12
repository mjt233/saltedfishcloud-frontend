<template>
    <div v-if="!record || record.length == 0">
        <mdui-hr style="margin: 6px 0 16px 0"></mdui-hr>
        <mdui-btn dense @click="refresh">刷新</mdui-btn>
        <p class="mdui-text-center light-text">没有收到文件提交，空空如也呢~o(*￣▽￣*)o</p>
    </div>
    <div v-else>
        <mdui-loading :loading="loading"></mdui-loading>
        <mdui-hr style="margin: 6px 0 16px 0"></mdui-hr>
        <div class="tool-bar">
            <pager @change="pageChange" v-show="pageCount > 1" :pageCount="pageCount"></pager>
            <mdui-btn dense @click="refresh">刷新</mdui-btn>
        </div>
        <mdui-panel>
            <mdui-panel-item v-for="item in record" :key="item.id" :headerStyle="{'overflow-x': 'auto'}">
                <!-- 面板header -->
                <template slot="header">
                    <!-- 文件名显示 -->
                    <span>文件名：{{item.filename}}</span>
                    <div class="mdui-toolbar-spacer"></div>
                    <!-- 文件大小和下载按钮 -->
                    <span class="light-text">
                        {{item.size | formatSize}}
                        <mdui-icon style="border-radius: 50%; padding: 5px" class="mdui-ripple" @click.native.prevent.stop="download(item)" :icon="'file_download'"></mdui-icon>
                    </span>
                </template>
                <table class="mdui-table detial-table">
                    <tr>
                        <td>MD5校验码</td>
                        <td>{{item.md5}}</td>
                    </tr>
                    <tr>
                        <td>提交者</td>
                        <td>{{item.username ? item.username : '匿名用户'}}</td>
                    </tr>
                    <tr>
                        <td>提交者IP地址</td>
                        <td>{{item.ip}}</td>
                    </tr>
                    <tr>
                        <td>提交日期</td>
                        <td>{{item.createdAt | formatDate}}</td>
                    </tr>
                </table>
            </mdui-panel-item>
        </mdui-panel>
    </div>
</template>

<script>
import API from '@/api'
import pager from '../ui/pager.vue'
import mdui from 'mdui'
import MduiPanel from '../ui/MduiPanel.vue'
import MduiPanelItem from '../ui/MduiPanelItem.vue'
import MduiIcon from '../ui/MduiIcon.vue'
import MduiHr from '../ui/MduiHr.vue'
import MduiLoading from '../ui/MduiLoading.vue'
import MduiBtn from '../ui/MduiBtn.vue'
import { Throttle } from '@/utils/EventUtils'
export default {
    components: { pager, MduiPanelItem, MduiPanel, MduiIcon, MduiHr, MduiLoading, MduiBtn },
    name: 'collectionRecord',
    props: {
        cid: {
            type: Number
        }
    },
    data() {
        return {
            record: null,
            page: 1,
            size: 10,
            pageCount: 0,
            loading: false,
            throttle: new Throttle()
        }
    },
    mounted() {
        this.loadList()
    },
    watch: {
        cid() {
            this.loadList()
        }
    },
    methods: {
        refresh() {
            this.throttle.execute(this.loadList, 500)
        },
        loadList() {
            if (!this.cid) {
                this.record = null
                return
            }
            this.loading = true
            this.axios(API.collection.getRecords(this.cid, this.page, this.size)).then(e => {
                this.record = e.data.data.content
                this.pageCount = e.data.data.totalPage
                this.loading = false
            }).catch(e => {
                mdui.snackbar(e.toString())
                this.loading = false
            })
        },
        download(item) {
            const url = (this.axios.defaults.baseURL + '/' + API.resource.downloadFileByMD5(item.md5, item.filename).url).replace(/\/\/+/g, '/')
            window.open(url)
        },
        pageChange(p) {
            this.page = p
            this.loadList()
        }
    }
}
</script>

<style lang="less" scoped>
.tool-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.detial-table {
    margin-top: 26px;
    margin-bottom: 10px;
    td {word-break: break-all;}
}
</style>
