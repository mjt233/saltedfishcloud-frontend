<template>
  <container :loading="loading">
    <mdui-card :avatar="defaultLoginLogo" :layout="'center'" :size="'mini'" :subtitle="'开启云存储之旅'" :title="'账号登录'">
      <form class="login-panel" ref="form">
        <div class="item">
          <div class="mdui-textfield mdui-textfield-floating-label input">
            <label class="mdui-textfield-label">用户名</label>
            <input v-model="form.user" :disabled="loading" class="mdui-textfield-input" type="text" required/>
            <div class="mdui-textfield-error">用户名不能为空</div>
          </div>
          <router-link to="/reg" tabindex="-1" href="javascript:;" @click="tips" class="link">去注册</router-link>
        </div>
        <div class="item">
          <div class="mdui-textfield mdui-textfield-floating-label input">
            <label class="mdui-textfield-label">密码</label>
            <input ref="passwd" autocomplete="1" v-model="form.passwd" class="mdui-textfield-input" type="password" pattern="^.*(?=.{6,}).*$" required/>
            <div class="mdui-textfield-error">密码至少 6 位</div>
          </div>
          <a tabindex="-1" href="javascript:;" @click="tips"  class="link">忘记密码?</a>
        </div>
        <button ref="btn" :disabled="loading" @click="login" class="mdui-btn mdui-color-theme-accent mdui-ripple">登录</button>
      </form>
    </mdui-card>
  </container>
</template>

<script>
import mdui from 'mdui'
import Container from '../../components/layout/Container.vue'
import apiConfig from '../../api/API'
import MduiCard from '../../components/ui/MduiCard.vue'
export default {
  components: { Container, MduiCard },
  data() {
    return {
      form: {
        user:'',
        passwd:''
      },
      loading:false
    }
  },
  computed: {
    defaultLoginLogo() {
      return `${apiConfig.getServer()}/api/${apiConfig.user.getAvatar().url}`
    }
  },
  methods: {
    async login(e) {
      this.$refs.passwd.blur()
      let elems = this.$refs.form.querySelectorAll(".mdui-textfield-invalid-html5")
      if (elems.length !== 0 || this.form.user == '' || this.form.passwd == '') {
        mdui.alert('有输入的数据不符合要求，请重新检查')
        return
      }
      this.loading = true
      let conf = apiConfig.user.login(this.form.user, this.form.passwd)
      try {
        let token = (await this.$axios(conf)).data.data
        this.$store.commit('setToken', token)
        this.$store.commit('setAvatarURL', `${apiConfig.getServer()}/api/${apiConfig.user.getAvatar(this.form.user).url}`)
        localStorage.setItem('token', token)
        mdui.snackbar('登录成功')
        this.$router.push('/private')
      } catch (error) {
        
      }
      this.loading = false
    },
    tips() {
      mdui.alert('暂未开放该功能')
    }
  }
}
</script>

<style lang="less" scoped>
.login-panel {
  margin: 0 auto;
  max-width: 480px;
  >.item {
    display: flex;
    align-items: center;
    >*{
      flex-shrink: 0;
      flex-basis: 0;
    }
    >.input {
      flex-grow: 4;
      padding: 24px 0;
    }
    >.link {
      flex-grow: 1;
      font-size: 14px;
      padding-top: 20px;
      padding-left: 10px;
      outline: none;
    }
  }
  
}
</style>