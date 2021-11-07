<template>
    <div class="collection-field">
        <p>名称：{{info.name}} 类型：{{info.type == 'TEXT' ? '普通文本框' : '下拉选择框'}}</p>
    </div>
</template>

<script>
export default {
    name: 'simpleCollectionField',
    props: {
        info: {
            type: Object
        }
    }
}
</script>

<style lang="less" scoped>
.collection-field {
    p {}
}
</style>
