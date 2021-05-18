<template>
    <div>
        <header class="mdui-appbar mdui-appbar-fixed">
            <div class="mdui-toolbar mdui-color-indigo">
            <a @click="switchMenu" href="javascript:;" class="mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">menu</i></a>
            <a href="javascript:;" class="mdui-typo-title">咸鱼云后台</a>
            <router-link to="/">前台</router-link>
            <div class="mdui-toolbar-spacer"></div>
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
        <mdui-drawer ref="drawer" class="mdui-color-white">
            <mdui-list>
                <mdui-list-item :icon="'pie_chart'">系统总览</mdui-list-item>
                <mdui-list-item :icon="'people'">用户管理</mdui-list-item>
                <mdui-sub-list :title="'系统设置'" :icon="'settings_applications'">
                    <mdui-list-item>常规设置</mdui-list-item>
                    <mdui-list-item>存储设置</mdui-list-item>
                    <mdui-list-item>安全选项</mdui-list-item>
                </mdui-sub-list>
                <mdui-list-item :icon="'developer_board'">开发者调试</mdui-list-item>
            </mdui-list>
        </mdui-drawer>
    </div>
</template>

<script>
import mdui from 'mdui'
import MduiDrawer from '../../components/ui/MduiDrawer.vue'
import MduiList from '../../components/ui/MduiList.vue'
import MduiListItem from '../../components/ui/MduiListItem.vue'
import MduiSubheader from '../../components/ui/MduiSubheader.vue'
import MduiSubList from '../../components/ui/MduiSubList.vue'
export default {
    components: { MduiDrawer, MduiList, MduiListItem, MduiSubheader,MduiSubList },
    data() {
        return {
            drawer: null
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
        }
    }
}
</script>

<style>

</style>