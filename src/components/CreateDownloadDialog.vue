<template>
    <mdui-dialog :title="'创建下载任务'" ref="dialog" @close="$emit('update:show', false)" @confirm="$emit('confirm', task)">
        <mdui-input :placeholder="'URL(下载地址)'" v-model="task.url"></mdui-input>
    </mdui-dialog>
</template>

<script>
import MduiDialog from './ui/MduiDialog.vue'
import MduiInput from './ui/MduiInput.vue'
export default {
    components: { MduiDialog, MduiInput },
    props: {
        show: {
            default: false,
            type: Boolean
        }
    },
    data() {
        return {
            task: {
                url: ''
            }
        }
    },
    watch: {
        show() {
            if (this.show) {
                this.$refs.dialog.open()
            } else {
                this.$refs.dialog.close()
            }
        }
    }

}
</script>

<style>

</style>
