<template>
<div class="mdui-dialog" ref="dialog">
    <div class="mask" v-show='loading'>
        <div class="mdui-spinner mdui-spinner-colorful" style="z-index: 8000"></div>
    </div>
    <div class="mdui-dialog-title">{{title}}</div>
    <div class="mdui-dialog-content"><slot></slot></div>
    <div class="mdui-dialog-actions">
        <template v-if="!disableDefBtn">
            <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>取消</button>
            <button class="mdui-btn mdui-ripple" @click="$emit('confirm')">确定</button>
        </template>
        <slot name="btn"></slot>
    </div>
</div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mdui-dialog',
    props: {
        title: {
            type: String,
            default: '对话框'
        },
        loading: {
            type: Boolean,
            default: false
        },
        renderOnBody: {
            // 将该组件渲染到Body
            type: Boolean,
            default: true
        },
        show: {
            /**
             * 控制是否显示
             */
            type: Boolean,
            default: false
        },
        disableDefBtn: {
            /**
             * 控制是否禁用默认按钮
             */
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            /**
             * @type {HTMLDocument}
             */
            el: null,
            /**
             * @type {MduiStatic.Dialog}
             */
            dialog: null
        }
    },
    mounted() {
        mdui.mutation('.mdui-spinner')
        this.el = this.$el
        if (this.renderOnBody) {
            document.body.appendChild(this.el)
        }
        this.dialog = new mdui.Dialog(this.el, { modal: true })
        this.el.addEventListener('close.mdui.dialog', e => {
            this.$emit('close', e)
        })
    },
    methods: {
        open() {
            this.dialog.open()
        },
        close() {
            this.dialog.close()
        },
        update() {
            this.dialog.handleUpdate()
        }
    },
    destroyed() {
        if (this.renderOnBody) {
            document.body.removeChild(this.$el)
        }
    }
}
</script>

<style>

</style>

<style lang="less" scoped>
.mask {
    z-index: 7000;
    left: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.329);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}
</style>
