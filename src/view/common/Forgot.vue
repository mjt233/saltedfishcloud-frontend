<template>
  <container :loading="loading">
    <mdui-card :size="'mini'" :layout="'center'">
        <div class="mdui-typo" style="padding: 0 16px">
            <h5>找回账号</h5>
            <mdui-row v-show="step == 0">
                <mdui-input v-model="account" :placeholder="'请输入用户名或邮箱'"></mdui-input>
            <mdui-btn accent style="width: 100%" @click="goStep(1)">下一步</mdui-btn>
            </mdui-row>
            <mdui-row v-show="step == 1" style="width: 100%;margin: 0 auto;">
                <div class="input-btn-group">
                    <div style="flex: 1">
                        <mdui-input style="display: block" v-model="code" :placeholder="'请输入验证码'"></mdui-input>
                    </div>
                    <div>
                        <!-- 重新发送按钮 -->
                        <mdui-btn @click="sendCode" :themeColor="false" :disabled="disableBtn">{{btnText}}</mdui-btn>
                    </div>
                </div>
                <div>
                    <mdui-input type="password" v-model="password" :placeholder="'新密码'"></mdui-input>
                    <mdui-input type="password" v-model="confirm" :placeholder="'确认密码'"></mdui-input>
                </div>
                <mdui-btn accent style="width: 100%" @click="resetPassword">重置密码</mdui-btn>
            </mdui-row>
        </div>
    </mdui-card>
  </container>
</template>

<script>
import MduiInput from '@/components/ui/MduiInput.vue'
import MduiCard from '@/components/ui/MduiCard.vue'
import MduiBtn from '@/components/ui/MduiBtn.vue'
import mdui from 'mdui'
import API from '@/api'
export default {
    components: { MduiInput, MduiCard, MduiBtn },
    name: 'forgot',
    data() {
        return {
            account: '',
            code: '',
            loading: false,
            step: 0,
            btnText: '重新发送',
            disableBtn: false,
            password: '',
            confirm: '',
            itv: null
        }
    },
    destroyed() {
        clearInterval(this.ivt)
    },
    methods: {
        commonErrorCallback(err) {
            this.loading = false
            mdui.alert(err.toString())
        },
        async goStep(step) {
            if (step == 1) {
                mdui.confirm('将向该账号绑定的邮箱发送验证码，是否继续？', async() => {
                    this.loading = true
                    await this.sendCode()
                    this.step++
                })
            }
        },
        delaySend() {
            this.disableBtn = true
            let t = 60
            this.ivt = setInterval(() => {
                t = t - 1
                if (t == 0) {
                    this.btnText = '重新发送'
                    this.disableBtn = false
                    clearInterval(this.ivt)
                } else {
                    this.btnText = t
                }
            }, 1000)
        },
        async sendCode() {
            try {
                this.delaySend()
                await this.axios(API.user.sendResetPasswordEmail(this.account))
                this.loading = false
            } catch (err) {
                this.commonErrorCallback(err)
                throw err
            }
        },
        async resetPassword() {
            if (this.confirm != this.password) {
                mdui.alert('两个密码不一致')
                return
            } else if (this.password.length < 6) {
                mdui.alert('新密码太短，不得少于6位')
                return
            }

            this.loading = true
            this.axios(API.user.resetPassword(this.account, this.code, this.password)).then(e => {
                this.loading = false
                mdui.alert('重置成功！即将转跳至登录', () => {
                    setTimeout(() => {
                        this.$router.push('/login')
                    }, 300)
                })
            }).catch(this.commonErrorCallback)
        }
    }
}
</script>

<style>

</style>

<style lang="less" scoped>
.input-btn-group {
    display: flex;
    align-items: center;
}
</style>
