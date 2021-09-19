<template>
    <mdui-dialog
        ref="dialog"
        :title="''"
        :disableDefBtn="true"
        @close="$emit('update:show', false)"
        @open="initTab"
        :padding="0"
        :loading="loading"
    >
        <div class="dialog-header">
            <span class="dialog-title">下载任务</span>
            <div class=" mdui-btn-group">
                <mdui-btn @click="$emit('createTask')" :themeColor="false" class="small-btn" :dense="true"><mdui-icon :icon="'add'" /></mdui-btn>
                <mdui-btn @click="refresh" :themeColor="false" class="small-btn" :dense="true"><mdui-icon :icon="'refresh'" /></mdui-btn>
            </div>
            <div class="mdui-toolbar-spacer"></div>
            <mdui-btn :icon="'close'" :themeColor="false" @click="dialog.close()"></mdui-btn>
        </div>
        <div class="dialog-body">
            <div class="mdui-tab mdui-tab-full-width" mdui-tab>
                <a ref="downloading" href="#dialog-tab1" class="mdui-ripple mdui-tab-active" @click="tab = 'DOWNLOADING'">下载中</a>
                <a href="#dialog-tab2" class="mdui-ripple" @click="tab = 'FINISH'">已完成</a>
            </div>
            <div class="list-group">
                <task-list @cancel="cancel" v-show="tab == 'DOWNLOADING'" :data="task.downloading"></task-list>
                <task-list v-show="tab == 'FINISH'" :data="task.finish"></task-list>
            </div>
        </div>
    </mdui-dialog>
</template>

<script>
import API from '@/api'
import { Throttle } from '@/utils/EventUtils'
import MduiBtn from '../ui/MduiBtn.vue'
import MduiDialog from '../ui/MduiDialog.vue'
import TaskList from './TaskList.vue'
import mdui from 'mdui'
import MduiIcon from '../ui/MduiIcon.vue'
export default {
    components: { MduiDialog, MduiBtn, TaskList, MduiIcon },
    props: {
        show: {
            default: false,
            type: Boolean
        },
        uid: {
            type: Number
        }
    },
    data() {
        return {
            dialog: null,
            loading: false,
            tabIndex: 0,
            hasOpen: false,
            task: {
                finish: [],
                downloading: [],
                totalItem: 0
            },
            page: 1,
            firstOpen: false,
            tab: 'DOWNLOADING',
            wating: false, // 等待服务器响应中
            autoFreshItv: null,
            freshItv: null,
            debouncer: new Throttle()
        }
    },
    mounted() {
        this.dialog = this.$refs.dialog
        this.dialog.update()
        this.autoFreshItv = setInterval(() => {
            if (this.show && this.tab === 'DOWNLOADING') {
                this.loadData(this.tab, this.page, false)
            }
        }, 3000)
    },
    destroyed() {
        clearInterval(this.autoFreshItv)
        if (this.freshItv) {
            clearInterval(this.freshItv)
        }
    },
    methods: {
        async refresh() {
            this.debouncer.execute(() => {
                this.loadData(this.tab, this.page)
            })
        },
        async cancel(item) {
            try {
                this.wating = this.loading = true
                await this.$axios(API.task.download.interruptTask(this.uid, item.id))
                this.wating = this.loading = false
                for (let i = 0; i < this.task.downloading.length; i++) {
                    console.log(i)
                    if (this.task.downloading[i].id == item.id) {
                        this.task.downloading.splice(i, 1)
                    }
                }
            } catch (err) {
                mdui.alert(err.msg)
                this.wating = this.loading = false
            }
        },
        /**
         * 加载任务数据
         * @param {('DOWNLOADING'|'ALL'|'FINISH')} type 任务类型
         * @param {Number} page 页码
         * @param {Boolean} handleLoading 请求时操作加载遮罩
         */
        async loadData(type = 'ALL', page, handleLoading = true) {
            if (this.wating) return
            const downloading = []
            const finish = []
            this.loading = handleLoading ? this.loading : true
            this.wating = true
            try {
                const data = (await this.$axios(API.task.download.getTaskList(this.uid, type, page, 40))).data
                this.loading = handleLoading ? this.loading : false
                this.wating = false
                data.data.forEach(e => {
                    if (e.state === 'DOWNLOADING') {
                        downloading.push(e)
                    } else {
                        finish.push(e)
                    }
                })
                this.task = {
                    downloading, finish, totalItem: data.totalItem
                }
            } catch (error) {
                this.loading = handleLoading ? this.loading : false
                this.wating = false
            }
        },
        initTab() {
            if (!this.hasOpen) {
                this.hasOpen = true
                this.$refs.downloading.click()
            }
        }
    },
    watch: {
        show() {
            if (this.show) {
                this.loadData(this.tab, 1)
                this.dialog.open()
            } else {
                this.dialog.close()
            }
        },
        tab() {
            this.loadData(this.tab, 1)
        }
    }

}
</script>

<style lang="less" scoped>
.mdui-btn-group {
    margin-left: 16px;
}
.small-btn {
    line-height: 32px;
    width: 32px;
    min-width: unset;
    height: 32px;
    padding: 0 !important;
    font-size: 15px;
}
.btn-tab {
    display: flex;
    height: 42px;
    >* {
        flex-grow: 1;
        height: 100%;
    }
}
.dialog-title {
    font-size: 18px;
    user-select: none;
}
.dialog-header {
    margin: 15px 20px 10px 20px;
    display: flex;
    align-items: center;
}
.dialog-body {
    height: 60vh;
    max-height: 60vh;
    padding: 0 20px;
    overflow: hidden;
    .list-group {
        overflow: auto;
        height: calc( 100% - 40px );
    }
}
</style>
