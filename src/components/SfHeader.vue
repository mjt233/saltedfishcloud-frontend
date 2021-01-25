<template>
  <header class="mdui-appbar mdui-appbar-fixed">
    <div class="mdui-toolbar mdui-color-indigo">
      <a @click="t" href="javascript:;" class="mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">menu</i></a>
      <span class="mdui-typo-title">咸鱼云网盘</span>
      <div class="mdui-toolbar-spacer"></div>
      <div v-if="userInfo != null">
        <img class="mdui-chip-icon" src="@/assets/img/bg/bg1.jpg"/>
        <span class="mdui-chip-title"></span>
      </div>
    </div>
  </header>
</template>

<script>
import mdui from 'mdui'
export default {
    name:'sf-header',
    data () {
      return {
        drawer: null,
      }
    },
    methods: {
      t() {
        this.drawer.toggle()
      }
    },
    mounted() {
      this.drawer = new mdui.Drawer('#drawer')
      this.drawer.close()
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      }
    }
}
</script>

<style scope>

</style>