<template>
    <file-browser 
        :api="'public'"
        :showPath="true"
        :prefix="'public'"
        :rootName="'公共网盘'"
        :pathLabel="'当前路径：'"
        :showToolBar="userInfo && userInfo.type === 1"
        @clickFile='clickFile'
        @dropFile='dropFile'
    >

    </file-browser>
</template>

<script>
import mdui from 'mdui'
import FileBrowser from '../components/FileBrowser.vue'
import Type from '../typedescribe/type'
import Global from '../global/Global'
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
            let newPath = location.href.replace(`/#/public`, '/pubdown') + `/${encodeURIComponent(e.name)}`
            location.href = newPath
        },
        dropFile(fileinfo) {
            if (this.userinfo.type !== 1) {
                mdui.alert('您无权限操作公共目录')
                return
            }
        }
    }
}
</script>

<style>

</style>