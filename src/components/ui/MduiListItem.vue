<template>
    <li class="mdui-list-item mdui-ripple" :class="{'mdui-list-item-active': active}">
        <i class="mdui-list-item-icon mdui-icon material-icons" v-if="icon">{{icon}}</i>
        <div class="mdui-list-item-content">
            <slot></slot>
        </div>
    </li>
</template>

<script>
export default {
    name: 'mduiListItem',
    props: {
        'icon': {
            type: String,
            default: null
        },
        'dense': {
            type: Boolean,
            default: false
        },
        'active': {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style>

</style>