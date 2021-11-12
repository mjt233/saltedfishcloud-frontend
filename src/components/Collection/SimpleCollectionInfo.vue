<template>
    <mdui-card v-if="info" class="simple-collection-info mdui-ripple">
        <p class="header">
            <span class="title">{{info.title}}</span>
            <span class="state">
                状态：
                <span :class="{'mdui-text-color-green': info.state === 'OPEN', 'mdui-text-color-red': info.state === 'CLOSED'}">
                    {{info.state === 'OPEN' ? '收集中': '已关闭'}}
                </span>
            </span>
        </p>
        <mdui-hr style="margin-bottom: 10px"></mdui-hr>
        <p>剩余可接受文件数：{{info.available}}</p>
        <p class="light-text">创建日期：{{info.createdAt | date}}</p>
        <p class="light-text">过期日期：{{info.expiredAt | date}}</p>
    </mdui-card>
</template>

<script>
import StringFormatter from '@/utils/StringFormatter'
import MduiCard from '@/components/ui/MduiCard.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
export default {
    components: { MduiCard, MduiHr },
    name: 'simpleCollectionInfo',
    props: {
        info: {
            type: Object
        }
    },
    filters: {
        date(input) {
            return StringFormatter.toDate(input)
        }
    }
}
</script>

<style lang="less" scoped>
.light-text {
    color: darkgray;
    font-size: 12px;
}
.simple-collection-info {
    display: inline-block;
    width: 280px;
    transition: all .2s;
    // margin: 0 20px;
    p {
        margin: 0;
    }
    &:hover {
        transform: translateY(-10px);
        box-shadow: 0px 10px 10px darkgray;
    }
    .title {
        font-size: 16px;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .state {
        font-size: 12px;
    }
}
</style>
