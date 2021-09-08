<template>
    <container class="mdui-typo" :loading="loading">
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
                                <tr>
                                    <td>文件信息同步</td>
                                    <td>
                                        <mdui-btn dense @click="sync(false)">仅公共</mdui-btn>
                                        <mdui-btn dense @click="sync(true)">所有用户</mdui-btn>
                                    </td>
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
import API from '../../api'
import Container from '../../components/layout/Container.vue'
import MduiBtn from '../../components/ui/MduiBtn.vue'
import MduiCard from '../../components/ui/MduiCard.vue'
export default {
    components: { Container, MduiCard, MduiBtn },
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
            const data = (await this.$axios(API.admin.sys.getAllConfig())).data.data
            this.settings = data
            this.loading = false
        },
        setConfig(title, describe, key) {
            mdui.prompt(describe, title, e => {
                this.loading = true
                this.$axios(API.admin.sys.setConfig(key, e)).then(() => {
                    this.loading = false
                    mdui.snackbar('修改成功')
                    this.settings[key] = e
                }).catch((e) => {
                    this.loading = false
                    mdui.alert(e.msg)
                })
            }, () => {}, { defaultValue: this.settings[key] })
        },
        switchStore() {
            const val = this.settings.STORE_TYPE == 'RAW' ? 'UNIQUE' : 'RAW'
            mdui.confirm(`即将切换到<strong class=" mdui-text-color-theme-a700">${val}</strong>模式<br>切换过程中会消耗大量服务器资源，可能需要耗费大量时间（取决于文件大小和数量，硬盘IO性能）<br>切换期间文件系统将被锁定，确定要继续吗？`, '警告', () => {
                this.loading = true
                const start = new Date().getSeconds()
                this.$axios(API.admin.sys.setConfig('STORE_TYPE', val)).then(e => {
                    mdui.alert('切换完成，耗时' + (new Date().getSeconds() - start) + '秒')
                    this.settings.STORE_TYPE = val
                    this.loading = false
                }).catch(e => {
                    this.loading = false
                    mdui.alert(e.msg)
                })
            }, () => {}, {
                confirmText: '已了解，确定继续',
                cancelText: '取消'
            })
        },
        sync(all = false) {
            const msg = all ? '所有用户数据' : '公共网盘数据'
            mdui.confirm(`要立即执行${msg}吗？，同步期间系统会进入只读模式（数据检查DATA_CHECKING）`, '确认', async() => {
                this.loading = true
                try {
                    await this.$axios(API.admin.store.sync(all))
                    this.loading = false
                    mdui.alert('同步完成')
                } catch (e) {
                    mdui.snackbar(e.msg)
                    this.loading = false
                }
            })
        }
    }
}
</script>

<style>

</style>
