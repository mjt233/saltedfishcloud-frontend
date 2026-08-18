<template>
  <file-explorer
    :path="path"
    :uid="String(uid)"
    :file-system-handler="handler"
    :read-only="readOnly"
    :root-name="rootName"
    :tool-buttons="toolButtons"
    :auto-compute-height="true"
    :auto-compute-height-offset="-18"
    @update:path="path = $event"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getContext } from 'sfc-common'
import type { IdType, MenuGroup, FileListContext } from 'sfc-common'
import { FileExplorer } from 'sfc-common/components'
import { TeamFileSystemHandler } from '../fileSystemHandler'

const props = defineProps<{
  /** 团队文件空间 uid（团队 id） */
  uid: IdType
  /** 当前用户角色（1-4） */
  myRole?: number
  /** 团队名称（展示根目录名用） */
  teamName?: string
}>()

/** 当前路径（切换团队时重置） */
const path = ref('')
/** 是否只读（READ 角色隐藏全部写操作入口） */
const readOnly = computed(() => (props.myRole ?? 0) < 2)
/** 根目录显示名 */
const rootName = computed(() => (props.teamName ? '团队空间：' + props.teamName : '团队空间'))
/** 文件系统处理器（按当前团队创建，uid 变化即重建） */
const handler = computed(() => new TeamFileSystemHandler(props.uid))
/** 工具栏按钮：写角色使用宿主默认按钮（上传/新建目录），只读角色为空 */
const toolButtons = computed<MenuGroup<FileListContext>[]>(() => {
  if (readOnly.value) {
    return []
  }
  return getContext().menu.value.fileBrowserBtn || []
})

// 切换团队时重置到根目录
watch(() => props.uid, () => {
  path.value = ''
})
</script>
