<template>
    <div>
        <header class="mdui-appbar mdui-appbar-fixed">
            <div class="mdui-toolbar mdui-color-indigo">
            <a @click="switchMenu" href="javascript:;" class="mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">menu</i></a>
            <a href="javascript:;" class="mdui-typo-title">咸鱼云管理员后台</a>
            <a href="">返回前台</a>
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
                <mdui-list-item :icon="'move_to_inbox'">Inbox</mdui-list-item>
                <mdui-list-item :icon="'star'">starred</mdui-list-item>
                <mdui-list-item :icon="'send'">Sent mail</mdui-list-item>
                <mdui-subheader>我是子标题</mdui-subheader>
                <mdui-list-item :icon="'email'">All mail</mdui-list-item>
                <mdui-sub-list :icon="'email'" :title="'二级菜单'">
                    <mdui-list-item >aaaaa</mdui-list-item>
                </mdui-sub-list>
                <mdui-list-item :icon="'delete'">Trash</mdui-list-item>
                <mdui-list-item :icon="'error'">Spam</mdui-list-item>
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