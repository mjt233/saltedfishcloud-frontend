<template>
    <button @click="$emit('click', $event)" :disabled = 'disabled' class="mdui-btn mdui-ripple" :class="{'mdui-btn-dense': dense, 'mdui-color-theme': themeColor}"><slot></slot></button>
</template>

<script>
export default {
    name: 'mduiBtn',
    props: {
        dense: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        themeColor: {
            type: Boolean,
            default: true
        }
    }
}
</script>

<style>

</style>
