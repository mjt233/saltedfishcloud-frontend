<template>
    <div>
        <header class="mdui-appbar mdui-appbar-fixed">
            <div class="mdui-toolbar mdui-color-indigo">
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
        <mdui-drawer ref="drawer" class="mdui-color-white">
            <mdui-list>
                <template v-for="(item, index) in menu" >
                    <template  v-if="!item.children">
                        <router-link :to="item.to" :key="index">
                            <mdui-list-item :active="routePath == item.to" :icon="item.icon">{{item.name}}</mdui-list-item>
                        </router-link>
                    </template>
                    <template v-else>
                        <mdui-sub-list :title="item.name" :key="index" :icon="item.icon">
                            <router-link 
                                :to="subitem.to" 
                                v-for="(subitem, i) in item.children" 
                                :key="i">
                                <mdui-list-item
                                    :active="routePath == subitem.to">
                                    {{subitem.name}}
                                </mdui-list-item> 
                            </router-link>
                        </mdui-sub-list>
                    </template>
                </template>
            </mdui-list>
        </mdui-drawer>
        <router-view></router-view>
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
            drawer: null,
            menu: [
                { name: '系统总览', icon: 'pie_chart', to: '/admin/overview' },
                { name: '用户管理', icon: 'people', to: '/admin/user' },
                { name: '系统设置', icon: 'settings_applications', children: [
                    { name: '常规设置', to: '/admin/sys' },
                    { name: '存储设置', to: '/admin/store' },
                    { name: '安全选项', to: '/admin/safe' }
                ] },
                { name: '开发者调试', icon: 'developer_board', to: '/admin/dev' }
            ]
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
        if (this.$route.params['close']) {
            this.drawer.close()
        }
    },
    computed: {
        userInfo() {
            return this.$store.getters.userInfo
        },
        userAvatarURL() {
            return this.$store.state.avatarURL
        },
        routePath() {
            return this.$route.path
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