<template>
    <label class="mdui-checkbox" @click.stop="">
        <input ref="inst" type="checkbox" @change="$emit('change', $event.target.checked)" v-bind:checked='val'>
        <i class="mdui-checkbox-icon"></i>
        {{label}}
    </label>
</template>

<script>
export default {
    name: 'mdui-checkbox',
    model: {
        prop: 'checked',
        event: 'change'
    },
    props: {
        label: {
            // 选项标签
            type: String,
            default: ''
        },
        checked: {
            type: [Boolean, String, Number]
        }
    },
    data() {
        return {
            val: 0
        }
    },
    watch: {
        checked() {
            if (this.checked == 2) {
                this.$refs.inst.indeterminate = true
            } else {
                this.val = this.checked
                this.$refs.inst.indeterminate = false
            }
        }
    }
}
</script>

<style>

</style>
