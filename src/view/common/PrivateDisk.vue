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
    data() {
        return {
            path: ''
        }
    },
    methods: {
        updatePath() {
            this.path = this.$route.params.pathMatch || '/'
        }
    },
    computed: {
        userInfo() {
            return this.$store.getters.userInfo
        }
    },
    mounted() {
        if (this.userInfo == null) {
            mdui.snackbar('私人网盘需要登录，请先登录', {
                position: 'top'
            })
        }
        this.updatePath()
    },
    watch: {
        $route(to, from) {
            this.updatePath()
        }
    }
}
</script>

<style>

</style>