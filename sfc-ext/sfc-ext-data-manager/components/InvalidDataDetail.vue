<template>
  <div>
    <v-tabs v-model="activeTab" density="compact">
      <v-tab value="basic">
        基础信息
      </v-tab>
      <v-tab value="type" :disabled="!typeCheckDetail">
        类型信息
      </v-tab>
      <v-tab v-if="canPreview" value="preview">
        预览
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- 基础信息页签 -->
      <v-tabs-window-item value="basic">
        <!-- 基础信息 - 多列网格布局 -->
        <v-row class="mt-1">
          <!-- 左列：核心元数据 -->
          <v-col cols="12" sm="6">
            <v-list density="compact">
              <v-list-item title="ID" :subtitle="item.id" />
              <v-list-item title="类型" :subtitle="item.type === 'INVALID_FILE_RECORD' ? '失效文件记录' : '失效物理存储'" />
              <v-list-item>
                <v-list-item-title>状态</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="statusChipColor[item.status]" size="x-small" variant="tonal">
                    {{ getStatusText(item.status) }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item title="创建时间" :subtitle="formatDate(item.createAt)" />
              <v-list-item title="最后修改时间" :subtitle="formatDate(item.lastModified)" />
            </v-list>
          </v-col>

          <!-- 右列：文件属性 -->
          <v-col cols="12" sm="6">
            <v-list density="compact">
              <v-list-item title="存储模式" :subtitle="item.storeMode" />
              <v-list-item title="文件大小" :subtitle="StringFormatter.toSize(item.fileSize)" />
              <v-list-item title="文件类型" :subtitle="item.fileType || '-'" />
              <v-list-item title="MD5">
                <template #subtitle>
                  <span v-if="item.md5" :title="item.md5">{{ item.md5 }}</span>
                  <span v-else class="text-disabled">-</span>
                </template>
              </v-list-item>
              <v-list-item title="是否待识别" :subtitle="item.needIdentify ? '是' : '否'" />
            </v-list>
          </v-col>

          <!-- 通栏：长文本路径 -->
          <v-col cols="12">
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>物理路径</v-list-item-title>
                <v-list-item-subtitle class="text-wrap" style="word-break: break-all">
                  {{ item.storagePath || '-' }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>网盘路径</v-list-item-title>
                <v-list-item-subtitle class="text-wrap" style="word-break: break-all">
                  {{ item.diskPath || '-' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- 认领记录 -->
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
      </v-tabs-window-item>

      <!-- 类型信息页签 -->
      <v-tabs-window-item value="type">
        <div v-if="typeCheckDetail">
          <v-list density="compact">
            <v-list-item title="类型名称" :subtitle="typeCheckDetail.typeName || '-'" />
            <v-list-item title="类型标识" :subtitle="typeCheckDetail.typeId || '-'" />
            <v-list-item title="提供者" :subtitle="typeCheckDetail.providerId || '-'" />
            <v-list-item title="文件拓展名" :subtitle="typeCheckDetail.detail?.extension || '-'" />
            <v-list-item title="MIME类型" :subtitle="typeCheckDetail.detail?.mimetype || '-'" />
            <v-list-item title="提示信息" :subtitle="typeCheckDetail.detail?.message || '-'" />
          </v-list>
          <div v-if="typeCheckDetail.detail?.metadata && metadataDefines.length > 0" class="mt-2">
            <strong>元数据</strong>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>值</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="def in metadataDefines" :key="def.key">
                  <td>{{ def.name }}</td>
                  <td>{{ typeCheckDetail.detail.metadata[def.key] ?? '-' }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-tabs-window-item>
      <!-- 预览页签 -->
      <v-tabs-window-item ref="previewTabRef" value="preview">
        <InvalidDataPreviewer :item="item" :drawer-visible="drawerVisible" />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, watch, nextTick } from 'vue'
import type { PropType } from 'vue'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import type { InvalidDataRecord, ClaimRecord, FileMetadataDefine, FileTypeCheckResult } from '../model'
import { DataManagerAPI } from '../api'
import { statusOptions } from '../composables/useInvalidDataList'
import { InvalidDataPreviewer } from './InvalidDataPreviewer'

const SfcUtils = window.SfcUtils

/** 当前激活的页签，'basic' 为基础信息，'type' 为类型信息 */
const activeTab = ref('basic')

/** 预览页签的 DOM 引用，用于限定 media 元素查询范围 */
const previewTabRef = ref<{ $el: HTMLElement }>()

/** 状态标签颜色映射 */
const statusChipColor: Record<string, string> = {
  PENDING: 'warning',
  PUBLISHED: 'info',
  CLAIMED: 'primary',
  COMPLETED: 'success'
}

/** 是否支持预览 */
const canPreview = computed(() => {
  const previewableTypes = ['audio', 'video', 'image', 'text']
  return props.item.fileType ? previewableTypes.includes(props.item.fileType) : false
})

/** 解析后的类型检测结果 */
const typeCheckDetail = computed(() => {
  if (!props.item.typeCheckResult) return null
  try {
    return JSON.parse(props.item.typeCheckResult) as FileTypeCheckResult
  } catch {
    return null
  }
})

/** 组件属性 */
const props = defineProps({
  /**
   * 要查看详情的失效数据记录
   */
  item: {
    type: Object as PropType<InvalidDataRecord>,
    required: true
  },
  /**
   * 文件类型的元数据定义列表，用于展示元数据的名称
   */
  metadataDefines: {
    type: Array as PropType<FileMetadataDefine[]>,
    default: () => []
  },
  /**
   * 抽屉是否可见，用于在抽屉关闭时暂停或释放预览的资源
   */
  drawerVisible: {
    type: Boolean,
    default: true
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

/**
 * 监听 item 变化，重置认领记录
 * 当抽屉中切换查看不同记录时，需要清除上一条记录的数据。
 */
watch(() => props.item.id, () => {
  // 重置认领记录
  claims.value = []
})

/**
 * 监听页签切换，当切换到预览页签时强制 audio/video 元素重建 controls。
 * 根因：v-tabs-window-item 隐藏内容时 media 元素宽度塌陷，其 shadow DOM 中的
 * controls 控制栏随之塌陷为一条竖线。切换回来后仅靠 reflow 无法恢复 shadow DOM
 * 内部布局，必须移除再重新添加 controls 属性来触发 shadow DOM 重建。
 */
watch(activeTab, async(newTab) => {
  if (newTab === 'preview') {
    // 等待 v-tabs-window 的过渡动画完成
    await SfcUtils.sleep(300)
    // 仅在预览页签的 DOM 范围内查询 media 元素，避免影响页面其他区域
    const container = previewTabRef.value?.$el
    if (!container) return
    const mediaElements = container.querySelectorAll<HTMLMediaElement>('audio, video')
    mediaElements.forEach(el => {
      // 先移除 controls 属性，销毁旧的 shadow DOM 控制栏
      el.removeAttribute('controls')
      // 强制同步 reflow，确保浏览器提交移除操作
      void el.offsetHeight
      // 重新添加 controls，浏览器会以当前正确宽度重建 shadow DOM 控制栏
      el.setAttribute('controls', '')
    })
  }
})

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
