<template>
    <file-browser 
        :api="'getPublicList'"
        :showPath="true"
        :prefix="'public'"
        :rootName="'公共网盘'"
        :pathLabel="'当前路径：'"
        @clickFile='clickFile'
    >

    </file-browser>
</template>

<script>
import FileBrowser from '../components/FileBrowser.vue'
export default {
    name: 'PublicBrowser',
    components: {
        FileBrowser
    },
    methods: {
        clickFile(e) {
            let newPath = location.href.replace(`/#/public`, '/pubdown') + `/${encodeURIComponent(e.name)}`
            location.href = newPath
        }
    }
}
</script>

<style>

</style>