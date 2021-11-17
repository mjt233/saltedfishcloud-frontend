<template>
    <div class="mdui-panel" :mdui-panel="option">
        <slot></slot>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mduiPanel',
    props: {
        accordion: {
            type: Boolean
        }
    },
    watch: {
        accordion() {
            mdui.mutation(this.$el)
        }
    },
    mounted() {
        mdui.mutation(this.$el)
    },
    computed: {
        option() {
            return JSON.stringify({
                accordion: !!((this.accordion == '' || this.accordion))
            })
        }
    }
}
</script>

<style>

</style>
