<template>
    <ul class="square-item-list" :style="styleObj">
        <slot></slot>
    </ul>
</template>

<script>
export default {
    name: 'squareItemList',
    props: {
        size: {
            type: Number,
            default: 120
        }
    },
    computed: {
        styleObj() {
            return { '--size': this.size + 'px' }
        }
    }
}
</script>

<style scoped lang="less">
.square-item-list {
    display: inline-grid;
    width: 100%;
    padding: 0;
    grid-template-columns: repeat(auto-fill, var(--size));
    gap: 10px;
    justify-content: space-between;
}
</style>
