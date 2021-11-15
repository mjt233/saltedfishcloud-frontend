<template>
    <mdui-card v-if="info" class="simple-collection-info">
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
        <p>剩余可接受文件数：{{info.available == -1 ? '无限制' : info.available}}</p>
        <p class="light-text">创建日期：{{info.createdAt | date}}</p>
        <p class="light-text">过期日期：{{info.expiredAt | date}}</p>
        <div class="info-handler-group">
            <mdui-menu ref="menu">
                <mdui-menu-item v-show="info.state == 'OPEN'" :icon="'stop'" @click.native="$emit('stop', info.id)">停止收集</mdui-menu-item>
                <mdui-menu-item v-show="info.state == 'CLOSED'" :icon="'play_arrow'" @click.native="openCollection">重新开启</mdui-menu-item>
                <mdui-menu-item :icon="'delete_forever'" @click="deleteCollection">删除</mdui-menu-item>
            </mdui-menu>
            <mdui-btn dense @click="$emit('showDetail')">详情</mdui-btn>
            <mdui-btn dense ref="menuTrigger" @click="openMenu">操作</mdui-btn>
        </div>
    </mdui-card>
</template>

<script>
import StringFormatter from '@/utils/StringFormatter'
import MduiCard from '@/components/ui/MduiCard.vue'
import MduiHr from '@/components/ui/MduiHr.vue'
import MduiMenu from '../ui/MduiMenu.vue'
import MduiMenuItem from '../ui/MduiMenuItem.vue'
import mdui from 'mdui'
import MduiBtn from '../ui/MduiBtn.vue'
export default {
    components: {
        MduiCard,
        MduiHr,
        MduiMenu,
        MduiMenuItem,
        MduiBtn
    },
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
    },
    data() {
        return {
            menu: null
        }
    },
    mounted() {
        this.$refs.menu.$el.addEventListener('closed.mdui.menu', e => {
            this.menu = null
        })
    },
    methods: {
        openMenu() {
            if (!this.menu) {
                this.menu = new mdui.Menu(this.$refs.menuTrigger.$el, this.$refs.menu.$el, {
                    covered: false,
                    fixed: true
                })
            }
            this.menu.open()
        },
        // stopCollection() {
        //     mdui.confirm('确定要停止收集吗？你可以随时重新开启该收集', '停止确认', () => {
        //         this.$emit('stop', this.info.id)
        //     })
        // },
        openCollection() {
            const now = new Date().getTime()
            const expired = new Date(this.info.expiredAt).getTime()
            if (now > expired) {
                mdui.alert('收集已过期，无法重新开启')
            } else {
                this.$emit('open', this.info.id)
            }
        },
        deleteCollection() {
            mdui.confirm('确定要删除这个收集任务吗？（已收集的文件不会删除）', '删除确认', () => {
                this.$emit('delete', this.info.id)
            })
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
        // transform: translateY(-10px);
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
    .info-handler-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
    }
}
</style>
