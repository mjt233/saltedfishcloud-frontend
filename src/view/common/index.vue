<template>
  <div ref="root">
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
      <ul class="mdui-list">
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
        <router-link to="/login" v-if="userInfo === null">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">去登录</div>
          </li>
        </router-link>
        <router-link v-else to="/my">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">个人中心</div>
          </li>
        </router-link>
        <a v-if="userInfo !== null">
          <li class="mdui-list-item" @click="exit">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe879;</i
            >
            <div class="mdui-list-item-content">退出登录</div>
          </li>
        </a>
        <router-link v-else to="/reg">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons mdui-color-theme-300"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">用户注册</div>
          </li>
        </router-link>
      </ul>
    </div>
    <sf-header ref="header" />
    <transition on name="route-switch" mode="out-in">
      <router-view />
    </transition>
    <file-upload-dialog></file-upload-dialog>
  </div>
</template>

<script>
import mdui from "mdui"
import SfHeader from "../../components/layout/SfHeader.vue"
import FileQueue from '../../global/FileQueue'
import FileUploadDialog from '../../components/FileUploadDialog.vue'
import Store from '../../Store'
import API from '../../api/API'
export default {
  name: 'index',
  components: {
    FileUploadDialog,
    SfHeader
  },
  data() {
    return {
      drawer: null,
      FileQueue: FileQueue.queue
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo
    }
  },
  created() {
    window.addEventListener("resize", this.setAppHeight)
  },
  destroyed() {
    window.removeEventListener('resize', this.setAppHeight)
  },
  mounted() {
    this.drawer = new mdui.Drawer('#drawer')
    this.header = document.querySelector("header")
    this.$store.commit('setDrawer', this.drawer)
    this.setAppHeight()
    if (this.$route.params['close']) {
        this.drawer.close()
    }
  },
  methods: {
    setAppHeight() {
      let h = document.documentElement.clientHeight - this.header.offsetHeight + "px"
      this.$refs.root.style.minHeight = h
      this.$refs.root.style.height = h
    },
    closeDrawer() {
      if (document.documentElement.offsetWidth < 1024) {
        this.drawer.close()
      }
    },
    exit() {
      localStorage.clear()
      Store.commit('setToken', null)
      Store.commit('setAvatarURL', API.getServer() + '/api/' + API.user.getAvatar().url)
      mdui.snackbar('退出成功')
      if (this.$route.name == 'privateDisk' || this.$route.name == 'my') {
        this.$router.push('/login')
      }
      if (document.documentElement.clientWidth < 1024) {
        this.drawer.close()
      }
    },
  }
}
</script>

<style>

</style>