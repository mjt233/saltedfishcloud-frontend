<template>
    <div class="mdui-drawer" ref="drawer">
        <slot></slot>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mduiDrawer',
    data() {
        return {
            drawer: null
        }
    },
    mounted() {
        this.drawer = new mdui.Drawer(this.$refs.drawer)
    },
    methods: {
        tryClose() {
            if (document.documentElement.offsetWidth < 1024) {
                this.close()
            }
        },
        close() {
            this.drawer.close()
        },
        toggle() {
            this.drawer.toggle()
        },
        open() {
            this.drawer.open()
        }

    }
}
</script>

<style>

</style>
