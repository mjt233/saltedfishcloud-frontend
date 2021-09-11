<template>
    <div class=" mdui-container">
        <div class="mdui-row">
            <div class="mdui-col-xs-6 mdui-col-md-8">
                <mdui-input :placeholder="'代理名称'" v-model="proxy.name"></mdui-input>
            </div>
            <div class="mdui-col-xs-6 mdui-col-md-4" style="margin-top: 40px">
                <span>类型 </span>
                <select v-model="proxy.type" class="mdui-select" style="margin-left: 12px" mdui-select>
                    <option value="SOCKS">SOCKS</option>
                    <option value="HTTP">HTTP</option>
                </select>
            </div>
        </div>
        <div class="mdui-row">
            <div class="mdui-col-xs-6 mdui-col-md-8">
                <mdui-input :placeholder="'地址'" v-model="proxy.address"></mdui-input>
            </div>
            <div class="mdui-col-xs-6 mdui-col-md-4">
                <mdui-input :placeholder="'端口'" v-model="proxy.port"></mdui-input>
            </div>
        </div>
    </div>
</template>

<script>
import mdui from 'mdui'
import MduiInput from '../ui/MduiInput.vue'
export default {
    components: { MduiInput },
    name: 'ProxyInfoEditor',
    props: {
        data: {
            type: Object,
            default: () => {}
        }
    },
    model: {
        prop: 'data',
        event: 'change'
    },
    data() {
        return {
            proxy: {
                name: '',
                address: '',
                port: '1',
                type: 'SOCKS'
            }
        }
    },
    mounted() {
        this.updateData()
    },
    methods: {
        async updateData() {
            this.proxy.name = this.data.name
            this.proxy.address = this.data.address
            this.proxy.type = this.data.type
            this.proxy.port = this.data.port + ''
            await this.$nextTick()
            mdui.updateTextFields()
        },
        getValue() {
            return this.proxy
        }
    },
    watch: {
        data: {
            handler() {
                this.updateData()
            },
            deep: true
        }
    }
}
</script>

<style scoped>

</style>
