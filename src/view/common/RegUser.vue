<template>
    <container :loading="loading">
        <mdui-card
            :layout="'center'"
            :size="'mini'"
            :title="'注册账号'"
            :subtitle="'咸鱼云通行证'"
            :avatar="defaultLogo"
        >
            <div v-if="!allowRegType.regcode && !allowRegType.email">
                <span style="color: red">注册通道已关闭</span>
            </div>
            <div v-else>
                <div class="mdui-tab mdui-tab-full-width" mdui-tab>
                    <a class="mdui-ripple" @click="allowRegType.regcode && setRegType(1)" :disabled="!allowRegType.regcode">邀请码</a>
                    <a class="mdui-ripple" @click="allowRegType.email && setRegType(2)" :disabled="!allowRegType.email">邮箱验证</a>
                </div>
                <form class="panel mdui-typo" ref="form">
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
                        <div class="mdui-textfield input" :class="{'mdui-textfield-invalid': errorFlag.email}">
                            <label class="mdui-textfield-label">Email（必填）</label>
                            <input
                                v-model="form.email"
                                class="mdui-textfield-input"
                                type="email"
                                placeholder="请输入邮箱"
                                required
                                @keyup="errorFlag.email = form.email.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/) == null"
                            />
                            <div class="mdui-textfield-error">请输入邮箱</div>
                        </div>
                        <mdui-btn type="button" v-if="regType == 2" dense accent @click="getEmailCode" :disabled="mailBtnInfo.disabled">{{mailBtnInfo.text}}</mdui-btn>
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
                        <label class="mdui-textfield-label">{{codeName}}（必填）</label>
                        <input
                            autocomplete="1"
                            v-model="form.regcode"
                            class="mdui-textfield-input"
                            :placeholder="'请输入' + codeName"
                            required
                        />
                        <div class="mdui-textfield-error">请输入{{codeName}}</div>
                    </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <mdui-btn type="button" @click="reg" accent dense>注册</mdui-btn>
                        <router-link to="/login">已有账号？(点我登录)</router-link>
                    </div>
                </form>
            </div>
        </mdui-card>
    </container>
</template>

<script>
import mdui from 'mdui'
import Container from '@/components/layout/Container.vue'
import apiConfig from '@/api'
import MduiCard from '@/components/ui/MduiCard.vue'
import MduiBtn from '@/components/ui/MduiBtn.vue'
export default {
    components: { Container, MduiCard, MduiBtn },
    data() {
        return {
            form: {
                user: '',
                passwd: '',
                confirm: '',
                regcode: '',
                email: ''
            },
            errorFlag: {
                user: false,
                passwd: false,
                confirm: false,
                regCode: false,
                email: false
            },
            mailBtnInfo: {
                text: '获取验证码',
                disabled: false
            },
            loading: false,
            codeName: '注册邀请码',
            regType: 1,
            allowRegType: {
                email: true,
                regcode: true
            }
        }
    },
    mounted() {
        this.loading = true
        this.axios(apiConfig.user.getRegType())
            .then(e => {
                this.allowRegType = e.data.data
                this.loading = false
                if (!this.allowRegType.regcode) {
                    this.setRegType(2)
                }
            }).catch(e => {
                this.loading = false
            })
    },
    computed: {
        defaultLogo() {
            return `${apiConfig.getServer()}/api/${apiConfig.user.getAvatar().url}`
        }
    },
    methods: {
        getEmailCode() {
            this.errorFlag.email = this.form.email.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/) == null
            if (this.errorFlag.email) {
                mdui.snackbar('邮箱地址格式不合法')
                return
            }
            this.loading = true
            this.axios(apiConfig.user.getEmailRegCode(this.form.email)).then(e => {
                mdui.snackbar(`验证码已发送到${this.form.email}`)
                this.mailBtnInfo.text = 60
                this.mailBtnInfo.disabled = true
                const itv = setInterval(() => {
                    this.mailBtnInfo.text--
                    if (this.mailBtnInfo.text == 0) {
                        clearInterval(itv)
                        this.mailBtnInfo.text = '获取验证码'
                        this.mailBtnInfo.disabled = false
                    }
                }, 1000)
                this.loading = false
            }).catch(e => {
                mdui.alert(e.toString())
                this.loading = false
            })
        },
        /**
         * 设置注册方式
         * @param {Number} mode 1 - 注册邀请码，2 - 邮箱注册
         */
        setRegType(mode) {
            this.regType = mode
            if (mode == 1) {
                this.codeName = '注册邀请码'
            } else {
                this.codeName = '邮箱验证码'
            }
        },
        validate() {
            this.errorFlag.user = this.form.user.length < 2
            this.errorFlag.passwd = this.form.passwd.length < 6
            this.errorFlag.confirm = this.form.passwd !== this.form.confirm
            this.errorFlag.regcode = this.form.regcode.length === 0
            this.errorFlag.email = this.form.email.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/) == null
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
            const conf = apiConfig.user.regUser()
            conf.data = this.form
            conf.data.validEmail = this.regType == 2
            this.$axios(conf).then(() => {
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
                const code = e.code
                switch (code) {
                case -4:
                    mdui.alert(`用户名 ${this.form.user} 已被注册，换一个吧~`)
                    break
                default:
                    mdui.alert(e.msg)
                    break
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
