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
        <mdui-drawer ref="drawer" class="mdui-color-theme-50">
            <ul class="mdui-list">
                <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-icon mdui-icon material-icons">move_to_inbox</i>
                <div class="mdui-list-item-content">Inbox</div>
                </li>
                <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-icon mdui-icon material-icons">star</i>
                <div class="mdui-list-item-content">Starred</div>
                </li>
                <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-icon mdui-icon material-icons">send</i>
                <div class="mdui-list-item-content">Sent mail</div>
                </li>
                <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-icon mdui-icon material-icons">drafts</i>
                <div class="mdui-list-item-content">Drafts</div>
                </li>
                <li class="mdui-subheader">Subheader</li>
                <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-icon mdui-icon material-icons">email</i>
                <div class="mdui-list-item-content">All mail</div>
                </li>
                <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
                <div class="mdui-list-item-content">Trash</div>
                </li>
                <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-icon mdui-icon material-icons">error</i>
                <div class="mdui-list-item-content">Spam</div>
                </li>
            </ul>
        </mdui-drawer>
    </div>
</template>

<script>
import mdui from 'mdui'
import MduiDrawer from '../../components/ui/MduiDrawer.vue'
export default {
    components: { MduiDrawer },
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