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
                                    <td><mdui-btn dense @click="inputConfig('注册邀请码','修改注册邀请码', 'REG_CODE')">修改</mdui-btn></td>
                                </tr>
                                <tr>
                                    <td>注册机制</td>
                                    <td>
                                        <mdui-checkbox @change="setConfig('ENABLE_REG_CODE', $event)" v-model="settings.ENABLE_REG_CODE" :label="'注册邀请码注册'"></mdui-checkbox>
                                        <mdui-checkbox @change="setConfig('ENABLE_EMAIL_REG', $event)" v-model="settings.ENABLE_EMAIL_REG" :label="'邮箱注册'"></mdui-checkbox>
                                    </td>
                                </tr>
                                <tr>
                                    <td>自动同步间隔：{{settings.SYNC_INTERVAL == -1 ? '关闭' : settings.SYNC_INTERVAL + '分'}}</td>
                                    <td><mdui-btn dense @click="inputConfig('自动同步间隔','修改自动同步间隔，单位为分钟，-1关闭', 'SYNC_INTERVAL')">修改</mdui-btn></td>
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
                                    <td>存储模式：{{settings.STORE_MODE}} </td>
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
                <!-- 发信服务器配置 -->
                <mdui-col :md="12">
                    <mdui-hr class="tab-hr"></mdui-hr>
                    <h3 class="mdui-text-color-theme">发信服务器</h3>
                    <!-- 配置信息显示 -->
                    <div v-if="settings.MAIL_PROPERTIES">
                        <mdui-card class="properties-card">
                            <mdui-col :md="6" :sm="12">
                                发信协议：{{settings.MAIL_PROPERTIES.protocol}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                发信服务器地址：{{settings.MAIL_PROPERTIES.host}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                发信用户名：{{settings.MAIL_PROPERTIES.username}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                发信地址：{{settings.MAIL_PROPERTIES.from}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                称呼：{{settings.MAIL_PROPERTIES.alias}}
                            </mdui-col>
                        </mdui-card>
                    </div>
                    <div v-else>
                        <p style="margin-bottom: 14px">未配置</p>
                    </div>
                    <mdui-btn dense @click="showMailConfig = true">配置</mdui-btn>
                    <!-- 配置信息修改对话框 -->
                    <mdui-dialog @confirm="updateProperties('MAIL_PROPERTIES');showMailConfig = false" :title="'配置发信服务器'" :show.sync="showMailConfig">
                        <h4 class="mdui-text-color-theme">服务器配置</h4>
                        <mdui-hr></mdui-hr>
                        <mdui-col :md="6" :xs="12">
                            <div style="height: 80px; " class="v-center">
                                <label class="form-label">发信协议</label>
                                <mdui-select :fixed="true" :options="[{value: 'smtp', label: 'smtp'}]" v-model="dialog_MAIL_PROPERTIES.protocol"></mdui-select>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div style="height: 80px; " class="v-center">
                                <label class="form-label">服务器端口</label>
                                <mdui-input v-model="dialog_MAIL_PROPERTIES.port"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div class="v-center">
                                <label class="form-label">发信服务器</label>
                                <mdui-input v-model="dialog_MAIL_PROPERTIES.host"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :xs="12">
                            <h4 class="mdui-text-color-theme">账号配置</h4>
                            <mdui-hr></mdui-hr>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div class="v-center">
                                <label class="form-label">发信地址</label>
                                <mdui-input v-model="dialog_MAIL_PROPERTIES.from"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div class="v-center">
                                <label class="form-label">发信人称呼</label>
                                <mdui-input v-model="dialog_MAIL_PROPERTIES.alias"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div class="v-center">
                                <label class="form-label">用户名</label>
                                <mdui-input v-model="dialog_MAIL_PROPERTIES.username"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div class="v-center">
                                <label class="form-label">密码</label>
                                <mdui-input :type="'password'" v-model="dialog_MAIL_PROPERTIES.password"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div class="v-center">
                                <label class="form-label">回信地址</label>
                                <mdui-input v-model="dialog_MAIL_PROPERTIES.reply"></mdui-input>
                            </div>
                        </mdui-col>
                    </mdui-dialog>
                </mdui-col>

                <!-- FTP服务器配置 -->
                <mdui-col :md="12">
                    <mdui-hr class="tab-hr"></mdui-hr>
                    <h3 class="mdui-text-color-theme">FTP服务配置</h3>
                    <!-- 配置信息显示 -->
                    <div v-if="settings.FTP_PROPERTIES">
                        <mdui-card class="properties-card">
                            <mdui-col :md="6" :sm="12">
                                状态：{{settings.FTP_PROPERTIES.ftpEnable ? '启用' : '关闭'}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                主控制端口：{{settings.FTP_PROPERTIES.controlPort}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                监听地址：{{settings.FTP_PROPERTIES.listenAddr}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                被动传输端口范围：{{settings.FTP_PROPERTIES.passivePort}}
                            </mdui-col>
                            <mdui-col :md="6" :sm="12">
                                被动传输地址：{{settings.FTP_PROPERTIES.passiveAddr}}
                            </mdui-col>
                        </mdui-card>
                    </div>
                    <div v-else>
                        <p style="margin-bottom: 14px">未配置</p>
                    </div>
                    <mdui-btn dense @click="showFtpConfig = true">配置</mdui-btn>
                    <!-- 配置信息修改对话框 -->
                    <mdui-dialog @confirm="updateProperties('FTP_PROPERTIES'); showFtpConfig = false" :title="'配置FTP服务器'" :show.sync="showFtpConfig">
                        <h4 class="mdui-text-color-theme">基本配置</h4>
                        <mdui-hr></mdui-hr>
                        <mdui-col :xs="12">
                            <div style="height: 80px; " class="v-center">
                                <label class="form-label">开启FTP</label>
                                <mdui-switch v-model="dialog_FTP_PROPERTIES.ftpEnable"></mdui-switch>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div style="height: 80px; " class="v-center">
                                <label class="form-label">主控制端口</label>
                                <mdui-input v-model="dialog_FTP_PROPERTIES.controlPort"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div style="height: 80px; " class="v-center">
                                <label class="form-label">监听地址</label>
                                <mdui-input v-model="dialog_FTP_PROPERTIES.listenAddr"></mdui-input>
                            </div>
                        </mdui-col>
                        <h4 class="mdui-text-color-theme">被动模式</h4>
                        <mdui-hr></mdui-hr>
                        <mdui-col :md="6" :xs="12">
                            <div style="height: 80px; " class="v-center">
                                <label class="form-label" style="width: 96px">被动传输地址</label>
                                <mdui-input v-model="dialog_FTP_PROPERTIES.passiveAddr"></mdui-input>
                            </div>
                        </mdui-col>
                        <mdui-col :md="6" :xs="12">
                            <div style="height: 80px; " class="v-center">
                                <label class="form-label" style="width: 96px">被动传输端口</label>
                                <mdui-input v-model="dialog_FTP_PROPERTIES.passivePort"></mdui-input>
                            </div>
                        </mdui-col>
                    </mdui-dialog>
                </mdui-col>
                <!-- 代理节点 -->
                <div class="mdui-col-md-12">
                    <mdui-dialog :loading="proxyLoading" :title="dialogTitle" :show.sync="showProxyDialog" @confirm="doProxyConfirm">
                        <proxy-info-editor ref="proxyEditor" v-model="dialogProxy"></proxy-info-editor>
                    </mdui-dialog>
                    <mdui-hr class="tab-hr"></mdui-hr>
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
import MduiCheckbox from '@/components/ui/MduiCheckbox.vue'
import MduiCol from '@/components/ui/MduiCol.vue'
import MduiInput from '@/components/ui/MduiInput.vue'
import MduiSelect from '@/components/ui/MduiSelect.vue'
import MduiSwitch from '@/components/ui/MduiSwitch.vue'
export default {
    components: { Container, MduiCard, MduiBtn, MduiHr, MduiIcon, MduiDialog, ProxyInfoEditor, MduiCheckbox, MduiCol, MduiInput, MduiSelect, MduiSwitch },
    data() {
        return {
            settings: {},
            loading: false,
            proxy: [],
            showProxyDialog: false,
            dialogProxy: {},
            dialogTitle: '修改代理信息',
            dialogMode: 'update',
            oldProxyName: '',
            proxyLoading: false,
            showMailConfig: false,
            dialog_MAIL_PROPERTIES: {
                protocol: 'smtp'
            },
            dialog_FTP_PROPERTIES: {},
            showFtpConfig: false
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
            Object.keys(this.settings).forEach(key => {
                if (key.endsWith('_PROPERTIES')) {
                    this['dialog_' + key] = JSON.parse(this.settings[key])
                    this.settings[key] = JSON.parse(this.settings[key])
                }
            })
            this.settings.ENABLE_EMAIL_REG = this.settings.ENABLE_EMAIL_REG == 'true'
            this.settings.ENABLE_REG_CODE = this.settings.ENABLE_REG_CODE == 'true'
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
        /**
         * 直接设置修改配置
         * @param {String} key 配置名
         * @param {String} val 配置值
         */
        setConfig(key, val) {
            this.loading = true
            this.$axios(API.admin.sys.setConfig(key, val)).then(() => {
                this.loading = false
                mdui.snackbar('修改成功')
                if (key.endsWith('_PROPERTIES')) {
                    this.settings[key] = JSON.parse(decodeURIComponent(val))
                } else {
                    this.settings[key] = val
                }
            }).catch((e) => {
                this.loading = false
                mdui.alert(e.toString())
            })
        },
        /**
         * 打开输入确认对话框修改配置
         * @param {String} title 标题
         * @param {String} describe 描述
         * @param {String} key 配置名
         */
        inputConfig(title, describe, key) {
            mdui.prompt(describe, title, e => {
                this.setConfig(key, e)
            }, () => {}, { defaultValue: this.settings[key] })
        },
        switchStore() {
            const val = this.settings.STORE_MODE == 'RAW' ? 'UNIQUE' : 'RAW'
            mdui.confirm(`即将切换到<strong class=" mdui-text-color-theme-a700">${val}</strong>模式<br>切换过程中会消耗大量服务器资源，可能需要耗费大量时间（取决于文件大小和数量，硬盘IO性能）<br>切换期间文件系统将被锁定，确定要继续吗？`, '警告', () => {
                this.loading = true
                const start = new Date().getSeconds()
                this.$axios(API.admin.sys.setConfig('STORE_MODE', val)).then(e => {
                    mdui.alert('切换完成，耗时' + (new Date().getSeconds() - start) + '秒')
                    this.settings.STORE_MODE = val
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
            mdui.confirm(`要立即执行${msg}吗？，同步期间系统会进入保护模式（数据检查DATA_CHECKING）`, '确认', async() => {
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
        },
        /**
         * 更新Properties类型的配置
         * @param {String} name 配置名
         */
        updateProperties(name) {
            this.setConfig(name, encodeURIComponent(JSON.stringify(this['dialog_' + name])))
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
.properties-card {
    padding-bottom: 12px;
}
.tab-hr {
    margin-top: 24px;
}
.form-label {
    width: 80px;
    padding-right: 12px;
    text-align: right;
}
</style>
