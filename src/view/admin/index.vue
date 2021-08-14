<template>
    <div ref="root">
        <header ref="header" class="mdui-appbar mdui-appbar-fixed">
            <div class="mdui-toolbar mdui-color-theme">
            <a @click="switchMenu" href="javascript:;" class="mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">menu</i></a>
            <a href="javascript:;" class="mdui-typo-title">咸鱼云后台</a>
            <div class="mdui-toolbar-spacer"></div>
            <router-link to="/">用户前台</router-link>
            <div v-if="userInfo != null">
                <router-link to="/my" style="color: white">
                <img class="mdui-chip-icon" :src="userAvatarURL" />
                <span class="mdui-chip-title">{{userInfo.user}}</span>
                </router-link>
            </div>
            <div v-else>
                <router-link to="/login" style="color: white">
                <img class="mdui-chip-icon" :src="userAvatarURL" />
                <span class="mdui-chip-title">[游客]</span>
                </router-link>
            </div>
            </div>
        </header>
        <admin-drawer :menu="menu" ref="drawer"></admin-drawer>
        <router-view></router-view>
    </div>
</template>

<script>
import mdui from 'mdui'
import AdminDrawer from '@/components/layout/AdminDrawer.vue'
export default {
    components: { AdminDrawer },
    data() {
        return {
            drawer: null,
            menu: [
                { name: '系统总览', icon: 'pie_chart', to: '/admin/overview' },
                { name: '用户管理', icon: 'people', to: '/admin/user' },
                { name: '系统配置', icon: 'settings_applications', to: '/admin/sys' },
                { name: '开发者调试', icon: 'developer_board', to: '/admin/dev' }
            ],
            header: null
        }
    },
    mounted() {
        if (!this.userInfo || this.userInfo.type != 1) {
            mdui.alert('未登录或无权限！', () => {
                setTimeout(() => {
                    this.$router.push('/')
                }, 10)
            })
        }
        this.drawer = new mdui.Drawer(this.$refs.drawer.$el)
        this.header = this.$refs.header
        if (this.$route.params.close) {
            this.drawer.close()
        }
        this.setAppHeight()
        window.addEventListener('resize', this.setAppHeight)
    },
    destroyed() {
        window.removeEventListener('resize', this.setAppHeight)
    },
    computed: {
        userInfo() {
            return this.$store.getters.userInfo
        },
        userAvatarURL() {
            return this.$store.state.avatarURL
        }
    },
    methods: {
        switchMenu() {
            this.drawer.toggle()
        },
        setAppHeight() {
            const h = document.documentElement.clientHeight - this.header.offsetHeight + 'px'
            this.$refs.root.style.minHeight = h
            this.$refs.root.style.height = h
        }
    },
    watch: {
        $route() {
            if (document.documentElement.clientWidth < 1024) {
                this.drawer.close()
            }
        }
    }
}
</script>

<style>
</style>
