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
      <v-tabs-window-item v-if="canPreview" value="preview">
        <div class="pa-4">
          <template v-if="item.fileType == 'audio'">
            <audio
              controls
              :src="SfcUtils.getApiUrl(DataManagerAPI.download(item.id))"
              style="width: 100%"
            />
          </template>
          <template v-else-if="item.fileType == 'video'">
            <video
              controls
              :src="SfcUtils.getApiUrl(DataManagerAPI.download(item.id))"
              style="width: 100%"
            />
          </template>
          <template v-else-if="item.fileType == 'image'">
            <v-img :src="SfcUtils.getApiUrl(DataManagerAPI.download(item.id))" contain style="width: 100%" />
          </template>
          <!-- 文本文件预览 -->
          <template v-else-if="item.fileType == 'text'">
            <!-- 加载中 -->
            <div v-if="textLoading" class="d-flex justify-center align-center" style="min-height: 200px">
              <v-progress-circular indeterminate color="primary" />
              <span class="ml-3">正在加载文本内容...</span>
            </div>
            <!-- 加载失败 -->
            <div v-else-if="textLoadError" class="d-flex justify-center align-center" style="min-height: 200px">
              <v-icon
                color="error"
                class="mr-2"
              >
                mdi-alert-circle
              </v-icon>
              <span>文本内容加载失败</span>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                class="ml-2"
                @click="loadTextContent"
              >
                重试
              </v-btn>
            </div>
            <!-- 文件过大，等待用户确认 -->
            <div
              v-else-if="!textLoaded && !textLoadConfirmed && Number(item.fileSize || 0) > TEXT_PREVIEW_SIZE_THRESHOLD"
              class="d-flex flex-column align-center justify-center"
              style="min-height: 200px"
            >
              <v-icon
                color="warning"
                size="48"
                class="mb-2"
              >
                mdi-file-alert-outline
              </v-icon>
              <div class="text-body-1 mb-3">
                文本文件内容过大（{{ StringFormatter.toSize(item.fileSize) }}），是否继续预览？
              </div>
              <v-btn
                color="primary"
                variant="tonal"
                @click="loadTextContent"
              >
                继续预览
              </v-btn>
            </div>
            <!-- 文本内容展示 -->
            <div v-else>
              <component
                :is="CodeEditorComp"
                :model-value="textContent"
                :read-only="true"
                :word-wrap="true"
                style="height: 60vh"
              />
            </div>
          </template>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, watch } from 'vue'
import type { PropType } from 'vue'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { DataManagerAPI } from '../api'
import type { InvalidDataRecord, ClaimRecord, FileMetadataDefine, FileTypeCheckResult } from '../model'
import { statusOptions } from '../composables/useInvalidDataList'

/** 文本预览大小阈值：2MiB */
const TEXT_PREVIEW_SIZE_THRESHOLD = 2 * 1024 * 1024

const SfcUtils = window.SfcUtils

/** CodeEditor组件引用，通过window.Components全局注册 */
const CodeEditorComp = window.Components.CodeEditor

/** 当前激活的页签，'basic' 为基础信息，'type' 为类型信息 */
const activeTab = ref('basic')

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

/** 文本预览内容 */
const textContent = ref('')

/** 文本内容是否正在加载中 */
const textLoading = ref(false)

/** 用户是否已确认加载大文件 */
const textLoadConfirmed = ref(false)

/** 文本内容是否已加载完成 */
const textLoaded = ref(false)

/** 文本加载是否出错 */
const textLoadError = ref(false)

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
 * 加载文本文件内容用于预览
 * 若文件大于2MiB，先弹出确认对话框让用户决定是否继续加载
 */
const loadTextContent = async() => {
  // 已加载或正在加载时跳过
  if (textLoaded.value || textLoading.value) return

  // 文件大于2MiB且用户未确认时，弹出确认对话框
  const fileSize = Number(props.item.fileSize) || 0
  if (fileSize > TEXT_PREVIEW_SIZE_THRESHOLD && !textLoadConfirmed.value) {
    try {
      const sizeText = StringFormatter.toSize(fileSize)
      await SfcUtils.confirm(
        `文本文件大小为 ${sizeText}，内容过大，是否继续预览？`,
        '文件过大提示',
        { cancelToReject: true, confirmBtnText: '继续预览', cancelBtnText: '取消' }
      )
      textLoadConfirmed.value = true
    } catch {
      // 用户取消，不加载
      return
    }
  }

  // 加载文本内容
  textLoading.value = true
  textLoadError.value = false
  try {
    // 使用 responseType: 'text' 强制获取原始文本，避免 axios 自动解析 JSON
    const res = await SfcUtils.request({ ...DataManagerAPI.download(props.item.id), responseType: 'text' })
    textContent.value = res.data as string
    textLoaded.value = true
  } catch (err) {
    console.error('文本预览加载失败:', err)
    textLoadError.value = true
  } finally {
    textLoading.value = false
  }
}

/** 监听预览页签激活，当切换到预览页签且为文本类型时自动加载 */
watch(activeTab, (tab) => {
  if (tab === 'preview' && props.item.fileType === 'text') {
    loadTextContent()
  }
})

/**
 * 监听 item 变化，重置文本预览状态
 * 当抽屉中切换查看不同记录时，需要清除上一条记录的预览数据。
 * 若当前已在预览页签，则自动加载新记录的文本内容。
 */
watch(() => props.item.id, () => {
  textContent.value = ''
  textLoading.value = false
  textLoadConfirmed.value = false
  textLoaded.value = false
  textLoadError.value = false
  // 重置认领记录
  claims.value = []
  // 若当前已在预览页签且新记录为文本类型，自动加载新内容
  if (activeTab.value === 'preview') {
    if (props.item.fileType === 'text') {
      loadTextContent()
    } else {
      // 新记录不是可预览类型，回到基础信息页签
      activeTab.value = 'basic'
    }
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
