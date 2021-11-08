<template>
    <full-container class="mdui-typo" :maxWidth="'720px'">
        <div v-show="!success">
            <h1 class="title">{{title}}</h1>
            <mdui-hr style="margin-bottom: 29px"></mdui-hr>
            <h4 v-show="error" style="color:red">{{error}}</h4>
            <div v-if="ci != null">
                <p>收集人:{{ci.nickname}}</p>
                <h5>描述</h5>
                <p class="describe">{{ci.describe ? ci.describe : '无'}}</p>
                <mdui-hr style="margin-bottom: 28px"></mdui-hr>

                <mdui-row>
                    <div v-show="!ci.field" class="mdui-col-xs-12">
                        <mdui-input :fixedLabel="true" :floatLabel="false" v-model="input.name" :placeholder="'文件名'" ></mdui-input>
                    </div>
                    <div class="field-list" v-if="ci.field">
                        <h5 style="margin: 0;font-weight: 900">需要填写字段信息</h5>
                        <div class="mdui-col-sm-6 mdui-col-xs-12" v-for="field in ci.field" :key="field.name">
                            <div class="file-input">
                                <mdui-input class="field-input-text" v-if="field.type == 'TEXT'" v-model="field.value" :placeholder="field.name"></mdui-input>
                                <div class="field-input-option" v-if="field.type == 'OPTION'">
                                    <span class="field-name" style="color: rgba(0, 0, 0, 0.65)">{{field.name}}</span>
                                    <select v-model="field.value" class="mdui-select" mdui-select>
                                        <option v-for="opt in field.options" :key="opt" :value="opt">{{opt}}</option>
                                    </select>
                                </div>
                                <span class="light-text">{{field.describe}}</span>
                            </div>
                        </div>
                    </div>
                    <div class=" mdui-col-xs-12">
                        <file-upload class=" mdui-center" style="width: 100%; max-width: 550px" @remove="fileRemove" @select="fileSelect"></file-upload>
                    </div>
                </mdui-row>

                <mdui-btn @click="submit">提交文件</mdui-btn>
                <mdui-hr style="margin-bottom: 18px"></mdui-hr>
                <div class="light-text">
                    <p>创建日期:{{ci.createdAt | formatDate}}</p>
                    <p>截止日期:{{ci.expiredAt | formatDate}}</p>
                </div>
            </div>
        </div>
        <div v-show="success" class="success-panel">
            <p class=" mdui-text-color-green"><mdui-icon  :size="80" :icon="'check'" /></p>
            <p style="font-size: 36px">提交成功</p>
            <router-link to="/">去咸鱼云首页</router-link>
        </div>
    </full-container>
</template>

<script>
import FullContainer from '@/components/FullContainer.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
import API from '@/api'
import FileUpload from '@/components/FileUpload.vue'
import MduiInput from '@/components/ui/MduiInput.vue'
import MduiRow from '@/components/ui/MduiRow.vue'
import MduiBtn from '@/components/ui/MduiBtn.vue'
import mdui from 'mdui'
import FileUtils from '@/utils/FileUtils'
import MduiIcon from '@/components/ui/MduiIcon.vue'
export default {
    components: { FullContainer, MduiHr, FileUpload, MduiInput, MduiRow, MduiBtn, MduiIcon },
    name: 'submitFile',
    data() {
        return {
            id: '',
            verification: '',
            ci: null,
            error: '',
            title: '文件收集',
            input: {
                name: ''
            },
            file: null,
            success: false
        }
    },
    mounted() {
        this.id = this.$route.query.id
        this.verification = this.$route.query.verification
        console.log(!this.id, this.verification)
        if (!this.id || !this.verification) {
            this.error = '参数错误，丢失收集id或校验码'
            return
        }
        this.axios(API.collection.getCollectionInfo(this.id, this.verification)).then(e => {
            this.title = '【文件收集】' + e.data.title
            this.ci = e.data
            this.$nextTick().then(() => {
                mdui.mutation()
            })
        }).catch(err => {
            this.error = err.toString()
        })
    },
    methods: {
        fileRemove(e) {
            this.file = null
        },
        fileSelect(e) {
            this.file = e
            if (!this.input.name) {
                this.input.name = e.name
            }
        },
        validate() {
            if (!this.file) {
                mdui.alert('未选择文件')
                return false
            }
            if (this.ci.field) {
                if (this.ci.extPattern) {
                    const ext = FileUtils.getSuffix(this.file.name)
                    if (!ext.match(this.ci.extPattern)) {
                        mdui.alert('文件拓展名' + ext + '不被允许。<br>后缀名约束正则：' + this.ci.extPattern)
                        return false
                    }
                }
                for (const e of this.ci.field) {
                    if (!e.value) {
                        mdui.alert('<strong>"' + e.name + '"</strong>未填写')
                        return false
                    }
                    if (e.type === 'TEXT' && !e.value.match(e.pattern)) {
                        mdui.alert(`<strong>"${e.name}"</strong>不满足收集人设定的约束。<br>约束正则：${e.pattern}`)
                        return false
                    }
                }
            } else if (this.ci.pattern && !this.input.name.match(this.ci.pattern)) {
                mdui.alert('文件名' + this.input.name + '不被允许。<br>文件名约束正则：' + this.ci.pattern)
                return false
            }
            return true
        },
        submit() {
            if (!this.validate()) {
                return
            }
            const submitInfo = {}
            if (this.ci.field) {
                submitInfo.filename = this.file.name
                submitInfo.field = []
                for (const field of this.ci.field) {
                    submitInfo.field.push({
                        name: field.name,
                        value: field.value
                    })
                }
            } else {
                submitInfo.filename = this.file.name
            }
            this.axios(API.collection.submit(this.id, this.verification, submitInfo, this.file)).then(e => {
                console.log(e)
                this.success = true
                mdui.snackbar('上传成功')
            }).catch(err => {
                mdui.snackbar(err.toString())
            })
        }
    }
}
</script>

<style lang="less" scoped>
.title {
    margin-top: 0;
    padding-top: 36px;
}
.describe {
    white-space: pre-wrap;
    background-color: rgb(226, 226, 226);
    padding: 10px;
}
.field-list {
    list-style: none;
    padding: 0;
}
.field-input-text {
    padding-bottom: 0;
}
.file-input {
    padding-right: 20px;
}
.field-input-option {
    margin-top: 44px;
    .field-name {
        display: inline-block;
        font-size: 14px;
        margin-bottom: 0px;
        margin-right: 10px;
    }
    .mdui-select-open .mdui-select-menu {
        position: relative !important;
    }
}
.success-panel {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
