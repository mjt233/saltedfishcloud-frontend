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


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const SfcUtils = window.SfcUtils
import { PxeBootApi } from '../api'
import { BootItem, PxeServiceStatus } from '../model'
import PxeServiceStatusCard from './PxeServiceStatusCard.vue'
import BootItemList from './BootItemList.vue'
import BootItemForm from './BootItemForm.vue'

/** 当前 PXE 服务状态 */
const status = ref<PxeServiceStatus | null>(null)
/** 启动项列表 */
const bootItems = ref<BootItem[]>([])
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
 * 打开新增/编辑启动项的表单对话框
 * @param item 待编辑的启动项，null 表示新增模式
 */
const openFormDialog = (item: BootItem | null) => {
  const title = item ? '编辑启动项' : '添加启动项'
  const inst = SfcUtils.openComponentDialog(BootItemForm, {
    props: {
      editingItem: item
    },
    title,
    extraDialogOptions: {
      maxWidth: '960px'
    },
    persistent: true,
    async onConfirm() {
      const form = inst.getInstAsForm()
      inst.beginLoading()
      try {
        const valid = await form.validate()
        if (!valid.valid) {
          SfcUtils.snackbar(valid.errors.map(e => e.errorMessages).join('\n') || '表单验证失败')
          return false
        }
        const subRes = await form.submit()
        if (subRes.success) {
          await loadItems()
          return true
        } else {
          return false
        }
      } finally {
        inst.closeLoading()
      }
    }
  })
}

/**
 * 打开新增启动项对话框
 */
const showAddDialog = () => {
  openFormDialog(null)
}

/**
 * 打开编辑启动项对话框
 * @param item 待编辑的启动项
 */
const editItem = (item: BootItem) => {
  openFormDialog(item)
}

/**
 * 删除启动项，删除前弹窗确认
 * @param item 待删除的启动项
 */
const deleteItem = async(item: BootItem) => {
  try {
    await SfcUtils.confirm('确定删除启动项 "' + item.displayName + '"？', '删除确认')
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
</script>
