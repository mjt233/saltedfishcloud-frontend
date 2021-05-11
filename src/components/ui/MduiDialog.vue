<template>
<div class="mdui-dialog" ref="dialog">
    <div class="mask" v-show='loading'>
        <div class="mdui-spinner mdui-spinner-colorful" style="z-index: 8000"></div>
    </div>
    <div class="mdui-dialog-title">{{title}}</div>
    <div class="mdui-dialog-content"><slot></slot></div>
    <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>取消</button>
        <button class="mdui-btn mdui-ripple" mdui-dialog-confirm>确定</button>
    </div>
</div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mdui-dialog',
    props: {
        'title': {
            type: String,
            default: '对话框'
        },
        'loading': {
            type: Boolean,
            default: false
        }
    },mounted() {
        mdui.mutation('.mdui-spinner')
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