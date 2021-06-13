<template>
    <li class="mdui-collapse-item mdui-collapse-item-open">
      <div class="mdui-collapse-item-header mdui-list-item mdui-ripple">
        <i class="mdui-list-item-icon mdui-icon material-icons">{{icon}}</i>
        <div class="mdui-list-item-content">
            <template v-if="title">{{title}}</template>
            <slot v-else name="title"></slot>
        </div>
        <i class="mdui-collapse-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
      </div>
      <ul class="mdui-collapse-item-body mdui-list mdui-list-dense">
        <slot></slot>
      </ul>
    </li>
</template>

<script>
export default {
    name: 'mduiSubList',
    props: ['icon', 'title']
}
</script>

<style>

</style>
