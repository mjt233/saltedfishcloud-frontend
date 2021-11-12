<template>
    <div class="mdui-panel-item">
        <div class="mdui-panel-item-header">
            <slot name="header"></slot>
        </div>
        <div class="mdui-panel-item-body">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'mduiPanelItem'
}
</script>

<style>

</style>
