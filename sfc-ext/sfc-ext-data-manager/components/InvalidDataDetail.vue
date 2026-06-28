<template>
  <div>
    <v-tabs v-model="activeTab" density="compact">
      <v-tab value="basic">
        基础信息
      </v-tab>
      <v-tab value="type">
        类型信息
      </v-tab>
      <v-tab value="claims">
        认领记录
      </v-tab>
      <v-tab value="preview">
        预览
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab" disabled>
      <!-- 基础信息页签 -->
      <v-tabs-window-item value="basic">
        <!-- 基础信息 - 多列网格布局 -->
        <v-row class="mt-1">
          <!-- 左列：核心元数据 -->
          <v-col cols="12" sm="6">
            <v-list density="compact">
              <v-list-item title="ID" :subtitle="item.id" />
              <v-list-item title="类型" :subtitle="item.type === 'PHYSICAL_STORAGE' ? '文件记录丢失' : '物理存储丢失'" />
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

      </v-tabs-window-item>

      <!-- 类型信息页签 -->
      <v-tabs-window-item value="type">
        <div v-if="!typeCheckDetail" class="text-center py-8 text-medium-emphasis">
          数据未识别或无法识别
        </div>
        <div v-else>
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
                  <th>键名（名称）</th>
                  <th>值</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="def in metadataDefines" :key="def.key">
                  <td>{{ def.key }}（{{ def.name }}）</td>
                  <td>
                    <span v-if="def.viewTag == 'span'">
                      {{ typeCheckDetail.detail.metadata[def.key] ?? '-' }}
                    </span>
                    <component 
                      :is="def.viewTag"
                      v-else
                      :model-value="typeCheckDetail.detail.metadata[def.key]"
                    >
                      {{ typeCheckDetail.detail.metadata[def.key] ?? '-' }}
                    </component>
                    
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-tabs-window-item>
      <!-- 认领记录页签 -->
      <v-tabs-window-item value="claims">
        <div v-if="claims.length > 0" class="pa-1">
          <v-card
            v-for="c in claims"
            :key="c.id"
            class="mb-2"
          >
            <v-card-text class="pa-3">
              <div class="text-caption text-medium-emphasis mb-1">
                认领人
              </div>
              <div class="text-body-2 mb-2">
                <UserCard :uid="c.uid" :name="c.uid + ''" />
              </div>
              <div class="text-caption text-medium-emphasis mb-1">
                目标
              </div>
              <div class="text-body-2 mb-2">
                <template v-if="c.targetUid == 0">
                  公共网盘
                </template>
                <UserCard v-else :name="c.targetUid + ''" :uid="c.targetUid" />
              </div>
              <v-divider class="mb-2" />
              <div class="text-caption text-medium-emphasis mb-1">
                保存路径
              </div>
              <div class="text-body-2 mb-2" style="word-break: break-all">
                {{ c.savePath }}
              </div>
              <v-divider class="mb-2" />
              <div class="text-caption text-medium-emphasis mb-1">
                文件名
              </div>
              <div class="text-body-2 mb-2" style="word-break: break-all">
                {{ c.fileName }}
              </div>
              <v-divider class="mb-2" />
              <div class="text-caption text-medium-emphasis mb-1">
                时间
              </div>
              <div class="text-body-2">
                {{ formatDate(c.createAt) }}
              </div>
              <v-divider class="mb-2" />
              <div class="text-caption text-medium-emphasis mb-1">
                状态
              </div>
              <div class="text-body-2">
                <v-chip
                  v-if="c.isRevoked"
                  color="error"
                  size="x-small"
                  variant="tonal"
                >
                  已撤回
                </v-chip>
                <v-chip
                  v-else
                  color="success"
                  size="x-small"
                  variant="tonal"
                >
                  正常
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div v-else class="text-center py-8 text-medium-emphasis">
          暂无认领记录
        </div>
      </v-tabs-window-item>
      <!-- 预览页签 -->
      <v-tabs-window-item ref="previewTabRef" value="preview">
        <div v-if="!item.fileType" class="text-center py-8 text-medium-emphasis">
          未识别的数据类型无法预览
        </div>
        <div v-else-if="!canPreview" class="text-center py-8 text-medium-emphasis">
          该类型不支持预览
        </div>
        <InvalidDataPreviewer v-else :item="item" :drawer-visible="drawerVisible" />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, watch } from 'vue'
import type { PropType } from 'vue'
import { IdType, StringFormatter } from 'sfc-common'
import type { InvalidDataRecord, ClaimRecord, FileMetadataDefine, FileTypeCheckResult } from '../model'
import { DataManagerAPI } from '../api'
import { statusOptions } from '../composables/useInvalidDataList'
import { InvalidDataPreviewer } from './InvalidDataPreviewer'
const UserCard = window.Components.UserCard

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
  const previewableTypes = ['audio', 'video', 'image', 'text', 'archive']
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

/** 已加载认领数据的记录 ID，用于避免同记录重复加载 */
let loadedClaimItemId: IdType | null = null

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
 * 加载认领记录（懒加载，仅在切换到认领页签时调用）
 */
const loadClaims = async() => {
  const itemId = props.item.id
  // 同记录已加载过，不再重复请求
  if (loadedClaimItemId == itemId) {
    return
  }
  const item = props.item
  if (item.storeMode == 'UNIQUE' && item.type == 'PHYSICAL_STORAGE' && (item.status == 'COMPLETED' || item.status == 'CLAIMED')) {
    try {
      claims.value = (await SfcUtils.request(DataManagerAPI.getClaims(itemId))).data.data
      loadedClaimItemId = itemId
    } catch (err) {
      console.error(err)
    }
  } else {
    claims.value = []
  }
}

/**
 * 监听 item 变化，清除认领记录的加载状态
 * 当抽屉中切换查看不同记录时，需要清除上一条记录的缓存，以便切换到认领页签时重新加载。
 */
watch(() => props.item.id, () => {
  claims.value = []
  if (activeTab.value == 'claims') {
    loadClaims()
  }
})

/**
 * 监听页签切换：
 * - 切换到认领页签时懒加载认领记录
 * - 切换到预览页签时强制 audio/video 元素重建 controls
 *   根因：v-tabs-window-item 隐藏内容时 media 元素宽度塌陷，其 shadow DOM 中的
 *   controls 控制栏随之塌陷为一条竖线。切换回来后仅靠 reflow 无法恢复 shadow DOM
 *   内部布局，必须移除再重新添加 controls 属性来触发 shadow DOM 重建。
 */
watch(activeTab, async(newTab) => {
  if (newTab === 'claims') {
    loadClaims()
  }
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
</script>


<script lang="ts">
export default defineComponent({
  name: 'InvalidDataDetail'
})
</script>
