<template>
    <div class="full-container">
        <div :style="{'max-width': maxWidth, '--max-width': maxWidth}" :class="{'mdui-container': !fluid, 'mdui-container-fluid': fluid}" class="content-container">
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
            default: '100vw'
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
    min-height: 100vh;
    background-color: rgba(255, 255, 255, 0.92);
    @media (max-width: 1024px) {
        background-color: transparent;
    }
    padding: 10px 20px;
}
</style>
