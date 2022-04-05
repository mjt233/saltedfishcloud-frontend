<template>
    <div class="global-mask-container" :class="{'active': !hid}">
        <div class="global-mask"></div>
        <mdui-btn class="close-btn" style="color: white" :themeColor="false" icon='close' @click="toClose"></mdui-btn>
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'common-mask',
    data() {
        return {
            hid: true,
            timeOutObj: null
        }
    },
    mounted() {
        this.timeOutObj = setTimeout(() => {
            this.hid = false
            this.timeOutObj = null
        }, 0)
    },
    methods: {
        toClose() {
            if (this.timeOutObj != null) {
                clearTimeout(this.timeOutObj)
            }
            this.hid = true
            setTimeout(() => {
                this.$emit('close')
            }, 230)
        }
    }
}
</script>

<style lang="less" scoped>
.global-mask-container {
    position: fixed;
    z-index: 114514;
    top: 0;
    left: 0;
    width: calc(100vw - 40px);
    height: calc(100vh - 20px);
    padding: 20px 20px 0 20px;
    color: white;
    opacity: 0;
    transition: opacity .2s;
    &.active {
        opacity: 1;
    }
    .global-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: -1;
        opacity: .85;
        pointer-events: none;
    }
    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        text-shadow: 0px 0px 3px black;
        z-index: 114514;
    }
}
</style>
