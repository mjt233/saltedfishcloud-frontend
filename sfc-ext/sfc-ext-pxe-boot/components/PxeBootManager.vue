<template>
  <div class="pa-4">
    <!-- 服务状态卡片 -->
    <PxeServiceStatusCard
      class="mb-4"
      :status="status"
      :toggling="toggling"
      @toggle="toggleService"
    />

    <!-- 启动项列表 -->
    <BootItemList
      :boot-items="bootItems"
      @add="showAddDialog"
      @edit="editItem"
      @delete="deleteItem"
      @toggle="toggleItem"
    />

    <!-- 添加/编辑对话框 -->
    <BootItemFormDialog
      v-model="dialogVisible"
      :editing-item="editingItem"
      @saved="loadItems"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
const SfcUtils = window.SfcUtils
import { PxeBootApi } from '../api'
import { BootItem, PxeServiceStatus } from '../model'
import PxeServiceStatusCard from './PxeServiceStatusCard.vue'
import BootItemList from './BootItemList.vue'
import BootItemFormDialog from './BootItemFormDialog.vue'

export default defineComponent({
  name: 'PxeBootManager',
  components: {
    PxeServiceStatusCard,
    BootItemList,
    BootItemFormDialog
  },
  setup() {
    /** 当前 PXE 服务状态 */
    const status = ref<PxeServiceStatus | null>(null)
    /** 启动项列表 */
    const bootItems = ref<BootItem[]>([])
    /** 添加/编辑对话框是否可见 */
    const dialogVisible = ref(false)
    /** 当前正在编辑的启动项，null 表示新增模式 */
    const editingItem = ref<BootItem | null>(null)
    /** 服务启停按钮的加载状态 */
    const toggling = ref(false)

    /**
     * 加载服务运行状态
     */
    const loadStatus = async() => {
      try {
        const res = await SfcUtils.request(PxeBootApi.getStatus())
        status.value = res.data.data
      } catch (e) {
        console.error('加载状态失败', e)
      }
    }

    /**
     * 加载启动项列表
     */
    const loadItems = async() => {
      try {
        const res = await SfcUtils.request(PxeBootApi.listItems())
        bootItems.value = res.data.data || []
      } catch (e) {
        console.error('加载启动项失败', e)
      }
    }

    /**
     * 切换服务启停状态
     */
    const toggleService = async() => {
      toggling.value = true
      try {
        // 这里需要后端提供 start/stop API
        SfcUtils.snackbar('功能开发中')
      } finally {
        toggling.value = false
      }
    }

    /**
     * 打开新增启动项对话框
     */
    const showAddDialog = () => {
      editingItem.value = null
      dialogVisible.value = true
    }

    /**
     * 打开编辑启动项对话框
     * @param item 待编辑的启动项
     */
    const editItem = (item: BootItem) => {
      editingItem.value = item
      dialogVisible.value = true
    }

    /**
     * 删除启动项，删除前弹窗确认
     * @param item 待删除的启动项
     */
    const deleteItem = async(item: BootItem) => {
      try {
        await SfcUtils.confirm('确定删除启动项 "' + item.displayName + '"？', '')
        await SfcUtils.request(PxeBootApi.deleteItem(item.id))
        SfcUtils.snackbar('删除成功')
        await loadItems()
      } catch (e) {
        // 用户取消或删除失败
      }
    }

    /**
     * 切换启动项的启用/禁用状态
     * @param item 被切换的启动项（其 enabled 字段已由子组件更新）
     */
    const toggleItem = async(item: BootItem) => {
      try {
        if (item.enabled) {
          await SfcUtils.request(PxeBootApi.enableItem(item.id))
        } else {
          await SfcUtils.request(PxeBootApi.disableItem(item.id))
        }
      } catch (e) {
        // 回滚本地状态
        item.enabled = !item.enabled
        SfcUtils.snackbar('操作失败')
      }
    }

    onMounted(() => {
      loadStatus()
      loadItems()
    })

    return {
      status,
      bootItems,
      dialogVisible,
      editingItem,
      toggling,
      loadItems,
      toggleService,
      showAddDialog,
      editItem,
      deleteItem,
      toggleItem
    }
  }
})
</script>
