<template>
    <container fill class="mdui-typo" :loading="loading">
        <div class="mdui-container">
            <mdui-card>
                <h3>系统常规设置</h3>
                <div class=" mdui-col-xs-8">
                    <div class=" mdui-table-fluid">
                        <table class=" mdui-table">
                            <tbody>
                                <tr>
                                    <td>注册邀请码</td>
                                    <td>{{settings.invite_reg_code}} <i @click="editRegCode" style="font-size:16px; cursor: pointer;user-select: none;" class="mdui-icon material-icons">edit</i></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <br>
                <br>
                <br>
            </mdui-card>
        </div>
    </container>
</template>

<script>
import mdui from 'mdui'
import API from '../../api/API'
import Container from '../../components/layout/Container.vue'
import MduiBtn from '../../components/ui/MduiBtn.vue'
import MduiCard from '../../components/ui/MduiCard.vue'
import MduiInput from '../../components/ui/MduiInput.vue'
export default {
  components: { Container, MduiCard, MduiBtn, MduiInput },
    data() {
        return {
            settings: {
                invite_reg_code: ''
            },
            loading: false,
            mode: {
                edit_reg_code: false
            }
        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        async loadData() {
            this.loading = true
            let data = (await this.$axios(API.admin.sys.getSysSettings())).data.data
            this.settings = data
            this.loading = false
        },
        editRegCode() {
            mdui.prompt('注册邀请码', '修改注册邀请码', e => {
                this.loading = true
                this.$axios(API.admin.sys.setInviteRegCode(e)).then(() => {
                    this.loading = false
                    mdui.snackbar('修改成功')
                    this.settings.invite_reg_code = e
                }).catch(() => this.loading = false)
            }, () => {}, {defaultValue: this.settings.invite_reg_code})
        }
    }
}
</script>

<style>

</style>