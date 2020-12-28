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
      </ul>
    </div>
    <sf-header ref="header" />
    <transition on name="route-switch" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import mdui from "mdui";
import SfHeader from "./components/SfHeader.vue";
export default {
  components: { SfHeader },
  name: "App",
  data() {
    return {
      drawer: null,
      userInfo: null,
    };
  },
  mounted() {
    this.drawer = this.$refs.header.drawer;
    this.header = document.querySelector("header");
    this.setAppHeight();
    window.addEventListener("resize", this.setAppHeight);
    this.$eventBus.$on("login", (e) => {
      this.setUserInfo(e);
    });
    this.$axios.post("User/getUserInfo",{},{noDefaultAction:true}).then((e) => {
      this.setUserInfo(e.data.data);
      mdui.snackbar(`欢迎回来，${e.data.data.user}`, {position: 'bottom'})
    });
  },
  methods: {
    closeDrawer() {
      if (document.documentElement.offsetWidth < 1024) {
        this.drawer.close();
      }
    },
    setAppHeight() {
      let h = document.documentElement.clientHeight - this.header.offsetHeight + "px"
      this.$refs.app.style.minHeight = h
      this.$refs.app.style.height = h
    },
    setUserInfo(info) {
      this.Global.userInfo = info
      this.userInfo = info
      this.$refs.header.$data.userInfo = info
    },
    exit() {
      this.setUserInfo(null)
      localStorage.clear()
      this.Global.userInfo = null
      this.$axios.get("logout").then(() => {
        mdui.alert("退出成功", () => {
          setTimeout(() => {
            this.drawer.close();
            this.$router.push("/login");
          }, 100);
        });
      });
    },
  },
};
</script>

<style>
.route-switch-enter-active,
.route-switch-leave-active {
  transition: all 0.1s;
  /* // position: fixed; */
  position: relative;
  left: 0;
  right: 0;
}
.route-switch-enter {
  transform: scale(0.98);
  /* // transform: translateX(50px); */
  /* opacity: 0; */
}
.route-switch-leave-to {
  /* // transform: translateX(-50px); */
  transform: scale(0.98);
  /* opacity: 0; */
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
