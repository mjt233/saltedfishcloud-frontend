<template>
    <mdui-card
        class="resource-extractor"
        :avatar="shareInfo.imgUrl"
        :title="shareInfo.username + '的分享'"
        :subtitle="'创建于：' + fmtDate(shareInfo.createdAt)"
    >
        <div class="mdui-container mdui-typo">
            <mdui-row v-if="shareInfo.type == 'FILE'">
                <h3>分享的是文件</h3>
            </mdui-row>
            <mdui-row v-if="shareInfo.type == 'DIR'">
                <h3>分享的是目录</h3>
            </mdui-row>
        </div>
    </mdui-card>
</template>

<script>
export default {
    name: 'shareBrowser',
    props: ['shareInfo']
}
</script>

<style>

</style>
