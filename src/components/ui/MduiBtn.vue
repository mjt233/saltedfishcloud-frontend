<template>
    <button
        @click="$emit('click', $event)"
        :disabled = 'disabled'
        class="mdui-btn mdui-ripple"
        :class="{'mdui-btn-dense': dense, 'mdui-color-theme': themeColor, 'mdui-btn-icon': icon}"
    >
        <i v-show="icon" class="mdui-icon material-icons">{{icon}}</i>
        <slot></slot>
    </button>
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
        },
        icon: {
            type: String,
            default: ''
        }
    }
}
</script>

<style>

</style>
