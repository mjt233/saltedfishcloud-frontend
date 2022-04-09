<template>
    <mdui-dialog full :show.sync="showDialog" :title="title" :loading="loading">
        <file-browser
            :uid="uid"
            :showToolBar="false"
            :showPath="true"
            :manualEnable="'mkdir name size date menu toolbar delete'"
            :routeMode="false"
            :path.sync="browserPath"
            :disableSearch="true"
            :rootName="username ? username + '的私人网盘' : '网盘'"
            :fileFilter="fileFilter"
            ref="browser"
            @createFolder="createFolder"
            @delete="deleteItem"
            @getURL='getURL'
        />
        <mdui-btn @click="confirm" :hid="!showDialog" :fab="true" :fixed="true" :icon="'check'"></mdui-btn>
    </mdui-dialog>
</template>

<script>
import API from '@/api'
import mdui from 'mdui'
export default {
    name: 'FileSelector',
    props: {
        uid: {
            type: Number
        },
        username: {
            type: String
        },
        show: {
            type: Boolean
        },
        title: {
            type: String,
            default: '选择位置'
        },
        path: {
            // 初始路径
            type: String,
            default: '/'
        },
        fileFilter: {
            /**
             * 过滤文件数组显示的文件
             */
            type: Function
        }
    },
    beforeMount() {
        this.browserPath = this.path
    },
    data() {
        return {
            browserPath: '/',
            loading: false,
            showDialog: false
        }
    },
    watch: {
        show(n, o) {
            this.showDialog = n
        },
        showDialog(n, o) {
            this.$emit('update:show', n)
            if (n == false) {
                this.$emit('close')
            }
        }
    },
    methods: {
        confirm() {
            this.$emit('update:show', !this.show)
            this.$emit('confirm', this.browserPath)
        },
        createFolder(e) {
            this.loading = true
            this.axios(API.file.mkdir(this.uid, '/' + e.path.join('/'), e.name)).then(e => {
                this.loading = false
                this.$refs.browser.loadList()
            }).catch(e => {
                this.loading = false
                mdui.snackbar(e.msg)
            })
        },
        getURL() {
            mdui.snackbar('不支持的操作')
        },
        deleteItem(e) {
            const names = []
            e.forEach(el => names.push(el.name))
            const conf = API.file.delete(this.uid, '/' + this.browserPath, names)
            this.loading = true
            this.axios(conf).then(() => {
                this.loading = false
                this.$refs.browser.loadList()
            }).catch(err => {
                this.loading = false
                mdui.alert(err.msg)
            })
        }
    }
}
</script>

<style>

</style>
