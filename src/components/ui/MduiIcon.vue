<template>
    <i class="mdui-icon material-icons" :style="style">{{icon}}</i>
</template>

<script>
export default {
    name: 'MduiIcon',
    props: {
        icon: {
            type: String,
            default: ''
        },
        size: {
            type: Number
        }
    },
    computed: {
        style() {
            if (this.size) {
                return {
                    'font-size': this.size + 'px'
                }
            } else {
                return {}
            }
        }
    }
}
</script>

<style scoped>
.mdui-icon {
    user-select: none;
}
</style>
