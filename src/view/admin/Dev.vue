<template>
    <container fill class="mdui-typo" :loading="loading">
        <h2 class="mdui-text-color-theme">开发者选项</h2>
        <mdui-hr></mdui-hr>
        <mdui-card>
            <h4 class="mdui-text-color-theme">只读模式：{{devData.read_only_level || '关闭'}}</h4>
            <mdui-btn :disabled="devData.read_only_level == null" dense @click="setReadOnlyLevel(null)">关闭</mdui-btn>
            <mdui-btn :disabled="devData.read_only_level != null" dense @click="setReadOnlyLevel('DATA_MOVING')">DATA_MOVING</mdui-btn>
            <mdui-btn :disabled="devData.read_only_level != null" dense @click="setReadOnlyLevel('DATA_CHECKING')">DATA_CHECKING</mdui-btn>
            <mdui-hr />
            <h4 class="mdui-text-color-theme">同步延迟：{{devData.sync_delay}} 分种</h4>
        </mdui-card>
    </container>

</template>

<script>
import mdui from 'mdui'
import API from '../../api/API'
import Container from '../../components/layout/Container.vue'
import MduiBtn from '../../components/ui/MduiBtn.vue'
import MduiCard from '../../components/ui/MduiCard.vue'
import MduiHr from '../../components/ui/MduiHr.vue'

export default {
  components: { Container, MduiHr, MduiCard, MduiBtn },
    data() {
        return {
            loading: false,
            devData: {
                read_only_level: null,
                sync_delay: 5
            }
        }
    },
    mounted() {
        this.loading = true
        this.loadData()
        this.loading = false
    },
    methods: {
        async loadData() {
            let data = (await this.$axios(API.admin.debug.getAllOptions())).data.data
            this.devData = data
        },
        async setReadOnlyLevel(level) {
            this.loading = true
            try {
                await this.$axios(API.admin.debug.setReadOnlyLevel(level))
                mdui.snackbar('只读模式已切换到：' + (level == null ? '关闭' : level))
                this.devData.read_only_level = level
            } catch (error) {
                mdui.alert('切换失败：' + error.msg)
                setTimeout(() => {
                    this.loadData()
                }, 100)
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style>

</style>