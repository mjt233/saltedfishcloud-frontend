<template>
  <div id="app" ref="app">
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
            <i class="mdui-list-item-avatar mdui-icon material-icons">folder</i>
            <div class="mdui-list-item-content">公共网盘</div>
          </li>
        </router-link>
        <router-link to="/private">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons"
              >&#xe897;</i
            >
            <div class="mdui-list-item-content">私人网盘</div>
          </li>
        </router-link>
        <router-link to="/login" v-if="userInfo === null">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">去登录</div>
          </li>
        </router-link>
        <router-link v-else to="/my">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons"
              >&#xe7fd;</i
            >
            <div class="mdui-list-item-content">个人中心</div>
          </li>
        </router-link>
        <a v-if="userInfo !== null">
          <li class="mdui-list-item" @click="exit">
            <i class="mdui-list-item-avatar mdui-icon material-icons"
              >&#xe879;</i
            >
            <div class="mdui-list-item-content">退出登录</div>
          </li>
        </a>
        <router-link v-else to="/reg">
          <li class="mdui-list-item" @click="closeDrawer">
            <i class="mdui-list-item-avatar mdui-icon material-icons"
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
import mdui from "mdui";
import SfHeader from "./components/SfHeader.vue"
import FileQueue from './global/FileQueue'
import FileUploadDialog from './components/FileUploadDialog.vue'
import Store from './Store'
export default {
  components: { SfHeader, FileUploadDialog },
  name: "App",
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
  mounted() {
    this.drawer = new mdui.Drawer('#drawer')
    this.header = document.querySelector("header")
    this.$store.commit('setDrawer', this.drawer)
    this.setAppHeight();
    document.querySelector('#first-load').classList.add('hid')
  },
  methods: {
    closeDrawer() {
      if (document.documentElement.offsetWidth < 1024) {
        this.drawer.close()
      }
    },
    setAppHeight() {
      let h = document.documentElement.clientHeight - this.header.offsetHeight + "px"
      this.$refs.app.style.minHeight = h
      this.$refs.app.style.height = h
    },
    exit() {
      localStorage.clear()
      Store.commit('setToken', null)
      mdui.alert('退出成功')
    },
  }
}
</script>

<style>
.route-switch-enter-active {
  transition: all 0.1s ease-in;
}
.route-switch-leave-active {
  transition: all 0.1s ease-out;
}
.route-switch-enter,
.route-switch-leave-to {
  transform: rotateY(10deg);
  opacity: .9;
}

body {
  background: url("~@/assets/img/bg/bg1.jpg") no-repeat fixed center;
  background-size: cover;
  margin: 0;
  padding: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: auto;
}
a {
  text-decoration: none;
}

*::-webkit-scrollbar {
  width: 5px;
}
*::-webkit-scrollbar-track {
  background: #f6f6f6;
  border-radius: 2px;
}
*::-webkit-scrollbar-thumb {
  background: #aaa;
  border-radius: 2px;
}
*::-webkit-scrollbar-thumb:hover {
  background: #747474;
  /* width: px;*/
}
*::-webkit-scrollbar-corner {
  background: #f6f6f6;
}
</style>
