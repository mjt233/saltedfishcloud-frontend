<template>
    <button
        @click="$emit('click', $event)"
        :disabled = 'disabled'
        class="mdui-btn mdui-ripple"
        :class="classObj"
        type="button"
    >
        <i v-show="icon" class="mdui-icon material-icons" :style="{'font-size': iconSize + 'px'}">{{icon}}</i>
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: 'mduiBtn',
    props: {
        iconSize: {
            type: Number,
            default: 24
        },
        dense: {
            // 紧凑按钮
            type: Boolean,
            default: false
        },
        disabled: {
            // 禁用
            type: Boolean,
            default: false
        },
        themeColor: {
            // 使用主题色
            type: Boolean,
            default: true
        },
        icon: {
            // mdui图标按钮
            type: String,
            default: ''
        },
        fixed: {
            // 固定右下角
            type: Boolean,
            default: false
        },
        fab: {
            type: Boolean,
            // 圆角
            default: false
        },
        hid: {
            // 固定状态下隐藏
            type: Boolean,
            default: false
        },
        accent: {

            // 亮色主题色
            type: Boolean,
            default: false
        }
    },
    computed: {
        classObj() {
            return {
                'mdui-btn-dense': this.dense,
                'mdui-color-theme': this.themeColor && !this.accent,
                'mdui-btn-icon': this.icon && !this.fab,
                'mdui-fab-fixed': this.fixed,
                'mdui-fab-hide': this.hid,
                'mdui-fab': this.fab,
                'mdui-color-theme-accent': this.themeColor && this.accent
            }
        }
    }
}
</script>

<style>

</style>
