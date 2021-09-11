<template>
    <container class="mdui-typo" :loading="loading">
        <div class="mdui-container">
            <mdui-card style="padding-bottom: 40px">
                <!-- 常规设置 -->
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
                <!-- 存储设置 -->
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
                <!-- 代理节点 -->
                <div class="mdui-col-md-12">
                    <mdui-dialog :loading="proxyLoading" :title="dialogTitle" :show.sync="showProxyDialog" @confirm="doProxyConfirm">
                        <proxy-info-editor ref="proxyEditor" v-model="dialogProxy"></proxy-info-editor>
                    </mdui-dialog>
                    <h3 class="mdui-text-color-theme">代理节点</h3>
                    <div>
                        <mdui-btn :dense="true" @click.native="setProxyDialog({port:1080, type: 'SOCKS', name: '新节点', address: '127.0.0.1'}, '新建代理', 'create')">添加</mdui-btn>
                        <!-- 代理节点列表显示 -->
                        <mdui-card v-for="item in proxy" :key="item.id" class="proxy-card">
                            <!-- 代理名称 -->
                            <h5 class="proxy-name mdui-text-color-theme-400">
                                {{item.name}}
                                <span class="op">
                                    <mdui-icon @click.native="setProxyDialog(item, '编辑代理', 'update');oldProxyName = item.name" :icon="'edit'"></mdui-icon>
                                    <mdui-icon @click.native="deleteProxy(item.name)" :icon="'delete'"></mdui-icon>
                                </span>
                            </h5>
                            <mdui-hr></mdui-hr>
                            <!-- 详细信息 -->
                            <div>类型：{{item.type}} 地址：{{item.address}} 端口：{{item.port}}</div>
                        </mdui-card>
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
import MduiHr from '@/components/ui/MduiHr.vue'
import MduiIcon from '@/components/ui/MduiIcon.vue'
import MduiDialog from '@/components/ui/MduiDialog.vue'
import ProxyInfoEditor from '@/components/proxy/ProxyInfoEditor.vue'
export default {
    components: { Container, MduiCard, MduiBtn, MduiHr, MduiIcon, MduiDialog, ProxyInfoEditor },
    data() {
        return {
            settings: {
            },
            loading: false,
            proxy: [],
            showProxyDialog: false,
            dialogProxy: {},
            dialogTitle: '修改代理信息',
            dialogMode: 'update',
            oldProxyName: '',
            proxyLoading: false
        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        deleteProxy(name) {
            mdui.confirm(`确定要删除代理“${name}”吗？（不可撤回）`, async() => {
                try {
                    this.loading = true
                    await this.$axios(API.admin.sys.proxy.deleteProxy(name))
                    await this.loadProxy()
                    this.loading = false
                } catch (error) {
                    this.loading = false
                    mdui.alert(error.msg)
                }
            })
        },
        /**
         * 代理节点对话框的确认事件回调
         */
        async doProxyConfirm() {
            // 构造请求配置（创建或修改代理）
            let conf
            const info = this.$refs.proxyEditor.getValue()
            if (this.proxyDialogMode === 'update') {
                conf = API.admin.sys.proxy.updateProxy(this.oldProxyName, info)
            } else {
                conf = API.admin.sys.proxy.addProxy(info)
            }
            // 发起请求
            try {
                this.proxyLoading = true
                await this.$axios(conf)
                this.showProxyDialog = false
                mdui.snackbar('操作成功')
                this.loadProxy()
            } catch (e) {
                this.showProxyDialog = false
                await this.$nextTick()
                mdui.alert(e.msg, () => {
                    this.setProxyDialog(info, this.dialogTitle, this.proxyDialogMode)
                })
            }
            this.proxyLoading = false
        },
        /**
         * 设置代理对话框的数据，同时会打开对话框
         * @param {import("@/api/admin/sys").ProxyInfo} 代理信息
         * @param {String} title 对话框标题
         * @param {('update'|'create')} mode 对话框模式
         */
        setProxyDialog(proxy, title, mode) {
            console.log(23)
            this.dialogProxy = JSON.parse(JSON.stringify(proxy))
            console.log(this.dialogProxy)
            this.dialogTitle = title
            this.proxyDialogMode = mode
            this.showProxyDialog = true
        },
        async loadData() {
            this.loading = true
            const data = (await this.$axios(API.admin.sys.getAllConfig())).data.data
            await this.loadProxy()
            this.settings = data
            this.loading = false
        },
        async loadProxy() {
            try {
                const data = (await this.$axios(API.admin.sys.proxy.getAllProxy())).data.data
                this.proxy = data
            } catch (e) {
                mdui.alert(e.msg)
            }
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

<style lang="less" scoped>
.proxy-card {
    .proxy-name {
        margin: 0;
    }
    .op {
        user-select: none;
        display: none;
        >.mdui-icon {
            cursor: pointer;
        }
    }
    &:hover .op { display: inline-block;}
}
</style>
