<template>
    <div class="mdui-panel-item">
        <div class="mdui-panel-item-header" :style="headerStyle">
            <slot name="header"></slot>
        </div>
        <div class="mdui-panel-item-body">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'mduiPanelItem',
    props: {
        headerStyle: {
            type: Object,
            default: () => { return {} }
        }
    }
}
</script>

<style>

</style>
