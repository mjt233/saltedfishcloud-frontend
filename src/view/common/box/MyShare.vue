<template>
    <container>
        <div>
            <h5 class="title-group"><mdui-btn @click="$router.push('/box')" :icon="'keyboard_backspace'"></mdui-btn><span>我的分享</span></h5>
            <mdui-hr style="margin-bottom: 22px"></mdui-hr>
            <my-share-list style="min-height: 320px" :uid="userInfo.id"></my-share-list>
        </div>
    </container>
</template>

<script>
import Container from '@/components/layout/Container.vue'
import MyShareList from '@/components/Share/MyShareList.vue'
export default {
    components: {
        Container,
        MyShareList
    },
    name: 'myShare',
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    }
}
</script>


<style lang="less" scoped>
.title-group {
    display: flex;
    align-items: center;
    >* {
        margin-right: 10px;
    }
}
</style>
