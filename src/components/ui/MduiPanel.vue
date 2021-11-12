<template>
    <div class="mdui-panel" mdui-panel>
        <slot></slot>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mduiPanel',
    mounted() {
        mdui.mutation(this.$el)
    }
}
</script>

<style>

</style>
