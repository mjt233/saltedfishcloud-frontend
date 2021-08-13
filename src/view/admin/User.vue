<template>
    <container :loading="loading" class="mdui-typo">
        <div class="mdui-container">
            <mdui-card>
                <h3 class="mdui-text-color-theme">用户列表</h3>
                <div>
                    <span>用户总数：{{users.total}}，共{{users.pages}}页</span>
                    <pager @change="loadUser" :pageCount="users.pages"></pager>
                </div>
                <div class="mdui-table-fluid">
                    <table class="mdui-table mdui-table-hoverable" style="min-width: 600px;">
                        <thead>
                            <tr>
                                <td style="width: 120px">#</td>
                                <td style="width: 120px">用户名</td>
                                <td style="width: 120px">空间配额</td>
                                <td>操作</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users.list" :key="user.id">
                                <td>{{user.id}}</td>
                                <td>{{user.user}}</td>
                                <td>{{user.quota}}GiB</td>
                                <td>
                                    <button v-if="user.type == 0"  @click="setAdmin(user, true)" class="mdui-btn mdui-btn-dense mdui-color-theme">授予管理</button>
                                    <button v-else  @click="setAdmin(user, false)" class="mdui-btn mdui-btn-dense mdui-color-pink-300 mdui-text-color-white">撤销管理</button>
                                    <button class="mdui-btn mdui-btn-dense mdui-color-theme" @click="openDialog(user)">重置密码</button>
                                    <!-- <mdui-checkbox label="管理员" :checked="user.type == 1" @change="setAdmin(user, $event)"></mdui-checkbox> -->
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </mdui-card>
            <mdui-dialog ref="dialog" :title="'重置密码'" @confirm='resetPasswd' @close='close'>
                <div class="mdui-container">
                    <mdui-input :floatLabel="false" :error="passwd.error1" :errorMsg="passwd.errorMsg1" v-model="passwd.old" :placeholder="'新密码'" type="password"></mdui-input>
                    <mdui-input :floatLabel="false" :error="passwd.error2" :errorMsg="passwd.errorMsg2" v-model="passwd.new" :placeholder="'确认密码'" type="password"></mdui-input>
                </div>
            </mdui-dialog>
        </div>
    </container>
</template>

<script>
import mdui from 'mdui'
import API from '../../api/API'
import Container from '../../components/layout/Container.vue'
import MduiCard from '../../components/ui/MduiCard.vue'
import Pager from '../../components/ui/pager.vue'
import MduiDialog from '../../components/ui/MduiDialog.vue'
import MduiInput from '../../components/ui/MduiInput.vue'
export default {
    components: { Container, MduiCard, Pager, MduiDialog, MduiInput },
    data() {
        return {
            loading: false,
            users: {
                pages: 0,
                list: [],
                total: 0
            },
            dialog: null,
            passwd: {
                old: '',
                new: '',
                error1: false,
                error2: false,
                errorMsg1: '',
                errorMsg2: '',
                user: null
            }
        }
    },
    mounted() {
        this.loadUser()
        this.dialog = new mdui.Dialog(this.$refs.dialog.$el)
    },
    methods: {
        async loadUser(page = 1) {
            this.loading = true
            try {
                const data = (await this.$axios(API.user.getUserList(page))).data.data
                this.users = data
            } catch (e) {
                mdui.alert(e.msg)
            } finally {
                this.loading = false
            }
        },
        setAdmin(user, isAdmin) {
            this.loading = true
            this.$axios(API.user.setUserType(user.id, isAdmin)).then(e => {
                this.loading = false
                if (isAdmin) {
                    mdui.snackbar(`成功设置${user.user}为管理员`)
                    user.type = 1
                } else {
                    mdui.snackbar(`已撤销${user.user}的管理员权限`)
                    user.type = 0
                }
            }).catch(err => {
                this.loading = false
                mdui.alert(err.msg)
            })
        },
        openDialog(e) {
            this.dialog.open()
            this.passwd.user = e
        },
        close() {
            this.passwd.old = this.passwd.new = ''
        },
        resetPasswd() {
            if (this.validForm()) {
                this.dialog.close()
                this.loading = true
                this.$axios(API.user.modifyPasswd(this.passwd.user.id, '', this.passwd.new, true)).then(() => {
                    this.loading = false
                    mdui.snackbar('重置成功')
                }).catch(e => {
                    this.loading = false
                    mdui.alert(e.msg)
                })
            } else {
                mdui.snackbar('输入有误')
            }
        },
        validForm() {
            if (this.passwd.new.length < 6 || this.passwd.old.length < 6) {
                this.passwd.error1 = true
                this.passwd.errorMsg1 = '密码不能少于6位'
                return false
            } else if (this.passwd.old != this.passwd.new) {
                this.passwd.error1 = this.passwd.error2 = true
                this.passwd.errorMsg1 = this.passwd.errorMsg2 = '两次密码不一致'
                return false
            } else {
                this.passwd.error1 = this.passwd.error2 = false
                return true
            }
        }
    }
}
</script>

<style>

</style>
