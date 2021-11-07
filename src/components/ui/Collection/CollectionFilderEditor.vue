<template>
    <div>
        <mdui-input v-model="info.name" :placeholder="'字段名称（必填）'"></mdui-input>
        <label>类型</label>
        <select v-model="info.type" mdui-select class=" mdui-select">
            <option value="TEXT">普通文本框</option>
            <option value="OPTION">下拉选择框</option>
        </select>
        <mdui-input v-model="info.describe" :placeholder="'描述（可选）'"></mdui-input>
        <mdui-input v-if="info.type == 'TEXT'" v-model="info.pattern" :placeholder="'正则约束（可选）'"></mdui-input>
        <mdui-input v-if="info.type == 'OPTION'" v-model="info.options" :placeholder="'候选值，/分割（必填）'"></mdui-input>
        <mdui-input v-model="info.value" :placeholder="'默认值（可选）'"></mdui-input>
    </div>
</template>

<script>
import MduiInput from '../MduiInput.vue'
export default {
    components: { MduiInput },
    name: 'collectionFieldEditor',
    data() {
        return {
            template: {
                type: 'TEXT',
                name: '',
                describe: '',
                pattern: '',
                options: '',
                value: ''
            },
            info: {
                type: 'TEXT',
                name: '',
                describe: '',
                pattern: '',
                options: '',
                value: ''
            }
        }
    },
    methods: {
        getFieldInfo() {
            const info = JSON.parse(JSON.stringify(this.info))
            return info
        },
        flush() {
            this.info = JSON.parse(JSON.stringify(this.template))
        }
    }
}
</script>

<style>

</style>
