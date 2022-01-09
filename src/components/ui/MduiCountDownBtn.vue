<template>
    <mdui-btn
        @click="btnClick"
        :accent="accent"
        :dense="dense"
        :disabled="realDisabled"
        :fab="fab"
        :fixed="fixed"
        :hid="hid"
        :icon="icon"
        :themeColor="themeColor"
    >
        <slot v-if="!counting"></slot>
        <span v-else>{{count}}s</span>
    </mdui-btn>
</template>

<script>
import MduiBtn from './MduiBtn.vue'
export default {
    components: { MduiBtn },
    name: 'MduiCountDownBtn',
    props: {
        totalStep: {
            // 倒计时长
            type: Number,
            default: 60
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
        realDisabled() {
            return this.disabled || this.counting
        },
        counting() {
            return this.count > 0
        }
    },
    data() {
        return {
            count: 0,
            itv: null
        }
    },
    destroyed() {
        if (this.itv) {
            clearInterval(this.itv)
        }
    },
    methods: {
        interupt() {
            if (this.itv) {
                clearInterval(this.itv)
                this.itv = null
            }
        },
        start() {
            this.count = this.totalStep
            if (this.itv) {
                this.interupt()
            }
            this.itv = setInterval(() => {
                this.count--
                if (this.count <= 0) {
                    this.interupt()
                    this.$emit('finish')
                }
            }, 1000)
        },
        btnClick() {
            this.$emit('click', this.start)
        }
    }
}
</script>

<style>

</style>
