<template>
    <select :value="value" @change="$emit('change', $event.target.value)" class="mdui-select" :class="{'mdui-select-fixed': fixed}" mdui-select>
        <option v-for="item in options" :value="item.value" :key="item.value">{{item.label || item.value}}</option>
    </select>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mduiSelect',
    model: {
        prop: 'value',
        event: 'change'
    },
    props: {
        /**
         * 候选项对象数组，需要包含value属性，可选label
         */
        options: {
            type: Array,
            default: () => []
        },
        fixed: {
            type: Boolean,
            default: false
        },
        value: {
            type: [Number, String, Object]
        }
    },
    async mounted() {
        await this.$nextTick()
        mdui.mutation(this.$el)
    }
}
</script>

<style>
.mdui-select-fixed + .mdui-select-open .mdui-select-menu {
    position: fixed;
}
</style>
