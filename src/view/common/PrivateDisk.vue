<template>
    <file-handler
        v-if="userInfo != null"
        :uid="userInfo.id"
        :path="path"
    >
    </file-handler>
    <container v-else class="mdui-typo">
        <h3>未登录，请先<router-link to="/login">登录</router-link></h3>
        <p>该功能需要登录账号后才能使用噢~</p>
    </container>
</template>

<script>
import mdui from 'mdui'
import FileHandler from '../../components/FileHandler.vue'
import Container from '../../components/layout/Container.vue'
export default {
    components: { FileHandler, Container },
    computed: {
        path() {
            return this.$route.params.pathMatch || '/'
        },
        userInfo() {
            return this.$store.getters.userInfo
        },
        isModifiable() {
            return this.userInfo != null && this.userInfo.type == 1
        }
    },
    mounted() {
        if (this.userInfo == null) {
            mdui.snackbar('私人网盘需要登录，请先登录', {
                position: 'top'
            })
        }
    }
}
</script>

<style>

</style>
