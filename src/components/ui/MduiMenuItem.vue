<template>
    <li class="mdui-menu-item">
        <a @click="$emit('click', $event)" href="javascript:;" class="mdui-ripple">
            <mdui-icon class="mdui-menu-item-icon" v-if="icon" :icon="icon"></mdui-icon>
            <slot></slot>
        </a>
    </li>
</template>

<script>
import MduiIcon from './MduiIcon.vue'
export default {
    components: {

        MduiIcon
    },
    name: 'mduiMenuItem',
    props: {
        icon: {
            type: String,
            default: ''
        }
    }
}
</script>

<style>

</style>
