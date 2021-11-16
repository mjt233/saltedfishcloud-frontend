<template>
    <div class="full-container">
        <header class="mdui-appbar mdui-appbar-fixed" v-show="header" ref="header">
            <div class="mdui-toolbar mdui-color-theme">
                <span class="mdui-typo-title">{{title}}</span>
            </div>
        </header>
        <div ref="body" :style="{'--max-width': maxWidth}" :class="{'mdui-container': !fluid, 'mdui-container-fluid': fluid}" class="content-container">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'fullContainer',
    props: {
        fluid: {
            type: Boolean,
            default: false
        },
        maxWidth: {
            type: String,
            default: '1024px'
        },
        header: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        }
    },
    mounted() {
        this.update()
        window.addEventListener('resize', this.update)
    },
    destroyed() {
        window.removeEventListener('resize', this.update)
    },
    methods: {
        update() {
            if (this.header) {
                const h = (document.documentElement.clientHeight - this.$refs.header.clientHeight) + 'px'
                const body = this.$el
                body.style.height = h
                body.style.maxHeight = h
                body.style.minHeight = h
                body.style.top = this.$refs.header.clientHeight + 'px'
            }
        }
    }
}
</script>

<style lang="less" scoped>
.full-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.1);
    @media (max-width: 1024px) {
        background-color: rgba(255, 255, 255, .92);
    }
    overflow: auto;
}
.content-container {
    position: relative;
    top: 0px;
    height: 100%;
    width: 100%;
    max-width: var(--max-width);
    background-color: rgba(255, 255, 255, 0.92);
    @media (max-width: 1024px) {
        background-color: transparent;
    }
    padding: 10px 20px;
}
</style>
