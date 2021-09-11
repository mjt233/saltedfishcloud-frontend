<template>
    <i class="mdui-icon material-icons">{{icon}}</i>
</template>

<script>
export default {
    name: 'MduiIcon',
    props: {
        icon: {
            type: String,
            default: ''
        }
    }
}
</script>

<style scoped>
.mdui-icon {
    font-size: inherit;
    user-select: none;
}
</style>
