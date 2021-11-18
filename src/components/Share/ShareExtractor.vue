<template>
    <mdui-card
        class="resource-extractor"
        :avatar="shareInfo.imgUrl"
        :title="shareInfo.username + '分享的文件：' + shareInfo.name"
        :subtitle="'创建于：' + fmtDate(shareInfo.createdAt)"
    >
        <div class="mdui-container mdui-typo">
            <mdui-row class="input-field">
                <mdui-col :xs="12">
                    <p>
                        <span style="font-weight: 900">请输入提取码</span>
                        <span v-show="msg" class="mdui-text-color-red"> ({{msg}})</span>
                    </p>
                </mdui-col>
                <mdui-col :xs="8" :sm="9">
                    <mdui-input @keypress.native.enter="$emit('extract', code)" :autocomplete="false" v-model="code" :floatLabel="false" :placeholder="'提取码'"></mdui-input>
                </mdui-col>
                <mdui-col :xs="4" :sm="3">
                    <mdui-btn style="top: 16px" @click="$emit('extract', code)">提取文件</mdui-btn>
                </mdui-col>
            </mdui-row>
        </div>
    </mdui-card>
</template>

<script>
import StringFormatter from '@/utils/StringFormatter'
export default {
    name: 'shareExtractor',
    props: ['shareInfo', 'msg'],
    data() {
        return {
            code: ''
        }
    },
    methods: {
        fmtDate(i) {
            return StringFormatter.toDate(i)
        }
    }
}
</script>

<style scoped>

.resource-extractor {
    margin: 0 auto;
    width: 100%;
    max-width: 640px;
    top: 5vh;
}
</style>
