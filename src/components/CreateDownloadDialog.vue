<template>
    <mdui-dialog :title="'创建下载任务'" ref="dialog" @close="$emit('update:show', false)" @confirm="confirm">
        <mdui-input :placeholder="'URL(下载地址)'" v-model="task.url"></mdui-input>
        <p>使用代理节点 <mdui-switch v-model="useProxy"></mdui-switch></p>
        <div v-show="useProxy">
            <p>代理：
                <select ref="proxySelect" class="mdui-select" v-model="task.proxy">
                    <option v-for="item in proxy" :value="item.name" :key="item.name">{{item.name}}</option>
                </select>
            </p>
        </div>
    </mdui-dialog>
</template>

<script>
import API from '@/api'
import MduiDialog from './ui/MduiDialog.vue'
import MduiInput from './ui/MduiInput.vue'
import MduiSwitch from './ui/MduiSwitch.vue'
export default {
    components: { MduiDialog, MduiInput, MduiSwitch },
    props: {
        show: {
            default: false,
            type: Boolean
        }
    },
    async mounted() {
        this.proxy = (await this.$axios(API.task.download.getProxy())).data.data
        await this.$nextTick()
    },
    data() {
        return {
            task: {
                url: '',
                proxy: ''
            },
            proxy: [],
            useProxy: false
        }
    },
    methods: {
        confirm() {
            this.$emit('confirm', this.task)
        }
    },
    watch: {
        show() {
            if (this.show) {
                this.$refs.dialog.open()
            } else {
                this.$refs.dialog.close()
            }
        },
        async useProxy() {
            await this.$nextTick()
            this.$refs.dialog.update()
        }
    }

}
</script>

<style>
.md-select option {
    appearance: none;
}
</style>
