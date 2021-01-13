<template>
    <container class="mdui-typo" :loading="loading">
        <p class="title">注册账号</p>
        <form class="panel" ref="form">
            <div class="item">
            <div class="mdui-textfield input" :class="{'mdui-textfield-invalid': errorFlag.user}">
                <label class="mdui-textfield-label">用户名（必填）</label>
                <input 
                    v-model="form.user"
                    :disabled="loading" 
                    class="mdui-textfield-input" 
                    type="text" 
                    placeholder="以后就用这个登录了噢~"
                    @keyup="errorFlag.user = form.user.length < 2"
                    required
                />
                <div class="mdui-textfield-error">用户名不能少于2个字符</div>
            </div>
            </div>
            <div class="item">
                <div class="mdui-textfield input">
                <label class="mdui-textfield-label">密码（必填）</label>
                <input
                    autocomplete="1"
                    v-model="form.passwd"
                    class="mdui-textfield-input"
                    type="password"
                    pattern="^.*(?=.{6,}).*$"
                    placeholder="请输入密码"
                    @keyup="errorFlag.confirm = form.passwd !== form.confirm"
                    required
                />
                <div class="mdui-textfield-error">密码至少 6 位</div>
            </div>
            </div>
            <div class="item">
            <div class="mdui-textfield input" :class="{'mdui-textfield-invalid': errorFlag.confirm}">
                <label class="mdui-textfield-label">确认密码（必填）</label>
                <input 
                    autocomplete="1" 
                    v-model="form.confirm" 
                    class="mdui-textfield-input" 
                    type="password"
                    placeholder="再输一次密码吧~"
                    required
                    @keyup="errorFlag.confirm = form.passwd !== form.confirm"
                />
                <div class="mdui-textfield-error">两次密码不一致</div>
            </div>
            </div>
            <div class="item">
            <div class="mdui-textfield input">
                <label class="mdui-textfield-label">注册邀请码（必填）</label>
                <input 
                    autocomplete="1" 
                    v-model="form.regcode" 
                    class="mdui-textfield-input"
                    placeholder="请输入注册邀请码"
                    required
                />
                <div class="mdui-textfield-error">请输入注册邀请码</div>
            </div>
            </div>
            <button ref="btn" class="mdui-btn mdui-color-theme-accent mdui-ripple" type="button" @click="reg">注册</button>
            <router-link to="/login">已有账号？(点我登录)</router-link>
        </form>
    </container>
</template>

<script>
import mdui from 'mdui'
import Container from '../components/Container.vue'
import Global from '../global/Global'
export default {
    components: { Container },
    data() {
        return {
            form: {
                user:'',
                passwd:'',
                confirm: '',
                regcode: ''
            },
            errorFlag: {
                user: false,
                passwd: false,
                confirm: false,
                regCode: false
            },
            loading:false
        }
    },
    methods: {
        validate() {
            this.errorFlag.user = this.form.user.length < 2
            this.errorFlag.passwd = this.form.passwd.length < 6
            this.errorFlag.confirm = this.form.passwd !== this.form.confirm
            this.errorFlag.regcode = this.form.regcode.length === 0
            for (const key in this.errorFlag) {
                if (Object.hasOwnProperty.call(this.errorFlag, key)) {
                    const el = this.errorFlag[key]
                    // 存在不通过的表项直接返回false
                    if (el) {
                        return false
                    }
                }
            }
            // 若全通过 返回true
            return true
        },
        reg() {
            if (!this.validate()) {
                mdui.alert('存在有问题的选项内容，请检查')
                return
            }
            this.loading = true
            this.$axios.post('regUser', this.form, {noDefaultAction:true}).then(() => {
                this.loading = false
                mdui.alert('注册成功', () => {
                    setTimeout(() => {
                        this.$router.push('/login')
                    }, 120)
                }, {
                    modal: true
                })
            }).catch(e => {
                this.loading = false
                let code = e.code
                switch (code) {
                    case -4:
                        mdui.alert(`用户名 ${this.form.user} 已被注册，换一个吧~`)
                        break;
                    default:
                        mdui.alert(e.msg)
                        break;
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.title {
    margin: 0;
    font-size: 20px;
    padding-top: 20px;
    text-align: center;
}
.panel {
    margin: 0 auto;
    max-width: 480px;
}
.input {
    padding-bottom: 26px;
}
</style>