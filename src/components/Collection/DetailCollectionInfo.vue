<template>
    <div v-if="info" class="mdui-typo detail-collection-info">
        <!-- <h5>基本信息</h5> -->
        <mdui-hr style="margin: 6px 0 16px 0"></mdui-hr>
        <table class="mdui-table">
            <tbody>
                <tr>
                    <td>接收链接</td>
                    <td><a target="_blank" :href="info.link">{{info.link}}</a></td>
                </tr>
                <tr>
                    <td>接收者署名</td>
                    <td>{{info.nickname}}</td>
                </tr>
                <tr>
                    <td>描述</td>
                    <td>{{!info.describe ? '无' : info.describe}}</td>
                </tr>
                <tr>
                    <td>匿名上传</td>
                    <td>{{info.allowAnonymous ? '允许' : '拒绝'}}</td>
                </tr>
                <tr>
                    <td>保存位置</td>
                    <td>
                        <a v-if="info.saveNode.startsWith('/')" href="javascript:;" @click="$emit('goto', '/private' + info.saveNode)">{{info.saveNode}}</a>
                        <span v-else><span class="mdui-text-color-red">{{info.savePathSnapshot}}</span>（已被删除）</span>
                    </td>
                </tr>
                <tr>
                    <td>最大收集次数</td>
                    <td>{{info.allowMax == -1 ? '无限制' : info.allowMax }}</td>
                </tr>
                <tr>
                    <td>剩余可接收次数</td>
                    <td>{{info.available == -1 ? '无限制' : info.available}}</td>
                </tr>
                <tr>
                    <td>状态</td>
                    <td>{{info.state == 'OPEN' ? '收集中' : '已停止收集'}}</td>
                </tr>
                <tr>
                    <td>创建日期</td>
                    <td>{{info.createdAt | toDate}}</td>
                </tr>
                <tr>
                    <td>过期日期</td>
                    <td>{{info.expiredAt | toDate}}</td>
                </tr>
            </tbody>
        </table>
        <h5>约束信息</h5>
        <mdui-hr style="margin-bottom: 24px"></mdui-hr>
        <table class=" mdui-table">
            <tbody>
                <tr>
                    <td>文件名表达式</td>
                    <td>{{info.pattern}}</td>
                </tr>
                <tr v-if="info.field">
                    <td>拓展名表达式</td>
                    <td>{{info.extPattern}}</td>
                </tr>
                <tr v-for="item in info.field" :key="item.name">
                    <td>字段</td>
                    <td>
                        <table class="mdui-table">
                            <tbody>
                                <tr>
                                    <td>名称</td>
                                    <td>{{item.name}}</td>
                                </tr>
                                <tr>
                                    <td>类型</td>
                                    <td>{{item.type == 'TEXT' ? '普通文本': '单选框'}}</td>
                                </tr>
                                <tr>
                                    <td>描述</td>
                                    <td>{{item.describe}}</td>
                                </tr>
                                <tr v-show="item.pattern">
                                    <td>约束表达式</td>
                                    <td>{{item.pattern}}</td>
                                </tr>
                                <tr v-show="item.type == 'OPTION'">
                                    <td>候选值</td>
                                    <td>
                                        <ul>
                                            <li v-for="opt in item.options" :key="opt">{{opt}}</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr>
                                    <td>默认值</td>
                                    <td>{{item.value}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import StringFormatter from '@/utils/StringFormatter'
import MduiHr from '@/components/ui/MduiHr.vue'
export default {
    components: { MduiHr },
    name: 'detailCollectionInfo',
    props: {
        info: {
            type: Object
        }
    },
    filters: {
        toDate(input) {
            return StringFormatter.toDate(input)
        }
    }
}
</script>

<style lang="less" scoped>
.detail-collection-info {
    p {
        margin: 0;
    }
    .title {
        font-size: 18px;
    }
}
</style>
<style>

</style>
