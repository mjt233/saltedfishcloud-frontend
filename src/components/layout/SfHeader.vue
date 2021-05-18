<template>
  <header class="mdui-appbar mdui-appbar-fixed">
    <div class="mdui-toolbar mdui-color-indigo">
      <a @click="t" href="javascript:;" class="mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">menu</i></a>
      <span class="mdui-typo-title">咸鱼云网盘</span>
      <div class="mdui-toolbar-spacer"></div>
      <div v-if="userInfo != null">
        <router-link to="/my" style="color: white">
          <img class="mdui-chip-icon" :src="userAvatarURL" />
          <span class="mdui-chip-title">{{userInfo.user}}</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
export default {
    name:'sf-header',
    methods: {
      t() {
        this.drawer.toggle()
      }
    },
    mounted() {
    },
    computed: {
      userInfo() {
        return this.$store.getters.userInfo
      },
      drawer() {
        return this.$store.state.drawer
      },
      userAvatarURL() {
        return this.$store.state.avatarURL
      }
    }
}
</script>

<style scope>

</style>