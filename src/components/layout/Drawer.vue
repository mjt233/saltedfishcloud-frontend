<template>
    <div class="mdui-drawer mdui-color-white" id="drawer">
      <div class="mdui-grid-tile">
        <a href="javascript:;"><img src="@/assets/img/bg/bg2.jpg" /></a>
        <div class="mdui-grid-tile-actions">
          <div class="mdui-grid-tile-text">
            <div v-if="userInfo === null" class="mdui-grid-tile-title">
              欢迎您，游客
            </div>
            <div v-else class="mdui-grid-tile-title">
              欢迎您，{{ userInfo.user }}
            </div>
          </div>
        </div>
      </div>
      <ul class="mdui-list" ref="drawerList">
        <div class="side-bar"  :style="sideBarStyle">
            <div class="side mdui-color-theme"></div>
            <div class="bar mdui-color-theme"></div>
        </div>
        <router-link to="/public">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300">folder</i>
            <div class="mdui-list-item-content">公共网盘</div>
          </li>
        </router-link>
        <router-link to="/private">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe897;</i
            >
            <div class="mdui-list-item-content">私人网盘</div>
          </li>
        </router-link>
        <router-link to="/login" v-show="!userInfo">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">去登录</div>
          </li>
        </router-link>
        <router-link v-show="userInfo" to="/my">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">个人中心</div>
          </li>
        </router-link>
        <a v-show="userInfo">
          <li class="mdui-list-item" @click="exit">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe879;</i
            >
            <div class="mdui-list-item-content">退出登录</div>
          </li>
        </a>
        <router-link v-show="!userInfo" to="/reg">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">用户注册</div>
          </li>
        </router-link>
      </ul>
      <div class="bottom-menu" v-if="userInfo && userInfo.type == 1">
        <a href="javascript:;" @click="toAdmin">管理员后台</a>
      </div>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'Drawer',
    computed: {
        userInfo() {
            return this.$store.getters.userInfo
        }
    },
    data() {
        return {
            drawer: null,
            sideBarStyle: {
                '--item-height': 0,
                '--item-top': 0
            }
        }
    },
    mounted() {
        this.drawer = new mdui.Drawer('#drawer')
        this.updateMenuSideBar()
    },
    methods: {
        toAdmin() {
            this.closeDrawer()
            this.$router.push('/admin/overview')
        },
        closeDrawer() {
            if (document.documentElement.offsetWidth < 1024) {
                this.drawer.close()
            }
        },
        getDrawerInst() {
            return this.drawer
        },
        exit() {
            this.$emit('exit')
        },
        setMenuSideBar(top, height) {
        },
        updateMenuSideBar() {
            const path = this.$route.path
            const links = this.$refs.drawerList.querySelectorAll('a')
            for (const a of links) {
                let link = a.getAttribute('href')
                if (link) {
                    link = link.substring(1)
                }
                if (path.startsWith(link)) {
                    const item = a.querySelector('li')
                    this.sideBarStyle['--item-top'] = item.offsetTop + 'px'
                    this.sideBarStyle['--item-height'] = item.clientHeight + 'px'
                    return
                }
            }
            this.sideBarStyle['--item-top'] = 0 + 'px'
            this.sideBarStyle['--item-height'] = 0 + 'px'
        }
    },
    watch: {
        async $route() {
            await this.$nextTick()
            this.updateMenuSideBar()
        }
    }
}
</script>

<style lang="less" scoped>
@import './drawerMenu.css';
</style>
