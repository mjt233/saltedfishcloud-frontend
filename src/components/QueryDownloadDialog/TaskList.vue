<template>
    <div>
        <p v-show="data.length == 0" style="text-align: center">暂无数据</p>
        <mdui-card v-for="item in data" :key="item.id" class="task-card">
            <div class="task-info">
                <div :class="`file type-${getSuffix(item.name)} file-icon`"></div>
                <div class="details">
                    <p class=" mdui-text-color-theme">
                        <span class="file-name">{{item.name}}</span>
                        <!-- 已完成任务的任务状态 -->
                        <span class="task-state" v-show="item.state !== 'DOWNLOADING'">{{item.state | state}}</span>
                    </p>
                    <p class="url"><a :href="item.url">{{item.url}}</a></p>
                    <!-- 下载中任务的速度和大小显示 -->
                    <p class="size" >{{item.speed | formatSize}}/s - {{item.loaded | formatSize}}，{{item.size == -1 ? '未知' : item.size | formatTotalSize}}</p>

                    <!-- 对下载中任务显示的大小显示，进度条，取消按钮 -->
                    <template v-if="item.state === 'DOWNLOADING'">
                        <p class="size">{{item | sizeAndDate}}</p>
                        <p style="height: var(--line-height)"><mdui-progress :unknow="item.size == -1" :value="(item.loaded/item.size)*100"></mdui-progress></p>
                        <mdui-btn dense :themeColor="true" @click="$emit('cancel', item)">取消</mdui-btn>
                    </template>
                </div>
            </div>
        </mdui-card>
    </div>
</template>

<script>
import '@/css/FileIcon.css'
import MduiCard from '../ui/MduiCard.vue'
import MduiProgress from '../ui/MduiProgress.vue'
import StringFormatter from '@/utils/StringFormatter'
import MduiBtn from '../ui/MduiBtn.vue'
export default {
    components: { MduiCard, MduiProgress, MduiBtn },
    name: 'TaskList',
    props: {
        data: {
            type: Array,
            default: () => []
        }
    },
    filters: {
        sizeAndDate(item) {
            try {
                const size = item.size == -1 ? '未知' : '共' + StringFormatter.toSize(item.size)
                const date = '结束时间:' + StringFormatter.toDate(item.finishAt)
                return size + ' ' + date
            } catch (err) {
                return '出错'
            }
        },
        formatSize(input) {
            return StringFormatter.toSize(input)
        },
        formatTotalSize(input) {
            return '共' + StringFormatter.toSize(input)
        },
        state(input) {
            switch (input) {
            case 'FINISH': return '完成'
            case 'CANCEL': return '已取消'
            case 'FAILED': return '失败'
            default:
                return input
            }
        }
    },
    methods: {
        getSuffix(name) {
            if (!name) return ''
            return name.split('.').pop()
        }
    }
}
</script>

<style lang="less" scoped>
.file-icon {
    --size: 36px;
    position: relative;
    height: calc(var(--size) + 12px);
    width: calc(var(--size) + 12px);
    margin-right: 16px;
    background-size: var(--size) var(--size);
    background-repeat: no-repeat;
    background-position: center;
    user-select: none;
}
.task-card {
    width: calc(100% - 10px);
    margin: 10px auto;
}
.task-info {
    display: flex;
    justify-content: flex-start;
    >* {
        flex-shrink: 0;
    }
    p {
        margin: 0;
    }
    .url {
        word-break: break-all;
        color: rgb(80, 80, 80);
        max-width: 100%;
        height: 24px;
        >* {
            display: inline-block;
            width: 100%;
            color: inherit;
            overflow-x: hidden;
            text-overflow:ellipsis;
            white-space:nowrap
        }
    }
    .file-name {
        width: 100%;
        font-weight: 500;
        text-overflow:ellipsis;
        white-space:nowrap;
        overflow: hidden;
    }
    .size {
        font-size: 14px;
        color: rgb(80, 80, 80);
        margin: 14px 0 !important;
    }
    .details {
        --line-height: 24px;
        flex: 1;
        width: 0;
        margin-right: 12px;
        line-height: var(--line-height);
        .task-state {
            color: rgb(90, 90, 90);
        }
    }
}
</style>
