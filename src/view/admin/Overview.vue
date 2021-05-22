<template>
    <container fill :loading="loading" class="mdui-typo" >
        <div class="mdui-container">
            <div class="mdui-row">
                <div class="mdui-col-md-6">
                    <mdui-card >
                        <h3 class="mdui-text-color-theme">系统状态</h3>
                        <div class="mdui-table-fluid">
                            <table class="mdui-table" v-if="store.state">
                                <tbody>
                                    <tr>
                                        <td>存储模式</td>
                                        <td>{{store.state.store_type}}</td>
                                    </tr>
                                    <tr>
                                        <td>只读模式</td>
                                        <td>{{store.state.read_only | decodeReadOnly}}</td>
                                    </tr>
                                    <tr>
                                        <td>用户数据根</td>
                                        <td>{{store.state.store_root}}</td>
                                    </tr>
                                    <tr>
                                        <td>公共数据根</td>
                                        <td>{{store.state.public_root}}</td>
                                    </tr>
                                    <tr>
                                        <td>注册邀请码</td>
                                        <td>{{code}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </mdui-card>
                </div>
                <div class="mdui-col-md-6">
                    <mdui-card >
                        <h3 class="mdui-text-color-theme">存储统计</h3>
                        <div class="mdui-table-fluid">
                            <table class="mdui-table" v-if="store.state">
                                <tbody>
                                    <tr>
                                        <td>文件总数</td>
                                        <td>{{store.state.file_count}}</td>
                                    </tr>
                                    <tr>
                                        <td>目录总数</td>
                                        <td>{{store.state.dir_count}}</td>
                                    </tr>
                                    <tr>
                                        <td>用户数据大小</td>
                                        <td>{{store.state.total_user_size | formatSize}} ({{store.state.total_user_size}}Bytes) </td>
                                    </tr>
                                    <tr>
                                        <td>用户实际存储大小</td>
                                        <td>{{store.state.real_user_size | formatSize}} ({{store.state.real_user_size}}Bytes) </td>
                                    </tr>
                                    <tr>
                                        <td>存储复用率</td>
                                        <td>{{1 - (store.state.real_user_size/store.state.total_user_size) | toRate}} </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </mdui-card>
                </div>
            </div>
            <div class="mdui-row">
                <div class="mdui-col-xs-12">
                    <mdui-card>
                        <h4 class="mdui-text-color-theme">硬盘存储状态</h4>
                        <div class="mdui-col-md-6">
                            <div v-if="store.state">分区空间：{{store.state.store_total_space | formatSize}}<br>剩余可用：{{store.state.store_free_space | formatSize}}</div>
                            <div ref="user" style="height:360px; width: 400px;margin: 0 auto"></div>
                        </div>
                        <div class="mdui-col-md-6">
                            <div v-if="store.state">分区空间：{{store.state.public_total_space | formatSize}}<br>剩余可用：{{store.state.public_free_space | formatSize}}</div>
                            <div ref="pub" style="height:360px; width: 400px;margin: 0 auto"></div>
                        </div>
                    </mdui-card>
                </div>
            </div>
        </div>
    </container>
</template>

<script>
import API from '../../api/API'
import Container from '../../components/layout/Container.vue'
import MduiCard from '../../components/ui/MduiCard.vue'
import * as echarts from 'echarts'
import stringFormatter from '../../utils/StringFormatter';
export default {
  components: { Container, MduiCard },
    name: 'overview',
    data() {
        return {
            store: {
                state: null
            },
            code: '',
            loading: false
        }
    },
    mounted() {
        this.loadData()
    },
    filters: {
        toRate(input) {
            return (input*100).toFixed(2) + '%'
        },
        decodeReadOnly(input) {
            if (input == null) {
                return '关闭'
            } else if (input === 'DATA_MOVING'){
                return input + '(数据迁移中)'
            } else {
                return input + '(数据校验中)'
            }
        }
    },
    methods: {
        async loadData() {
            this.loading = true
            try {
                let data = (await this.$axios(API.admin.sys.getOverviewInfo())).data.data
                this.store.state = data.store
                this.code = data.invite_reg_code
            } catch (error) {
                mdui.alert(error.msg)
            } finally {
                this.loading = false
            }
            echarts.init(this.$refs.user).setOption(this.generateChartOption('用户数据根硬盘', '占用', [
                {value: this.store.state.store_total_space - this.store.state.store_free_space - this.store.state.real_user_size, name: '其他文件'},
                {value: this.store.state.store_free_space, name: '剩余空间'},
                {value: this.store.state.real_user_size, name: '用户文件占用'}
            ]))
            echarts.init(this.$refs.pub).setOption(this.generateChartOption('公共数据根硬盘', '占用', [
                {value: this.store.state.public_total_space - this.store.state.public_free_space - this.store.state.total_public_size, name: '其他文件'},
                {value: this.store.state.public_free_space, name: '剩余空间'},
                {value: this.store.state.total_public_size, name: '公共数据占用'}
            ]))
        },
        generateChartOption(title, itemTitle, data) {
            return {
                title: {
                    text: title,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: (e) => {
                        return `<span>${e.data.name}: ${stringFormatter.formatSizeString(e.data.value)}</span>`
                    }
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                },
                series: [
                    {
                        name: itemTitle,
                        type: 'pie',
                        radius: '50%',
                        data: data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'

                            }
                        }
                    }
                ]
            }
        }
    }
}
</script>

<style lang="less" scoped>
td {
    word-break : break-all;
}
</style>