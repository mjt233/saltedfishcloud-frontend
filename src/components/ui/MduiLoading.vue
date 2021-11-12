<template>
    <div class="mask" v-show='loading'>
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
        mdui.mutation(this.$el)
    }
}
</script>

<style scoped>
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
