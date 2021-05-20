<template>
    <container fill :loading="loading" class="mdui-typo">
        <div class="mdui-container">
            <mdui-card>
                <h3>用户列表</h3>
                <div>
                    <span>用户总数：{{users.total}}，共{{users.pages}}页</span>
                    <pager @change="loadUser" :pageCount="users.pages"></pager>
                </div>
                <div class="mdui-table-fluid">
                    <table class="mdui-table mdui-table-hoverable">
                        <thead>
                            <tr>
                                <td style="width: 120px">#</td>
                                <td style="width: 120px">用户名</td>
                                <td style="width: 120px">空间配额</td>
                                <td>设为管理员</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users.list" :key="user.id">
                                <td>{{user.id}}</td>
                                <td>{{user.user}}</td>
                                <td>{{user.quota}}GiB</td>
                                <td><mdui-checkbox :checked="user.type == 1" @change="setAdmin(user, $event)"></mdui-checkbox></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </mdui-card>
        </div>
    </container>
</template>

<script>
import mdui from 'mdui'
import API from '../../api/API'
import Container from '../../components/layout/Container.vue'
import MduiCard from '../../components/ui/MduiCard.vue'
import MduiList from '../../components/ui/MduiList.vue'
import MduiListItem from '../../components/ui/MduiListItem.vue'
import MduiCheckbox from '../../components/ui/MduiCheckbox.vue'
import Pager from '../../components/ui/pager.vue'
export default {
    components: { Container, MduiCard, MduiList, MduiListItem, MduiCheckbox, Pager },
    data() {
        return {
            loading: false,
            users: {
                pages: 0,
                list: [],
                total: 0
            }
        }
    },
    mounted() {
        this.loadUser()
    },
    methods: {
        async loadUser(page = 1) {
            this.loading = true
            try {
                let data = (await this.$axios(API.user.getUserList(page))).data.data
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
                } else {
                    mdui.snackbar(`已撤销${user.user}的管理员权限`)
                }
            })
        }
    }
}
</script>

<style>

</style>