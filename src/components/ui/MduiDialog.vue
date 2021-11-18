<template>
    <div v-if="!full" class="mdui-dialog" ref="dialog" :style="{'border-radius': radius ? '10px' : '0'}">
        <div class="mask" v-show='loading'>
            <div class="mdui-spinner mdui-spinner-colorful" style="z-index: 8000"></div>
        </div>
        <div class="mdui-dialog-title" :style="contentStyle">{{title}}</div>
        <div class="mdui-dialog-content" :style="contentStyle"><slot></slot></div>
        <div class="mdui-dialog-actions" :style="contentStyle">
            <template v-if="!disableDefBtn">
                <button class="mdui-btn mdui-ripple" mdui-dialog-cancel @click="$emit('cancel')">取消</button>
                <button class="mdui-btn mdui-ripple" @click="$emit('confirm')">确定</button>
            </template>
            <slot name="btn"></slot>
        </div>
    </div>
    <div v-else class="full-dialog" :class="{active: show}">
        <div class="mask" v-show='loading'>
            <div class="mdui-spinner mdui-spinner-colorful" style="z-index: 8000"></div>
        </div>
        <div class="mdui-appbar">
            <div class="mdui-toolbar mdui-color-theme">
                <button @click="close" href="javascript:;" class="mdui-btn mdui-btn-icon">
                    <i class="mdui-icon material-icons">close</i>
                </button>
                <a href="javascript:;" class="mdui-typo-headline" style="color: white; font-size: 1.3rem">{{title}}</a>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mdui-dialog',
    props: {
        full: {
            type: Boolean,
            default: false
        },
        radius: {
            type: Boolean,
            default: false
        },
        padding: {
            type: Number,
            default: -1
        },
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
    watch: {
        show() {
            if (this.show) {
                this.open()
            } else {
                this.close()
            }
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
    destroyed() {
        if (!this.full && this.renderOnBody) {
            document.body.removeChild(this.$el)
        }
    },
    mounted() {
        mdui.mutation('.mdui-spinner')
        if (!this.full) {
            this.el = this.$el
            if (this.renderOnBody) {
                document.body.appendChild(this.el)
            }
            this.dialog = new mdui.Dialog(this.el, { modal: true })
            this.el.addEventListener('close.mdui.dialog', e => {
                this.$emit('update:show', false)
                this.$emit('close', e)
            })
            this.el.addEventListener('opened.mdui.dialog', e => {
                this.$emit('opened')
            })
            this.el.addEventListener('open.mdui.dialog', e => {
                this.$emit('open')
            })
            if (this.show) {
                this.dialog.open()
            }
        }
    },
    computed: {
        contentStyle() {
            if (this.padding >= 0) {
                return {
                    padding: this.padding + 'px'
                }
            } else {
                return {

                }
            }
        }
    },
    methods: {
        open() {
            this.$emit('update:show', true)
            if (!this.full) {
                this.dialog.open()
            }
        },
        close() {
            this.$emit('update:show', false)
            if (!this.full) {
                this.dialog.close()
            }
        },
        update() {
            if (!this.full) {
                this.dialog.handleUpdate()
            }
        }
    }
}
</script>

<style>

</style>

<style lang="less" scoped>
.mdui-dialog {
    user-select: none;
    overflow: initial;
}
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
.full-dialog {
    position: fixed;
    height: 100vh;
    width: 100vw;
    background-color: white;
    top: 100vh;
    left: 0;
    z-index: 5001;
    overflow: auto;
    transition: all .35s;
    &.active {
        top: 0;
    }
}
</style>
