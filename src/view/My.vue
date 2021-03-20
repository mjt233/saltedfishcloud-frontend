<template>
  <container v-if="userInfo" :loading="loading">
      <div class="mdui-container">
        <ul class="mdui-list">
          <!-- 头像显示 -->
          <li class="mdui-list-item mdui-ripple">
            <div class="mdui-list-item-content"><span>头像</span></div>
            <div class="mdui-list-item-avatar"> <img :src="avatarURL"></div>
          </li>
          <li class="mdui-divider"></li>
          <!-- 用户基本信息 -->
          <li class="mdui-list-item mdui-ripple">
            <div class="mdui-list-item-content"><span>用户ID</span></div>
            <div class="mdui-list-item-text">{{userInfo.id}}</div>
          </li>
          <li class="mdui-list-item mdui-ripple">
            <div class="mdui-list-item-content"><span>用户名</span></div>
            <div class="mdui-list-item-text">{{userInfo.user}}</div>
          </li>
          <li class="mdui-list-item mdui-ripple">
            <div class="mdui-list-item-content"><span>身份</span></div>
            <div class="mdui-list-item-text">{{userInfo.type == 1 ? '管理员' : '普通用户'}}</div>
          </li>
          <li class="mdui-divider"></li>
          <!-- 配额情况 -->
          <li class="mdui-list-item">
            <div class="mdui-list-item-content"><span>存储使用情况</span></div>
            <div class="mdui-list-item-text"><span>
              <span>{{quota.used | formatSize}}/{{quota.quota | formatSize}}</span>
              <br>
              <progress :max="quota.quota" :value="quota.used"></progress>
              </span></div>
          </li>
        </ul>
      </div>
  </container>
  <container v-else>
    <h3>未登录，请先登录</h3>
  </container>
</template>

<script>
import apiConfig from '../api/apiConfig'
import Container from '../components/Container.vue'
export default {
  components: { Container },
  data() {
    return {
      quota: {
        used: 0,
        quota: 0
      },
      loading: false
    }
  },
  computed: {
    avatarURL() {
      if (this.userInfo) {
        return '/api/' + apiConfig.user.getAvatar(this.userInfo.user).url
      } else {
        return '/api/static/static/defaultAvatar.png'
      }
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
    avaliable() {
      return this.quota.quota - this.quota.used
    },
  },
  filters: {
    fixed(input) {
      return input.toFixed(2)
    }
  },
  mounted() {
    if (!this.userInfo) return
    this.$axios(apiConfig.user.getQuotaUsed()).then(e => {
      this.quota = e.data.data
    })
  }
}
</script>

<style>

</style>