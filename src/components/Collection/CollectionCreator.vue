<template>
    <div class="mdui-container collection-creator" style="padding-top: 20px">
        <div style="padding-top: 10px" class="mdui-typo mdui-container">
            <div class=" mdui-row">
                <div class=" mdui-col-sm-6 mdui-col-xs-12">
                    <mdui-input :fixedLabel="true" :floatLabel="false" :placeholder="'标题'" v-model="ci.title"></mdui-input>
                </div>
                <div class=" mdui-col-sm-6 mdui-col-xs-12">
                    <mdui-input :fixedLabel="true"  :floatLabel="false" v-model="ci.nickname" :placeholder="'接收者署名'"></mdui-input>
                </div>
            </div>
            <mdui-input v-model="ci.describe" :placeholder="'收集说明（可多行）'" :textarea="true"></mdui-input>

            <!-- 基本信息 -->
            <div class="detail">
                <mdui-row>
                    <collection-form-field full :name="'保存位置'">
                        {{ci.savePath}}
                        <button style="margin-left: 10px" class=" mdui-btn mdui-btn-dense" @click="showBrowser=true">浏览</button>
                    </collection-form-field>
                    <collection-form-field :name="'有效天数'">
                        <select v-model="ci.validity.type" class="mdui-select" mdui-select style="margin-left: 26px">
                            <option value="1">1天</option>
                            <option value="7">7天</option>
                            <option value="30">30天</option>
                            <option value="custom">自定义</option>
                            <option value="forever">永久有效</option>
                        </select>
                        <mdui-input class="small-input" v-show="ci.validity.type == 'custom'" v-model="ci.validity.value"></mdui-input>
                    </collection-form-field>
                    <collection-form-field :name="'单独文件夹'"><mdui-switch v-model="ci.separate" /></collection-form-field>
                    <collection-form-field :name="'要求登录'"><mdui-switch v-model="ci.requireLogin" style="margin-left: 14px" /></collection-form-field>
                </mdui-row>
            </div>

            <mdui-hr style="margin-bottom: 16px"/>
            <mdui-switch v-model="ci.useAdven" :label="'开启专家选项'" />
            <!-- 专家模式 -->
            <mdui-row v-show="ci.useAdven">
                <mdui-hr />
                <!-- 数量约束 -->
                <collection-form-field :name="'接收数量'">
                    <select v-model="ci.allowMax" class="mdui-select" mdui-select style="margin-left: 26px">
                        <option value="unlimit">不受限制</option>
                        <option value="100">手动指定</option>
                    </select>
                    <mdui-input class="small-input" v-show="ci.allowMax != 'unlimit'" v-model="ci.allowMax"></mdui-input>
                </collection-form-field>
                <!-- 大小约束 -->
                <collection-form-field :name="'大小限制'">
                    <select v-model="ci.maxSize.type" class="mdui-select" mdui-select style="margin-left: 26px">
                        <option value="unlimit">不受限制</option>
                        <option value="MiB">MiB</option>
                        <option value="GiB">GiB</option>
                    </select>
                    <mdui-input class="small-input" v-show="ci.maxSize.type != 'unlimit'" v-model="ci.maxSize.value"></mdui-input>
                </collection-form-field>
                <!-- 文件名约束 -->
                <collection-form-field full :name="'接受类型'">
                    <mdui-row>
                        <select v-model="ci.accept.type" class="mdui-select" mdui-select style="margin-left: 26px">
                            <option value="unlimit">接受所有</option>
                            <option value="type">指定类型</option>
                            <option value="regex">使用正则</option>
                            <option value="field">字段约束</option>
                        </select>
                        <div class="accept-type" v-show="ci.accept.type == 'type'">
                            <mdui-checkbox v-model="ci.accept.value.music" :label="'音乐'"></mdui-checkbox>
                            <mdui-checkbox v-model="ci.accept.value.video" :label="'视频'"></mdui-checkbox>
                            <mdui-checkbox v-model="ci.accept.value.doc" :label="'文档'"></mdui-checkbox>
                            <mdui-checkbox v-model="ci.accept.value.photo" :label="'图片'"></mdui-checkbox>
                            <mdui-checkbox v-model="ci.accept.value.arch" :label="'归档文件'"></mdui-checkbox>
                        </div>
                    </mdui-row>
                </collection-form-field>
                <!-- 字段列表 -->
                <mdui-row v-show="ci.accept.type == 'field'">
                    <h5>字段：</h5>
                    <mdui-btn dense @click="createField">创建字段</mdui-btn>
                    <ul class=" mdui-list">
                        <li
                            class=" mdui-list-item"
                            v-for="(item, index) in ci.fields"
                            :key="item.name"
                            :info="item"
                        >
                            名称：{{item.name}} 类型：{{item.type == 'TEXT' ? '普通文本框' : '下拉选择框'}}
                            <mdui-icon :icon="'delete'" @click.native="deleteField(index)"></mdui-icon>
                        </li>
                    </ul>
                </mdui-row>
                <mdui-hr v-show="ci.accept.type == 'field'"></mdui-hr>
                <!-- 表达式编辑 -->
                <mdui-row>
                    <collection-form-field v-show="['regex', 'field'].includes(ci.accept.type)" :name="'文件名表达式'">
                        <mdui-input v-model="ci.pattern" class="mid-input"></mdui-input>
                    </collection-form-field>
                    <collection-form-field v-show="ci.accept.type == 'field'" :name="'文件拓展名表达式'">
                        <mdui-input v-model="ci.extPattern" class="mid-input"></mdui-input>
                    </collection-form-field>
                </mdui-row>
            </mdui-row>
            <mdui-hr style="margin-bottom: 22px" />
            <mdui-btn @click="create">创建</mdui-btn>
        </div>

        <mdui-dialog :show.sync="showCreateField" :title="'新建字段'" @confirm="addField">
            <collection-filder-editor ref="createFieldEditor"></collection-filder-editor>
        </mdui-dialog>

        <mdui-dialog full :show.sync="showBrowser" :title="'选择保存位置'" :loading="loading">
            <file-browser
                :uid="userInfo.id"
                :showToolBar="false"
                :showPath="true"
                :manualEnable="'mkdir name size date menu toolbar delete'"
                :routeMode="false"
                :path.sync="browserPath"
                :disableSearch="true"
                :rootName="userInfo.user + '的私人网盘'"
                ref="browser"
                @createFolder="createFolder"
                @delete="deleteItem"
                @getURL='getURL'
            />
            <mdui-btn @click="ci.savePath = browserPath; showBrowser = false" :hid="!showBrowser" :fab="true" :fixed="true" :icon="'check'"></mdui-btn>
        </mdui-dialog>
    </div>
</template>

<script>
import MduiInput from '@/components/ui/MduiInput.vue'
import MduiSwitch from '@/components/ui/MduiSwitch.vue'
import MduiBtn from '@/components/ui/MduiBtn.vue'
import MduiDialog from '@/components/ui/MduiDialog.vue'
import FileBrowser from '@/components/FileBrowser.vue'
import API from '@/api'
import mdui from 'mdui'
import MduiRow from '@/components/ui/MduiRow.vue'
import CollectionFormField from './CollectionFormField.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
import MduiCheckbox from '@/components/ui/MduiCheckbox.vue'
import CollectionFilderEditor from './CollectionFilderEditor.vue'
import MduiIcon from '@/components/ui/MduiIcon.vue'
export default {
    name: 'collectionCreator',
    components: {
        MduiInput,
        MduiSwitch,
        MduiBtn,
        MduiDialog,
        FileBrowser,
        MduiRow,
        CollectionFormField,
        MduiHr,
        MduiCheckbox,
        CollectionFilderEditor,
        MduiIcon
    },
    computed: {
        userInfo() {
            return this.$store.getters.userInfo
        }
    },
    data() {
        return {
            showBrowser: false,
            loading: false,
            showCreateField: false,
            browserPath: '/',
            ci: {
                savePath: '',
                title: '',
                nickname: '',
                describe: '',
                validity: {
                    type: '1',
                    value: '1'
                },
                maxSize: {
                    type: 'unlimit',
                    value: '128'
                },
                separate: false,
                allowMax: 'unlimit',
                requireLogin: false,
                useAdven: false,
                pattern: '',
                extPattern: '',
                accept: {
                    type: 'unlimit',
                    value: {
                        video: false,
                        photo: false,
                        arch: false,
                        doc: false,
                        music: false
                    }
                },
                fields: []
            }

        }
    },
    mounted() {
        mdui.mutation()
        this.ci.nickname = this.userInfo.user
        this.ci.separate = true
    },
    methods: {
        async buildConfigureObj() {
            if (!this.ci.savePath) {
                return Promise.reject(new Error('保存位置不能为空'))
            }
            if (!this.ci.title) {
                return Promise.reject(new Error('标题不能为空'))
            }
            if (!this.ci.nickname) {
                return Promise.reject(new Error('收集者署名不能为空'))
            }
            // 基本配置信息（标题，接收者署名，默认的大小限制，默认的数量限制，保存位置，收集描述，登录要求）
            /**
             * @type {import('@/api/collection').CollectionInfo}
             */
            const obj = {}
            obj.title = this.ci.title
            obj.nickname = this.ci.nickname
            obj.maxSize = -1
            obj.allowMax = -1
            obj.saveNode = this.ci.savePath
            obj.separate = this.ci.separate
            obj.describe = this.ci.describe
            obj.allowAnonymous = !this.ci.requireLogin

            if (this.ci.validity.type === 'custom') {
                obj.expiredAt = new Date().getTime() + parseInt(this.ci.validity.value) * 24 * 60 * 60 * 1000
            } else if (this.ci.validity.type === 'forever') {
                obj.expiredAt = new Date().getTime() + 365 * 99 * 24 * 60 * 60 * 1000
            } else {
                obj.expiredAt = new Date().getTime() + parseInt(this.ci.validity.type) * 24 * 60 * 60 * 1000
            }


            // 高级模式未启用时，配置流程结束
            if (!this.ci.useAdven) {
                return obj
            }
            console.log('高级模式')
            obj.allowMax = this.ci.allowMax == 'unlimit' ? -1 : this.ci.allowMax
            obj.allowAnonymous = !this.ci.requireLogin
            const sizeType = this.ci.maxSize.type
            console.log(sizeType)
            if (sizeType == 'unlimit') {
                obj.maxSize = -1
            } else if (sizeType == 'GiB') {
                obj.maxSize = this.ci.maxSize.value * 1024 * 1024 * 1024
            } else if (sizeType == 'MiB') {
                obj.maxSize = this.ci.maxSize.value * 1024 * 1024
            }

            // 接收约束配置
            if (this.ci.accept.type == 'type') {
                // 类型约束
                let ext = ''
                if (this.ci.accept.value.video) {
                    ext += '|mp4|mpeg|avi|mov|wmv|flv|3gp'
                }
                if (this.ci.accept.value.photo) {
                    ext += '|jpg|jpeg|png|gif'
                }
                if (this.ci.accept.value.arch) {
                    ext += '|7z|zip|rar|gz|img|iso|image|tar'
                }
                if (this.ci.accept.value.doc) {
                    ext += '|docx|doc|ppt|pptx|xls|xls|txt|md|pdf'
                }
                if (this.ci.accept.value.music) {
                    ext += '|mp3|wav|mid|asf|mpg|tti|flac|aif|aiff|ape'
                }
                if (ext.startsWith('|')) {
                    ext = ext.substr(1)
                }
                obj.pattern = `\\.(${ext})$`
            } else if (this.ci.accept.type == 'regex') {
                // 正则约束
                obj.pattern = this.ci.pattern
            } else if (this.ci.accept.type == 'field') {
                // 字段约束
                obj.pattern = this.ci.pattern
                obj.extPattern = this.ci.extPattern ? this.ci.extPattern : undefined
                obj.field = this.ci.fields.map(obj => {
                    if (obj.type == 'TEXT') {
                        delete obj.options
                    } else {
                        delete obj.pattern
                    }
                    return obj
                })
            }

            return obj
        },
        createFolder(e) {
            console.log(e)
            this.loading = true
            this.axios(API.file.mkdir(this.userInfo.id, '/' + e.path.join('/'), e.name)).then(e => {
                this.loading = false
                console.log(this.$refs.browser.loadList())
            }).catch(e => {
                this.loading = false
                mdui.snackbar(e.msg)
            })
        },
        async create() {
            try {
                this.loading = true
                const conf = await this.buildConfigureObj()
                this.loading = false
                this.$emit('create', conf)
            } catch (err) {
                console.log(err)
                this.loading = false
                mdui.snackbar(err.toString())
            }
        },
        deleteItem(e) {
            const names = []
            e.forEach(el => names.push(el.name))
            const conf = API.file.delete(this.userInfo.id, '/' + this.browserPath, names)
            this.loading = true
            this.axios(conf).then(() => {
                this.loading = false
                this.$refs.browser.loadList()
            }).catch(err => {
                this.loading = false
                mdui.alert(err.msg)
            })
        },
        getURL() {
            mdui.snackbar('不支持的操作')
        },
        addField() {
            const info = this.$refs.createFieldEditor.getFieldInfo()
            if (!info.name) {
                this.showCreateField = false
                mdui.alert('名称不得为空', () => { this.showCreateField = true })
                return
            }
            if (info.type == 'OPTION') {
                if (!info.options) {
                    this.showCreateField = false
                    mdui.alert('候选值为空', () => { this.showCreateField = true })
                    return
                }
                info.options = info.options.split('/')
                if (info.value && !info.options.includes(info.value)) {
                    this.showCreateField = false
                    mdui.alert('默认值' + info.value + '不在候选值内', () => { this.showCreateField = true })
                    return
                }
            }
            if (this.ci.fields.filter(e => e.name == info.name).length > 0) {
                this.showCreateField = false
                mdui.alert('字段名称' + info.name + '重复', () => { this.showCreateField = true })
                return
            }
            this.ci.fields.push(info)
            this.showCreateField = false
        },
        createField() {
            this.showCreateField = true
            this.$refs.createFieldEditor.flush()
        },
        deleteField(index) {
            mdui.snackbar('字段' + this.ci.fields[index].name + '已移除')
            this.ci.fields.splice(index, 1)
        }
    }
}
</script>

<style scoped>
ul {
    padding: 0;
    list-style: none;
}
.small-input {
    display:inline-block;
    width: 48px;
    padding: 0 10px
}
.mid-input {
    display:inline-block;
    width: 180px;
    padding: 0 10px
}
.accept-type {
    margin: 0 8px;
}
.accept-type > * {
    margin: 0 18px;
}

</style>

<style>

.collection-creator .mdui-select-menu {
    position: relative !important;
}
</style>
