<template>
    <div class="mdui-progress">
        <div
            :class="{'mdui-progress-determinate': !unknow, 'mdui-progress-indeterminate': unknow}"
            :style="{ width: unknow ? '' : value + '%'}">
        </div>
    </div>
</template>

<script>
export default {
    name: 'MduiProgress',
    props: {
        value: {
            /**
             * 百分比进度
             */
            type: Number,
            default: 0
        },
        unknow: {
            /**
             * 是否为不确定进度类型
             */
            type: Boolean,
            default: false
        }
    }
}
</script>

<style>

</style>
