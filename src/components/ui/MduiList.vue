<template>
    <div class="mdui-list"  mdui-collapse="{accordion: true}">
        <slot></slot>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mduiList',
    mounted() {
        mdui.mutation(this.$el)
    }
}
</script>

<style>

</style>
