<template>
  <div>
    <v-list density="compact">
      <v-list-item title="ID" :subtitle="item.id" />
      <v-list-item title="存储模式" :subtitle="item.storeMode" />
      <v-list-item title="类型" :subtitle="item.type === 'INVALID_FILE_RECORD' ? '失效文件记录' : '失效物理存储'" />
      <v-list-item title="状态" :subtitle="getStatusText(item.status)" />
      <v-list-item title="物理路径" :subtitle="item.storagePath" />
      <v-list-item title="网盘路径" :subtitle="item.diskPath || '-'" />
      <v-list-item title="文件大小" :subtitle="StringFormatter.toSize(item.fileSize)" />
      <v-list-item title="MD5" :subtitle="item.md5 || '-'" />
      <v-list-item title="是否待识别" :subtitle="item.needIdentify ? '是' : '否'" />
      <v-list-item title="文件类型" :subtitle="item.fileType || '-'" />
      <v-list-item title="创建时间" :subtitle="formatDate(item.createAt)" />
      <v-list-item title="最后修改时间" :subtitle="formatDate(item.lastModified)" />
      <div v-if="item.metadata" class="mt-4">
        <strong>元数据：</strong>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">{{ item.metadata }}</pre>
      </div>
    </v-list>

    <div v-if="claims.length > 0" class="mt-4">
      <div class="text-h6 mb-2">
        认领记录
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th>认领人UID</th>
            <th>目标UID</th>
            <th>保存路径</th>
            <th>文件名</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in claims" :key="c.id">
            <td>{{ c.targetUid }}</td>
            <td>{{ c.targetUid === 0 ? '公共网盘' : c.targetUid }}</td>
            <td>{{ c.savePath }}</td>
            <td>{{ c.fileName }}</td>
            <td>{{ formatDate(c.createAt) }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue'
import type { PropType } from 'vue'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { DataManagerAPI } from '../api'
import type { InvalidDataRecord, ClaimRecord } from '../model'
import { statusOptions } from '../composables/useInvalidDataList'

const SfcUtils = window.SfcUtils

/** 组件属性 */
const props = defineProps({
  /**
   * 要查看详情的失效数据记录
   */
  item: {
    type: Object as PropType<InvalidDataRecord>,
    required: true
  }
})

/** 当前记录的认领记录列表 */
const claims = ref<ClaimRecord[]>([])

/**
 * 格式化日期为本地化字符串
 * @param d ISO日期字符串
 * @returns 格式化后的日期字符串，若为空则返回 '-'
 */
const formatDate = (d: string) => {
  if (!d) return '-'
  return new Date(d).toLocaleString()
}

/**
 * 根据状态值获取中文显示文本
 * @param status 状态值
 * @returns 对应的中文标题
 */
const getStatusText = (status: string) => {
  return statusOptions.find(opt => opt.value === status)?.title || status
}

/** 组件挂载后加载认领记录 */
onMounted(async() => {
  const item = props.item
  if (item.status === 'CLAIMED' || item.status === 'PUBLISHED' || item.status === 'COMPLETED') {
    try {
      claims.value = (await SfcUtils.request(DataManagerAPI.getClaims(item.id))).data.data
    } catch (err) {
      console.error(err)
    }
  }
})
</script>


<script lang="ts">
export default defineComponent({
  name: 'InvalidDataDetail'
})
</script>
