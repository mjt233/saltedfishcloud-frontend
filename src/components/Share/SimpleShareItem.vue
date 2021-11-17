<template>
    <mdui-panel-item>
        <template slot="header">
            <div class="share-item-header">
                <div class="share-item-name">
                    <i class="share-file-icon" :class="classObj"></i>
                    <span>{{shareInfo.name}}</span>
                </div>
                <div class="share-item-date light-text">
                    到期日期：
                    <span v-if="shareInfo.expiredAt">{{shareInfo.expiredAt | formatDate}}</span>
                    <span v-else>永久</span>
                </div>
            </div>
        </template>
        <div class="mdui-typo">
            <p>分享链接：<a target="_blank" :href="shareLink">{{shareLink}}</a></p>
            <p v-if="shareInfo.validateSuccess">{{shareInfo.extractCode ? '提取码：' + shareInfo.extractCode : '未设置提取码'}}</p>
            <mdui-btn @click="deleteShare" :themeColor="false" class=" mdui-valign mdui-color-red" dense><mdui-icon :size="18" :icon="'delete_forever'"></mdui-icon>取消分享</mdui-btn>
        </div>
    </mdui-panel-item>
</template>

<script>
import mdui from 'mdui'
import MduiBtn from '../ui/MduiBtn.vue'
import MduiIcon from '../ui/MduiIcon.vue'
import MduiPanelItem from '../ui/MduiPanelItem.vue'

export default {
    components: { MduiPanelItem, MduiBtn, MduiIcon },
    name: 'simpleShareItem',
    props: {
        shareInfo: {
            type: Object
        }
    },
    computed: {
        classObj() {
            const baseObj = {
                dir: this.shareInfo.type == 'DIR',
                file: this.shareInfo.type == 'FILE'
            }
            if (this.shareInfo.type == 'FILE') {
                baseObj['type-' + this.shareInfo.name.split('.').pop()] = true
            }
            return baseObj
        },
        shareLink() {
            return `${location.origin}/#/s/${this.shareInfo.id}/${this.shareInfo.verification}`
        }
    },
    methods: {
        deleteShare() {
            mdui.confirm('确定要取消分享吗？该操作无法撤销', '取消确认', () => {
                this.$emit('deleteShare', this.shareInfo)
            })
        }
    }
}
</script>

<style scoped lang="less">
.share-file-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-size: 24px 24px;
    margin-right: 12px;
    background-position: center center;
    background-repeat: no-repeat;
}
.share-item-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.share-item-name {
    display: flex;
    align-items: center;
}
.share-item-date {
    width: 150px;
    @media (max-width: 640px) {
        display: none;
    }
}
</style>
