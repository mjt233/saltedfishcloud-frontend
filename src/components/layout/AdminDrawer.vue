<template>
    <mdui-drawer class="mdui-color-white" ref="drawer">
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
        <div class="bottom-menu">
            <a href="javascript:;" @click="toCommon">用户前台</a>
        </div>
    </mdui-drawer>
</template>

<script>
import MduiDrawer from '../ui/MduiDrawer.vue'
import MduiList from '../ui/MduiList.vue'
import MduiListItem from '../ui/MduiListItem.vue'
import MduiSubList from '../ui/MduiSubList.vue'
export default {
    components: { MduiList, MduiListItem, MduiSubList, MduiDrawer },
    name: 'adminDrawer',
    props: {
        menu: {
            /**
             * 菜单数据数组，样例：
                { name: '用户管理', icon: 'people', to: '/admin/user' },
                { name: '系统设置', icon: 'settings_applications', children: [
                    { name: '常规设置', to: '/admin/sys' },
                    { name: '存储设置', to: '/admin/store' },
                    { name: '安全选项', to: '/admin/safe' }
                ]}
             */
            type: Array,
            default: () => {
                return []
            }
        }
    },
    data() {
        return {
            drawer: null
        }
    },
    mounted() {
        this.drawer = this.$refs.drawer
    },
    computed: {
        routePath() {
            return this.$route.path
        }
    },
    methods: {
        toCommon() {
            this.$refs.drawer.tryClose()
            this.$router.push('/public')
        },
        close() {
            this.drawer.tryClose()
        },
        toggle() {
            this.drawer.toggle()
        },
        open() {
            this.drawer.open()
        }
    }
}
</script>

<style scoped>
@import './drawerMenu.css';
</style>
