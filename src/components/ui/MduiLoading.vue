<template>
    <div class="mask" :class="{active: loading}">
        <div class="mdui-spinner" style="z-index: 8000"></div>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mduiLoading',
    props: {
        loading: {
            type: Boolean
        }
    },
    mounted() {
        this.$nextTick(() => {
            mdui.mutation(this.$el)
        })
    }
}
</script>

<style scoped>
.mask {
    left: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.329);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 7000;
    opacity: 0;
    user-select: none;
    transition: all .2s;
}
.mask.active {
    opacity: 1;
    pointer-events: all;
}
</style>
