<template>
    <label class="mdui-switch">
        <span>{{label}}</span>
        <input type="checkbox"  @change="$emit('change', $event.target.checked)" v-bind:checked='checked'/>
        <i class="mdui-switch-icon" style="margin: 0 16px"></i>
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
