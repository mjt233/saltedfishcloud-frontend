<template>
    <div class="mdui-card" :class="{'card-mini': size == 'mini', 'card-center': layout == 'center'}">
      <!-- 头部标题 -->
      <div class="mdui-card-header" v-if="(avatar || title || subtitle)" >
        <img class="mdui-card-header-avatar" v-if="avatar" :src="avatar"/>
        <div class="mdui-card-header-title" v-if="title">{{title}}</div>
        <div class="mdui-card-header-subtitle" v-if="subtitle">{{subtitle}}</div>
      </div>
      <div class="mdui-card-content">
          <slot></slot>
      </div>
    </div>
</template>

<script>
export default {
    name: 'mduiCard',
    props: {
        avatar: {
            type: String
        },
        title: {
            type: String
        },
        subtitle: {
            type: String
        },
        size: {
            //  卡片尺寸，可选mini
            type: String,
            default: ''
        },
        layout: {
            //  布局，可选center
            type: String,
            default: ''
        }
    },
    computed: {
        isMini() {
            return this.size == 'mini'
        },
        isCenter() {
            return this.layout == 'center'
        }
    }
}
</script>
<style lang="less" scoped>
.card-center {
    margin-left: auto;
    margin-right: auto;
}
.card-mini {
    max-width: 480px;
}
.mdui-card {
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>
