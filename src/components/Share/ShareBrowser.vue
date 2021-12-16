<template>
    <mdui-card
        class="resource-extractor"
        :avatar="shareInfo.imgUrl"
        :title="shareInfo.username + '的分享'"
        :subtitle="'创建于：' + fmtDate(shareInfo.createdAt)"
    >
        <mdui-loading :loading="loading"></mdui-loading>
        <div class="mdui-container">
            <!-- 分享类型为文件的视图 -->
            <mdui-row v-if="shareInfo.type == 'FILE'">
                <!-- 两列，左边文件图标，右边文件信息 -->
                <mdui-row class=" mdui-valign share-file-view">
                    <mdui-col md=1>
                        <i class="file-icon file" :class="'type-' + fileExt"></i>
                    </mdui-col>
                    <mdui-col xs=9>
                        <mdui-row>
                            <p>文件名：{{shareInfo.name}}</p>
                        </mdui-row>
                        <mdui-row>
                            <p class=" light-text">大小：{{shareInfo.size | formatSize}}</p>
                        </mdui-row>
                    </mdui-col>
                </mdui-row>
                <!-- 下载/预览按钮 -->
                <mdui-row class="download-btn-group">
                    <mdui-btn @click="$emit('download', shareInfo)"><mdui-icon :icon="'file_download'"/>立即下载</mdui-btn>
                </mdui-row>
            </mdui-row>
            <!-- 分享类型为目录的视图 -->
            <mdui-row v-if="shareInfo.type == 'DIR'">
                <mdui-row class="mdui-typo path-control" :class="{'sticky': sticky === '' || sticky}">
                    <ul>
                        <li @click="last"><a href="javascript:;">返回上一级</a></li>
                    </ul>
                    <ul>
                        <li v-for="(p, i) in paths" :key="i" @click="jump(i)">
                            <a href="javascript:;">{{p}}</a>
                        </li>
                    </ul>
                </mdui-row>
                <file-list
                    style="padding-top: 0;height: auto"
                    :fileList="filelist"
                    :disableGetlink="true"
                    :disableRefresh="true"
                    :enable="'name size date return select'"
                    @clickItem="clickItem"
                />
            </mdui-row>
        </div>
    </mdui-card>
</template>

<script>
import API from '@/api'
import FileList from '../FileList/FileList.vue'
import MduiRow from '../ui/MduiRow.vue'
import mdui from 'mdui'
import MduiBtn from '../ui/MduiBtn.vue'
import MduiIcon from '../ui/MduiIcon.vue'
export default {
    components: { FileList, MduiRow, MduiBtn, MduiIcon },
    name: 'shareBrowser',
    props: ['shareInfo', 'extractCode', 'sticky'],
    data() {
        return {
            paths: [],
            filelist: [],
            curIndex: 0,
            loading: false
        }
    },
    computed: {
        path() {
            return '/' + this.paths.join('/')
        },
        fileExt() {
            return this.shareInfo ? this.shareInfo.name.split('.').pop() : ''
        }
    },
    mounted() {
        this.loadList()
    },
    methods: {
        loadList() {
            if (this.shareInfo.type == 'FILE') return
            this.loading = true
            const conf = API.share.browseDirShare(this.shareInfo.id, this.shareInfo.verification, this.extractCode, this.path)
            this.curIndex = this.paths.length - 1
            this.axios(conf).then(e => {
                const list = e.data.data.flat()
                this.filelist = list
            }).catch(err => {
                mdui.snackbar(err.toString())
            }).finally(() => {
                this.loading = false
            })
        },
        clickItem(e) {
            if (e.size == -1) {
                this.paths.push(e.name)
                this.loadList()
            } else {
                this.$emit('clickFile', {
                    file: e,
                    path: this.path
                })
            }
        },
        jump(index) {
            const cnt = this.paths.length - index - 1
            this.paths.splice(index + 1, cnt)
            this.loadList()
        },
        last() {
            this.jump(--this.curIndex)
        }
    }
}
</script>

<style scoped>
.path-control {
    background-color: white;
}
.path-control.sticky {
    position: sticky;
    top: 0;
    padding-top: 10px;
    z-index: 1;
}
.path-control ul {
    display: inline-block;
    list-style: none;
    padding: 0;
    margin: 0;
}
.path-control ul:first-child::after {
    content: '|';
    position: relative;
    display: inline-block;
    top: -1px;
}
.path-control ul li {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 8px;
}
.path-control .path-icon {
    font-size: 16px;
}
.path-control ul li + li::before {
    font-family: "Material Icons";
    content: 'chevron_right';
    position: absolute;
    left: -6px;
}
.path-control a {
    position: relative;
    display: inline-block;
}
.file-icon {
    --size: 32px;
    width: var(--size);
    height: var(--size);
    background-size: var(--size) var(--size);
    background-position: center;
    background-repeat: no-repeat;
    display: inline-block;
}
.share-file-view p {
    margin: 0;
}
.download-btn-group {
    margin-top: 12px;
}
</style>
