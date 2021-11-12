<template>
    <div v-if="!record || record.length == 0">
        <mdui-hr style="margin: 6px 0 16px 0"></mdui-hr>
        <p class="mdui-text-center light-text">没有收到文件提交，空空如也呢~o(*￣▽￣*)o</p>
    </div>
    <div v-else>
        <mdui-loading :loading="loading"></mdui-loading>
        <mdui-hr style="margin: 6px 0 16px 0"></mdui-hr>
        <pager style="margin-bottom: 16px" @change="pageChange" v-show="pageCount > 1" :pageCount="pageCount"></pager>
        <mdui-panel>
            <mdui-panel-item v-for="item in record" :key="item.id">
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
                <table class="mdui-table">
                    <tr>
                        <td>MD5校验码</td>
                        <td>{{item.md5}}</td>
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
export default {
    components: { pager, MduiPanelItem, MduiPanel, MduiIcon, MduiHr, MduiLoading },
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
            loading: false
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
        loadList() {
            if (!this.cid) {
                this.record = null
                return
            }
            this.loading = true
            this.axios(API.collection.getRecords(this.cid, this.page, this.size)).then(e => {
                this.record = e.data.data.content
                this.pageCount = e.data.data.totalPage
            }).catch(e => {
                mdui.snackbar(e.toString())
            }).finally(() => {
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

<style>

</style>
