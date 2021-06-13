<template>
    <label class="mdui-checkbox">
        <input type="checkbox" @change="$emit('change', $event.target.checked)" v-bind:checked='checked'>
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
            type: Boolean
        }
    }
}
</script>

<style>

</style>
