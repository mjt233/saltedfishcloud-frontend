<template>
  <div
    class="team-file-browser"
    @dragover.prevent="dragOver"
    @dragleave.self="dragLeave"
    @drop.prevent="dropFinish"
  >
    <!-- 拖拽上传提示 -->
    <div v-show="inDragging" class="drag-tip">
      <v-icon icon="mdi-upload" />
      <span class="ml-2">拖拽上传到团队空间</span>
    </div>
    <file-explorer
      :path="path"
      :uid="String(uid)"
      :file-system-handler="handler"
      :read-only="readOnly"
      :root-name="rootName"
      :tool-buttons="toolButtons"
      :auto-compute-height="true"
      :auto-compute-height-offset="-18"
      v-model:file-view-type="fileViewType"
      @update:path="path = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getContext, scanDir, StringUtils, testIsDir } from 'sfc-common'
import type { IdType, MenuGroup, FileListContext } from 'sfc-common'
import { FileExplorer } from 'sfc-common/components'
import { TeamFileSystemHandler } from '../fileSystemHandler'

const SfcUtils = (window as any).SfcUtils

/** 文件视图类型（与宿主 FileExplorer 一致） */
type FileViewType = 'table' | 'list' | 'grid' | 'tile'

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
/** 当前文件视图（默认表格视图，切换后持久化到 localStorage） */
const fileViewType = ref<FileViewType>((localStorage.getItem('teamFileViewType') as FileViewType) || 'table')
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
/** 是否正在拖拽（用于显示拖拽上传提示） */
const inDragging = ref(false)

// 持久化视图类型
watch(fileViewType, (val) => {
  localStorage.setItem('teamFileViewType', val)
})

// 切换团队时重置到根目录
watch(() => props.uid, () => {
  path.value = ''
})

/**
 * 拖拽进入文件浏览区域：可写角色显示拖拽提示
 * @param e 拖拽事件
 */
function dragOver(e: DragEvent) {
  if (!readOnly.value) {
    inDragging.value = true
  }
}

/**
 * 拖拽离开文件浏览区域：隐藏拖拽提示
 * @param e 拖拽事件
 */
function dragLeave(e: DragEvent) {
  inDragging.value = false
}

/**
 * 完成拖拽上传：将拖入的文件/文件夹递归加入上传队列。
 * 与【我的网盘/公共网盘】行为一致，经 handler.uploadDirect（执行器式上传，全局显示进度）
 * @param e 拖拽事件
 */
async function dropFinish(e: DragEvent) {
  inDragging.value = false
  if (readOnly.value || !e.dataTransfer) {
    return
  }
  let fileCount = 0
  const tasks: Promise<any>[] = []
  for (const item of Array.from(e.dataTransfer.items)) {
    if (testIsDir(item)) {
      // 文件夹：递归扫描其中所有文件，按相对路径上传
      tasks.push(scanDir(item, (i) => {
        if (i.isDir) {
          return
        }
        fileCount++
        handler.value.uploadDirect(StringUtils.appendPath(path.value, i.relativePath), i.file as File)
      }))
    } else {
      fileCount++
      handler.value.uploadDirect(path.value, item.getAsFile() as File)
    }
  }
  await Promise.all(tasks)
  if (fileCount == 0) {
    SfcUtils.alert('未检测到文件')
  } else {
    SfcUtils.snackbar(`已添加${fileCount}个文件到上传队列`)
  }
}
</script>

<style scoped>
.team-file-browser {
  position: relative;
  height: 100%;
}

.drag-tip {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-background), .8);
  pointer-events: none;
  z-index: 2;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}
</style>