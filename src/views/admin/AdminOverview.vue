<template>
  <div>
    <config-node-group :items="config" @node-change="nodeChange" />
  </div>
</template>

<script setup lang="ts">
import ConfigNodeGroup from '@/components/common/ConfigNode/ConfigNodeGroup.vue'
const config: ConfigNodeGroupModel[] = reactive([
  {
    name: '基础配置',
    nodes: [
      {
        name: 'REG_CODE',
        inputType: 'text',
        title: '注册邀请码',
        value: '114514',
        describe: '当开启“邀请码注册”时，游客注册账号所需的邀请码'
      },
      {
        name: 'ENABLE_EMAIL_REG',
        inputType: 'switch',
        title: '启用邮箱注册',
        describe: '允许使用邮箱注册',
        value: true
      },
      {
        name: 'ENABLE_EMAIL_REG',
        inputType: 'switch',
        title: '启用邀请码注册',
        describe: '允许使用邀请码注册',
        value: false
      }
    ]
  },
  {
    name: '基础配置',
    nodes: [
      
      {
        name: 'SYNC_INTERVAL',
        inputType: 'text',
        title: '自动同步间隔',
        describe: '文件记录服务与存储服务文件信息自动执行同步的间隔。\n单位：分钟，-1关闭',
        value: '-1'
      }
    ]
  }
] as ConfigNodeGroupModel[])

const nodeMap:{[key: string]: ConfigNodeModel } = {}
config.flatMap(e => e.nodes).forEach(e => {
  if (nodeMap[e.name]) {
    console.warn('存在冲突的配置节点：' + e.name)
  }
  nodeMap[e.name] = e
})

const nodeChange = (e: any) => {
  nodeMap[e.name].value = e.value
  console.log(`配置变更：${e.name} 值：${e.value}`)
}
</script>

<script lang="ts">
import type { ConfigNodeModel, ConfigNodeGroupModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive } from 'vue'

export default defineComponent({
  name: 'AdminOverview'
})
</script>