<template>
    <div class="square-item">
        <div class="square-item-body">
            <slot></slot>
        </div>
        <p class="square-item-title">{{title}}</p>
    </div>
</template>

<script>
export default {
    name: 'squareItem',
    props: {
        title: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="less" scoped>
.square-item {
    width: var(--size);
    height: var(--size);
    display: inline-block;
    // background-color: red;
    .square-item-body {
        min-height: 60%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .square-item-title {
        text-align: center;
        font-size: 10px;
        color: rgb(85, 85, 85);
    }
}
</style>
