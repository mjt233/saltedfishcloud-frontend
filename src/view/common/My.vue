<template>
  <container v-if="userInfo" :loading="loading">
      <div class="mdui-container">
        <mdui-dialog @confirm='confirm' id="dialog" :title="'修改密码'" :loading="mp.loading">
          <div class="mdui-textfield mdui-textfield-floating-label">
            <label class="mdui-textfield-label">旧密码</label>
            <input class="mdui-textfield-input" v-model="mp.op" type="password"/>
          </div>
          <div class="mdui-textfield mdui-textfield-floating-label">
            <label class="mdui-textfield-label">新密码</label>
            <input class="mdui-textfield-input" v-model="mp.np"  type="password"/>
          </div>
          <div class="mdui-textfield mdui-textfield-floating-label">
            <label class="mdui-textfield-label">确认密码</label>
            <input class="mdui-textfield-input" @keydown.enter="confirm"  v-model="mp.cp" type="password"/>
          </div>
        </mdui-dialog>
        <ul class="mdui-list">
          <!-- 头像显示 -->
          <li class="mdui-list-item mdui-ripple">
            <div class="mdui-list-item-content"><span>头像</span></div>
            <div class="mdui-list-item-avatar" @click="uploadAvatar"> <img ref="img" :src="avatarURL"></div>
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
          <li class="mdui-list-item mdui-ripple" @click="openDialog">
            <div class="mdui-list-item-content"><span>修改密码</span></div>
          </li>
          <li class="mdui-divider"></li>
          <!-- 配额情况 -->
          <li class="mdui-list-item mdui-ripple">
            <div class="mdui-list-item-content"><span>存储使用情况</span></div>
            <div class="mdui-list-item-text"><span>
              <span>{{quota.used | formatSize}}/{{quota.quota | formatSize}}</span>
              <br>
              <progress :max="quota.quota" :value="quota.used"></progress>
              </span></div>
          </li>
          <li class="mdui-divider"></li>
          <li class="mdui-list-item mdui-ripple" @click="changeTheme">
            <div class="mdui-list-item-content">
              <div class="mdui-list-item-title">主题色</div>
              <div class="mdui-list-item-text">默认（点击更改）</div>
            </div>
          </li>
        </ul>
        <mdui-dialog ref="theme" title="选择一个颜色主题" @confirm='themeConfirm'>
          <mdui-btn :themeColor="false" class="mdui-color-pink mdui-text-color-white" @click="setTheme('pink')">少女粉</mdui-btn>
          <mdui-btn :themeColor="false" class="mdui-color-indigo mdui-text-color-white" @click="setTheme('indigo')">经典蓝</mdui-btn>
          <mdui-btn :themeColor="false" class="mdui-color-deep-purple mdui-text-color-white" @click="setTheme('deep-purple')">基佬紫</mdui-btn>
          <mdui-btn :themeColor="false" class="mdui-color-deep-orange mdui-text-color-white" @click="setTheme('deep-orange')">加菲橘</mdui-btn>
          <mdui-btn :themeColor="false" class="mdui-color-amber" @click="setTheme('amber')">咸蛋黄</mdui-btn>
        </mdui-dialog>
      </div>
  </container>
  <container v-else>
    <h3>未登录，请先登录</h3>
  </container>
</template>

<script>
import mdui from 'mdui'
import apiConfig from '../../api/API'
import Container from '../../components/layout/Container.vue'
import FileUtils from '../../utils/FileUtils'
import MduiDialog from '../../components/ui/MduiDialog.vue'
import Theme from '../../utils/Theme'
import MduiBtn from '../../components/ui/MduiBtn.vue'
export default {
  components: { Container, MduiDialog, MduiBtn },
  data() {
    return {
      quota: {
        used: 0,
        quota: 0
      },
      loading: false,
      dialog: {
        mp: null,
        theme: null
      },
      mp: {
        op: '',
        np: '',
        cp: '',
        loading: false
      }
    }
  },
  computed: {
    avatarURL() {
      return this.$store.state.avatarURL
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
    this.dialog.mp = new mdui.Dialog('#dialog', {closeOnConfirm: false, modal: true})
    document.querySelector('#dialog').addEventListener('confirm.mdui.dialog', this.confirm)
    document.querySelector('#dialog').addEventListener('cancel.mdui.dialog', () => {
      this.mp.op = this.mp.np = this.mp.cp = ''
    })
    this.dialog.theme = new mdui.Dialog(this.$refs.theme.$el)
  },
  methods: {
    /**
     * 修改密码点击确定
     */
    confirm() {
      let openAlert = (text) => {
        this.dialog.mp.close()
        mdui.alert(text, () => {
          this.openDialog()
        })
      }
      let reset = () => {
        this.mp.op = this.mp.np = this.mp.cp = ''
        this.loading = false
      }
      if (this.mp.cp != this.mp.np) {
        openAlert('新密码与确认密码不一致')
        return
      } else if (this.mp.cp.length < 6 || this.mp.op.length < 6) {
        openAlert('密码太短（少于6个字符）')
        return
      }
      this.loading = true
      let conf = apiConfig.user.modifyPasswd(this.userInfo.id ,this.mp.op, this.mp.np)
      this.$axios(conf).then(_ => {
        reset()
        mdui.snackbar('修改成功', {position: 'bottom'})
        this.dialog.mp.close()
      }).catch(e => {
        reset()
        openAlert(e.msg)
      })
    },
    /**
     * 打开修改密码对话框
     */
    openDialog() {
      this.dialog.mp.open()
    },
    /**
     * 上传用户头像
     */
    uploadAvatar() {
      FileUtils.openFileDialog().then(e => {
        let file = e.item(0)
        if (file.size > 1024*1024*3) {
          mdui.snackbar('文件大于3MiB', {position: 'top'})
          return
        }
        let conf = apiConfig.user.uploadAvatar(file)
        this.loading = true
        this.$axios(conf).then(e => {
          mdui.snackbar('上传成功')
          
          // 更新图片显示
          this.$store.commit('setAvatarURL', this.avatarURL + '?' + Math.random() )
          this.loading = false
        }).catch(e => {
          this.loading = false
          mdui.snackbar('上传失败：' + e.msg)
        })
      })
    },
    changeTheme() {
      this.dialog.theme.open()
    },
    setTheme(theme) {
      Theme.switchTheme(theme)
    },
    themeConfirm() {
      this.dialog.theme.close()
    }
  }
}
</script>

<style>

</style>