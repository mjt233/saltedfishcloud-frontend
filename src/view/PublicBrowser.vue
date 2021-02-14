<template>
    <file-browser 
        :uid="0"
        :api="'fileList/0'"
        :showPath="true"
        :prefix="'public'"
        :rootName="'公共网盘'"
        :pathLabel="'当前路径：'"
        :showToolBar="userInfo && userInfo.type === 1"
        @clickFile='clickFile'
        @dropFile='dropFile'
        @search='search'
    >

    </file-browser>
</template>

<script>
import mdui from 'mdui'
import FileBrowser from '../components/FileBrowser.vue'
import Type from '../typedescribe/type'
import apiConfig from '../api/apiConfig'
export default {
    name: 'PublicBrowser',
    data() {
        return {
            showToolBar: false
        }
    },
    components: {
        FileBrowser
    },
    computed: {
        /**
         * @type {Type.UserInfo}
         * @return {Type.UserInfo}
         */
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    mounted () {
    },
    methods: {
        clickFile(e) {
            let filePath = location.href.replace(/^(.*)\/public/, '/') + `/${encodeURIComponent(e.name)}`
            let newPath = `${apiConfig.server}/download/0${filePath.replace(/\/+/g, '/')}`
            location.href = newPath
        },
        dropFile(fileinfo) {
            if (this.userinfo.type !== 1) {
                mdui.alert('您无权限操作公共目录')
                return
            }
        },search(name) {
            console.log(name)
        }
    }
}
</script>

<style>

</style>