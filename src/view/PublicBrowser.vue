<template>
    <file-list 
        class="list"
        @clickItem="click"
        @back="back"
        :loading="loading"
        :file-list="fileList">
        <div>
            <span> 当前路径：</span>
            <ul class="path-bar mdui-typo">
                <li><a href="/#/public">/</a></li>
                <li v-for="(path,index) in paths" :key="path"><a :href="'/#/public/'+paths.slice(0,index+1).join('/')">{{path | urlDecode}}</a></li>
            </ul>
            <div class="mdui-textfield mdui-textfield-expandable">
                <button class="mdui-textfield-icon mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">search</i></button>
                <input class="mdui-textfield-input" type="text" placeholder="检索文件 空格分隔关键字"/>
                <button class="mdui-textfield-close mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">close</i></button>
            </div>
        </div>
    </file-list>
</template>

<script>
import fileList from '@/components/FileList.vue'
import Container from '../components/Container.vue'
export default {
    name: 'PublicBrowser',
    data () {
        return {
            fileList:[],
            paths:[],
            loading:false
        }
    },
    mounted() {
        this.updatePath()
        this.loadList()
    },
    methods: {
        click (e) {
            if (e.type === 1) {
                location.href += `/${encodeURIComponent(e.name)}`
            } else {
                let newPath = location.href.replace('/#/public', '/pubdown') + `/${encodeURIComponent(e.name)}`
                location.href = newPath
            }
        },loadList() {
            this.loading = true
            let url = `getPublicList/${this.paths.join('/')}`
            this.$axios.post(url).then(e => {
                this.loading = false
                this.fileList = e.data.data[0].concat(e.data.data[1])
            })
        },updatePath() {
            this.paths = this.$route.path.substring('/public'.length).split('/').filter(i => i.length > 0)
        },back() {
            this.paths.pop()
            location.href = `/#/public/${this.paths.join('/')}`
            this.loadList()
        }
    },
    watch: {
        $route(to, from) {
            this.updatePath()
            this.loadList()
        }
    },
    filters: {
        urlDecode(input) {
            return decodeURI(input)
        }
    },
    components: { fileList }
}
</script>

<style scope lang="less">
.path-bar {
    display: inline-block;
    margin: 0;
    padding: 0;
    li {
        a {
            display: inline-block;
            padding: 0 10px;
        }
        display: inline-block;
        color: blue;
        & + li::before {
            content: '>';
            color: rgb(160, 160, 160);
            font-size: 10px;
            margin: 0 3px;
        }
    }
}
.list {
    margin: 0 auto;
    opacity: .95;
}
</style>
