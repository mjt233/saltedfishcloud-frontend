<template>
    <label class="mdui-switch" style=" margin: 0 16px">
        <input type="checkbox"  @change="$emit('change', $event.target.checked)" v-bind:checked='checked'/>
        <i class="mdui-switch-icon"></i>
    </label>
</template>

<script>
export default {
    name: 'mdui-switch',
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
            type: Boolean
        }
    }
}
</script>

<style>

</style>
