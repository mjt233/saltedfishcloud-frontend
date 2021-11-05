<template>
    <container>
        <mdui-card class="mdui-typo">
            <h5>百宝箱</h5>
            <mdui-hr></mdui-hr>
            <square-item-list ref="itemList" class="tools" :size="itemSize">
                <square-item :title="'文件收集'" @click.native="$router.push('/box/collection')">
                    <i class="mdui-icon material-icons big-icon mdui-text-color-theme-400">archive</i>
                </square-item>
            </square-item-list>
        </mdui-card>
    </container>
</template>

<script>
import Container from '@/components/layout/Container.vue'
import MduiCard from '@/components/ui/MduiCard.vue'
import SquareItemList from '@/components/ui/SquareItem/SquareItemList.vue'
import SquareItem from '@/components/ui/SquareItem/SquareItem.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
export default {
    components: {
        Container,
        MduiCard,
        SquareItemList,
        SquareItem,
        MduiHr
    },
    name: 'boxIndex',
    data() {
        return {
            itemSize: 120
        }
    },
    mounted() {
        this.updateItemSize()
        window.addEventListener('resize', this.updateItemSize)
    },
    destroyed() {
        window.removeEventListener('resize', this.updateItemSize)
    },
    methods: {
        updateItemSize() {
            const w = this.$refs.itemList.$el.clientWidth
            if (w <= 400) {
                this.itemSize = w / 3 - 10
            } else {
                this.itemSize = 120
            }
        }
    }
}
</script>

<style lang="less" scoped>
.tools {
    margin: 24px 0;
    user-select: none;
    >* {
        transition: all .2s;
    }
    >*:hover {
        background-color: #eee;
        cursor: pointer;
    }
}
.big-icon {
    font-size: 56px;
    @media (max-width:460px) {
        font-size: 48px
    }
}
</style>
