<template>
    <container fill class="mdui-typo" :loading="loading">
        <div class="mdui-container">
            <mdui-card style="padding-bottom: 40px">
                <div class="mdui-col-md-6">
                    <h3 class="mdui-text-color-theme">系统常规设置</h3>
                    <div class="mdui-table-fluid">
                        <table class="mdui-table" v-if="settings">
                            <tbody>
                                <tr>
                                    <td>注册邀请码：{{settings.REG_CODE}} </td>
                                    <td><mdui-btn dense @click="setConfig('注册邀请码','修改注册邀请码', 'REG_CODE')">修改</mdui-btn></td>
                                </tr>
                                <tr>
                                    <td>同步延迟：{{settings.SYNC_DELAY}} 分</td>
                                    <td><mdui-btn dense @click="setConfig('同步延迟','修改同步延迟，单位为分钟', 'SYNC_DELAY')">修改</mdui-btn></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="mdui-col-md-6">
                    <h3 class="mdui-text-color-theme">存储设置</h3>
                    <div class="mdui-table-fluid">
                        <table class="mdui-table" v-if="settings">
                            <tbody>
                                <tr>
                                    <td>存储模式：{{settings.STORE_TYPE}} </td>
                                    <td><mdui-btn dense @click="switchStore">切换</mdui-btn></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
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
import MduiList from '../../components/ui/MduiList.vue'
import MduiListItem from '../../components/ui/MduiListItem.vue'
export default {
  components: { Container, MduiCard, MduiBtn, MduiInput, MduiList, MduiListItem },
    data() {
        return {
            settings: {
            },
            loading: false
        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        async loadData() {
            this.loading = true
            let data = (await this.$axios(API.admin.sys.getAllConfig())).data.data
            this.settings = data
            this.loading = false
        },
        setConfig(title, describe, key) {
            mdui.prompt(describe, title, e => {
                this.loading = true
                this.$axios(API.admin.sys.setConfig(key, e) ).then(() => {
                    this.loading = false
                    mdui.snackbar('修改成功')
                    this.settings[key] = e
                }).catch(() => this.loading = false)
            }, () => {}, {defaultValue: this.settings[key]})
        },
        switchStore() {
            let val = this.settings.STORE_TYPE == 'RAW' ? 'UNIQUE' : 'RAW'
            mdui.confirm(`即将切换到<strong class=" mdui-text-color-theme-a700">${val}</strong>模式<br>切换过程中会消耗大量服务器资源，可能需要耗费大量时间（取决于文件大小和数量，硬盘IO性能）<br>切换期间文件系统将被锁定，确定要继续吗？`, '警告', () => {
                this.loading = true
                let start = new Date().getSeconds()
                this.$axios(API.admin.sys.setConfig('STORE_TYPE', val)).then(e => {
                    mdui.alert('切换完成，耗时' + (new Date().getSeconds() - start) + '秒')
                    this.settings.STORE_TYPE = val
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            }, ()=>{}, {
                'confirmText': '已了解，确定继续',
                'cancelText': '取消'
            })
        }
    }
}
</script>

<style>

</style>