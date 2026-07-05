<template>
  <div class="pa-4">
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
      v-else-if="!textLoaded && !textLoadConfirmed && isLargeFile"
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
        :is="MarkdownView"
        :content="mdContent"
        :show-line-numbers="true"
        style="height: 60vh;overflow: auto;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { PropType } from 'vue'
import { StringFormatter } from 'sfc-common'
import { DataManagerAPI } from '../../api'
import type { InvalidDataRecord } from '../../model'

/** 文本预览大小阈值：2MiB */
const TEXT_PREVIEW_SIZE_THRESHOLD = 2 * 1024 * 1024

const SfcUtils = window.SfcUtils

const MarkdownView = window.Components.MarkdownView

/** 组件属性 */
const props = defineProps({
  /**
   * 要预览的失效数据记录
   */
  item: {
    type: Object as PropType<InvalidDataRecord>,
    required: true
  }
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

/** 判断文件是否超过预览大小阈值 */
const isLargeFile = computed(() => Number(props.item.fileSize || 0) > TEXT_PREVIEW_SIZE_THRESHOLD)

/** 通过Markdown代码块显示的文本内容 */
const mdContent = computed(() => {
  return '```text\n' + textContent.value + '\n```'
})

/**
 * 加载文本文件内容用于预览
 * 若文件大于2MiB，先弹出确认对话框让用户决定是否继续加载
 */
const loadTextContent = async() => {
  // 已加载或正在加载时跳过
  if (textLoaded.value || textLoading.value) return

  // 文件大于2MiB且用户未确认时，弹出确认对话框
  if (isLargeFile.value && !textLoadConfirmed.value) {
    try {
      const sizeText = StringFormatter.toSize(Number(props.item.fileSize))
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

/**
 * 监听 item 变化，重置文本预览状态
 * 当切换查看不同记录时，需要清除上一条记录的预览数据并自动加载新内容
 */
watch(() => props.item.id, () => {
  textContent.value = ''
  textLoading.value = false
  textLoadConfirmed.value = false
  textLoaded.value = false
  textLoadError.value = false
  // 自动加载新记录的文本内容
  loadTextContent()
})

/** 组件挂载后自动加载文本内容 */
onMounted(() => {
  loadTextContent()
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TextPreviewer'
})
</script>
