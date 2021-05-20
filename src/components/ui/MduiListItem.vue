<template>
    <li class="mdui-list-item mdui-ripple">
        <i class="mdui-list-item-icon mdui-icon material-icons" v-if="icon">{{icon}}</i>
        <div class="mdui-list-item-content">
            <slot></slot>
        </div>
    </li>
</template>

<script>
export default {
    name: 'mduiListItem',
    props: ['icon', 'dense']
}
</script>

<style>

</style>