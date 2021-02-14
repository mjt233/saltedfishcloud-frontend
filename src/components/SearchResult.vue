<template>
    <div style="height: 100%; opacity: .95">
        <file-list 
            :enableDragSelect="false"
            :loading="loading || d_loading"
            :fileList='res'
        >
            <div class="mdui-typo">
                <p>当前路径：<a @click="$emit('back')">{{rootLabel}}</a> > "搜索：{{searchKey}}"</p>
            </div>
            <template v-slot:columnHeader>
                <div class="file-name">文件名</div>
                <div>大小</div>
                <div>所在目录</div>
            </template>
            <template v-slot:columnItem="props">
                <div @click="clickFile(props.item)" class="file-name">{{props.item.name}}</div>
                <div @click="clickFile(props.item)" v-if="props.item.file">{{props.item.size | formatSize}}</div>
                <div @click="clickFile(props.item)" v-else>-</div>
                <div class="mdui-typo">
                    <a @click="clickPath(props.item.node)" href="javascript:;">{{props.item.parent || '/'}}</a>
                </div>
            </template>
        </file-list>
    </div>
</template>

<script>
import StringFormatter from '../utils/StringFormatter'
import FileList from './FileList.vue'
export default {
    components: { FileList },
    data() {
        return {
            page: 1,
            res: [],
            d_loading: false
        }
    },
    props: {
        'loading': {
            // 是否加载中
            type: Boolean,
            default: false
        },
        'searchKey': {
            //  搜索的关键字
            type: String,
            default: ''
        },
        'uid': {
            //  用户ID
            type: Number
        },
        'rootLabel': {
            //  向用户展示的根目录超链接标签
            type: String,
            default: '全部文件'
        }
    },
    filters: {
        formatSize(input) {
            return StringFormatter.formatSizeString(input)
        }
    },
    computed: {
        searchAPI() {
            return `resource/search/${this.uid}`
        }
    },
    mounted() {
        this.doSearch()
    },
    methods: {
        doSearch() {
            this.$axios.get(this.searchAPI, {
                params: {
                    key: this.searchKey,
                    page: this.page
                }
            }).then(e => {
                this.res = e.data.data.list
            })
        },
        clickFile(info) {
            this.d_loading = true

            this.parseNode(this.uid, info.dir ? info.md5 : info.node).then(e => {
                this.d_loading = false
                if (info.dir) {
                    this.$emit('clickDir', e)
                } else {
                    this.$emit('clickFile', `${e}/${info.name}`)
                }
            })
        },
        clickPath(info) {
            this.d_loading = true

            // 获取文件搜索结果中的节点ID所对应的用户路径，通过jump事件将数据提交给父组件
            this.parseNode(this.uid, info).then(e => {
                this.d_loading = false
                this.$emit('clickDir', e)
            })
        },
        parseNode(uid, nodeId) {
            return new Promise((resolve, reject) => {
                this.$axios.get('resource/getPath', {
                    params: {
                        uid: uid,
                        nodeId: nodeId
                    }
                }).then(e => {
                    if (e.data.data == '/') {
                        resolve('')
                    } else {
                        resolve(e.data.data)
                    }
                }).catch(e => {
                    reject(e)
                })
            })
        }
    }

}
</script>
<style lang="less" scoped>
a {
    cursor: pointer;
}
</style>
<style>

</style>