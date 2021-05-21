<template>
    <button class="mdui-btn mdui-color-theme mdui-ripple" :class="{'mdui-btn-dense': dense}"><slot></slot></button>
</template>

<script>
export default {
    name: 'mduiBtn',
    props: {
        'dense': {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style>

</style>