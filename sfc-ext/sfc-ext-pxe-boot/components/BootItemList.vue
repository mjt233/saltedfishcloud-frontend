<template>
  <VCard>
    <VCardTitle class="d-flex align-center">
      启动项管理
    </VCardTitle>
    <VCardText>
      <VBtn color="primary" @click="emit('add')">
        <VIcon class="mr-1">
          mdi-plus
        </VIcon>
        添加启动项
      </VBtn>
      <VBtn class="ml-2" @click="handlePreview">
        <VIcon class="mr-1">
          mdi-eye
        </VIcon>
        预览菜单
      </VBtn>
      <VTable>
        <thead>
          <tr>
            <th>排序</th>
            <th>名称</th>
            <th>类型</th>
            <th>资源路径</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bootItems" :key="item.id">
            <td>{{ item.sortOrder }}</td>
            <td>
              <div>{{ item.displayName }}</div>
              <div class="text-caption text-grey">
                {{ item.itemKey }}
              </div>
            </td>
            <td>
              <VChip size="small" :color="getTypeColor(item.type)">
                {{ getTypeLabel(item.type) }}
              </VChip>
            </td>
            <td class="text-truncate" style="max-width: 200px;">
              {{ item.resourcePath }}
            </td>
            <td>
              <VSwitch
                v-model="item.enabled"
                density="compact"
                hide-details
                @change="emit('toggle', item)"
              />
            </td>
            <td>
              <VBtn icon size="small" @click="emit('edit', item)">
                <VIcon>mdi-pencil</VIcon>
              </VBtn>
              <VBtn
                icon
                size="small"
                color="error"
                @click="emit('delete', item)"
              >
                <VIcon>mdi-delete</VIcon>
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
      <div v-if="bootItems.length === 0" class="text-center py-4 text-grey">
        暂无启动项，点击上方按钮添加
      </div>
    </VCardText>
  </VCard>

  <!-- 菜单预览对话框 -->
  <VDialog v-model="previewVisible" max-width="700px">
    <VCard>
      <VCardTitle>iPXE 菜单脚本预览</VCardTitle>
      <VCardText>
        <pre class="preview-code">{{ previewScript }}</pre>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="previewVisible = false">
          关闭
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
const SfcUtils = window.SfcUtils
import { BootItem } from '../model'
import { PxeBootApi } from '../api'

export default defineComponent({
  name: 'BootItemList',
  props: {
    /**
     * 当前展示的启动项列表数据
     */
    bootItems: {
      type: Array as PropType<BootItem[]>,
      required: true
    }
  },
  emits: {
    /**
     * 用户点击"添加启动项"按钮时触发
     */
    add: () => true,
    /**
     * 用户点击某条启动项的编辑按钮时触发
     * @param item 待编辑的启动项
     */
    edit: (item: BootItem) => !!item,
    /**
     * 用户点击某条启动项的删除按钮时触发
     * @param item 待删除的启动项
     */
    delete: (item: BootItem) => !!item,
    /**
     * 用户切换某条启动项的启用状态时触发
     * @param item 被切换的启动项（已更新 enabled 字段）
     */
    toggle: (item: BootItem) => !!item
  },
  setup(_, { emit }) {
    /** iPXE 菜单预览对话框是否可见 */
    const previewVisible = ref(false)
    /** 从服务端获取到的 iPXE 菜单脚本文本 */
    const previewScript = ref('')

    /**
     * 请求服务端获取 iPXE 菜单脚本预览并打开对话框
     */
    const handlePreview = async() => {
      try {
        const res = await SfcUtils.request(PxeBootApi.previewMenuScript())
        previewScript.value = res.data.data || ''
        previewVisible.value = true
      } catch (e) {
        SfcUtils.snackbar('获取预览失败')
      }
    }

    /**
     * 根据启动项类型返回对应的 Vuetify 颜色
     * @param type 启动项类型
     */
    const getTypeColor = (type: string) => {
      switch (type) {
      case 'KERNEL_INITRD': return 'blue'
      case 'ISO': return 'purple'
      case 'DIRECTORY': return 'green'
      default: return 'grey'
      }
    }

    /**
     * 根据启动项类型返回对应的中文显示标签
     * @param type 启动项类型
     */
    const getTypeLabel = (type: string) => {
      switch (type) {
      case 'KERNEL_INITRD': return '内核'
      case 'ISO': return 'ISO'
      case 'DIRECTORY': return '目录'
      default: return type
      }
    }

    return {
      emit,
      previewVisible,
      previewScript,
      handlePreview,
      getTypeColor,
      getTypeLabel
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-code {
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre;
}
</style>
