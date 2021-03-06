<template>
    <div style="height: 100%;">
        <file-list
            :enableDragSelect="false"
            :loading="loading || d_loading"
            :fileList='res.list'
        >
            <!-- 文件列表标头 -->
            <div class="mdui-typo">
                <p>当前路径：<a @click="$emit('back')">{{rootLabel}}</a> > "搜索：{{searchKey}}"</p>
            </div>
            <!-- 顶部分页器 -->
            <div style="display:flex;justify-content: center;">
                <pager :disabled="d_loading" :pageCount="res.pages" @change="doSearch"></pager>
            </div>
            <!-- 表格表头列 -->
            <template v-slot:columnHeader>
                <div class="file-name">文件名</div>
                <div>大小</div>
                <div>所在目录</div>
            </template>

            <!-- 表格数据列 -->
            <template v-slot:columnItem="props">
                <div @click="clickFile(props.item)" class="file-name">{{props.item.name}}</div>
                <div @click="clickFile(props.item)" v-if="props.item.size > 0">{{props.item.size | formatSize}}</div>
                <div @click="clickFile(props.item)" v-else>-</div>
                <div class="mdui-typo">
                    <a @click="clickPath(props.item)" href="javascript:;">{{props.item.parent || '/'}}</a>
                </div>
            </template>

            <!-- 文件列表页脚处 -->
            <template v-slot:footer>
                <div class="res-info mdui-typo">结果总数：{{res.total}}条  页数：{{res.pages}}页</div>
            </template>
        </file-list>
    </div>
</template>

<script>
import mdui from 'mdui'
import StringFormatter from '../utils/StringFormatter'
import FileList from '@/components/FileList/FileList.vue'
import Pager from './ui/pager.vue'
import apiConfig from '../api'
export default {
    components: { FileList, Pager },
    data() {
        return {
            page: 1,
            res: [],
            d_loading: false
        }
    },
    props: {
        loading: {
            // 是否加载中
            type: Boolean,
            default: false
        },
        searchKey: {
            //  搜索的关键字
            type: String,
            default: ''
        },
        uid: {
            //  用户ID
            type: Number
        },
        rootLabel: {
            //  向用户展示的根目录超链接标签
            type: String,
            default: '全部文件'
        }
    },
    filters: {
        formatSize(input) {
            return StringFormatter.toSize(input)
        }
    },
    computed: {
        searchAPI() {
            return `resource/search/${this.uid}`
        }
    },
    mounted() {
        this.doSearch(1)
    },
    methods: {
        doSearch(page) {
            this.d_loading = true
            const conf = apiConfig.file.search(this.uid, this.searchKey, page)
            this.$axios(conf).then(e => {
                this.d_loading = false
                this.res = e.data.data
            }).catch(e => {
                this.d_loading = false
                mdui.alert(e.msg)
            })
        },
        async clickFile(info) {
            if (!info.dir) {
                this.$emit('clickFile', info)
            } else {
                this.d_loading = true
                try {
                    const path = await this.parseNode(this.uid, info.dir ? info.md5 : info.node)
                    info.path = path
                    this.$emit('clickDir', info)
                    this.d_loading = false
                } catch (err) {
                    mdui.alert(err.toString())
                }
                this.d_loading = false
            }
        },
        async clickPath(info) {
            this.d_loading = true
            try {
                const path = await this.parseNode(this.uid, info.node)
                info.path = path
                this.$emit('clickDir', info)
            } catch (err) {
                mdui.alert(err.toString())
                this.d_loading = false
            }
        },
        parseNode(uid, nodeId) {
            return new Promise((resolve, reject) => {
                const conf = apiConfig.resource.parseNodeId(uid, nodeId)
                this.$axios(conf).then(e => {
                    if (e.data.data == '/') {
                        resolve('')
                    } else {
                        resolve(e.data.data)
                    }
                }).catch(e => {
                    mdui.alert('请求路径解析出错，服务器信息：<br>' + e.msg)
                    reject(e)
                })
            })
        }
    }

}
</script>
<style scoped>
a {
    cursor: pointer;
}
.res-info {
    font-size: 12px;
    color: rgb(39, 39, 39);
}
</style>
