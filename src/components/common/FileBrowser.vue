<template>
  <div>
    <loading-mask :loading="loading" z-index="1000" />
    <v-breadcrumbs ref="breadcrumbs" class="overflow-auto path-breadcrumbs">
      <v-breadcrumbs-item :disabled="pathItems.length == 1">
        <a class="link" @click="jumpIndex(pathItems.length - 2)">返回上一级</a>
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider>
        |
      </v-breadcrumbs-divider>
      <template v-for="(item, index) in pathItems" :key="index">
        <v-breadcrumbs-item :disabled="item.disabled" @click="jumpIndex(index)">
          <a class="link">{{ item.text }}</a>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider v-if="index != pathItems.length - 1">
          <v-icon icon="mdi-chevron-right" />
        </v-breadcrumbs-divider>
      </template>
    </v-breadcrumbs>
    <file-list
      ref="listRef"
      v-model:file-list="fileList"
      :menu="menu.fileListMenu"
      :path="path"
      :read-only="readOnly"
      :height="listHeight"
      @click-item="clickItem"
      @back="back"
    />
  </div>
</template>

<script setup lang="ts">
import FileList from './FileList.vue'
import LoadingMask from './LoadingMask.vue'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import { LoadingManager } from '@/utils/LoadingManager'
const props = defineProps({
  path: {
    type: String,
    default: '/'
  },
  fileSystemHandler: {
    type: Object as PropType<FileSystemHandler>,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: true
  },
  /**
   * 自动计算文件列表的高度以填充页面而刚好不溢出
   */
  autoComputeHeight: {
    type: Boolean,
    default: true
  },
  /**
   * 用户id，用于识别上传任务完成时决定是否自动刷新
   * （疑问：既然都传uid了，为什么还要由外部传入fileSystemHandler....)
   */
  uid: {
    type: Number,
    default: 0
  }
})

// data
const breadcrumbs = ref()
const listHeight: Ref<undefined | number> = ref(undefined)
const listRef = ref()
const menu = context.menu
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const fileList: Ref<FileInfo[]> = ref([])

// computed
const handler = computed(() => {
  let targetObj = props.fileSystemHandler
  if(targetObj == undefined) {
    targetObj = FileSystemHandlerFactory.getFileSystemHandler(ref(0))
  }
  return MethodInterceptor.createAutoCatch(
    MethodInterceptor.createAutoLoadingProxy(targetObj, loadingManager)
  )
})

provide('fileSystemHandler', handler)

const autoRefresher = MethodInterceptor.createThrottleProxy({
  loading: false,
  async refresh(info: FileUploadInfo) {
    if (this.loading) {
      return undefined
    }
    this.loading = true
    const attr = info.otherAttr
    let ret:FileInfo[]

    if (attr && attr.uid == props.uid && attr.path == props.path) {
      ret = await handler.value.loadList(props.path)
      if (attr && attr.uid == props.uid && attr.path == props.path) {
        fileList.value.length = 0
        ret.forEach(e => fileList.value.push(e))
        this.loading = false
      }
    }
  }
}, {
  afterExecute: true,
  delay: 2500
})
const successListener = async(executor: FileUploadExecutor) => {
  autoRefresher.refresh(executor.getUploadInfo())
}

const pathArr = computed(() => {
  return props.path.split('/').filter(e => e)
})
const pathItems = computed(() => {
  const itemArr = [{
    text: '根',
    disabled: false
  }]
  pathArr.value.map(nodeName => {
    return {
      text: nodeName,
      disabled: false
    }
  }).forEach(item => itemArr.push(item))
  if (itemArr.length > 0) {
    itemArr[itemArr.length - 1].disabled = true
  }
  return itemArr
})

const jumpIndex = (nodeIndex: number) => {
  const newArr = pathArr.value.filter((e, i) => i < nodeIndex)
  loadList('/' + newArr.join('/'))
}

const loadList = async(path: string) => {
  fileList.value = await handler.value.loadList(path)
  if (props.path != path) {
    emits('update:path', path)
    scrollBreadcrumbs()
  }
}

const back = async() => {
  if (props.path == '/') return
  const pathArr = props.path.split('/')
  pathArr.pop()
  await loadList(StringUtils.appendPath('/', pathArr.join('/')))
}

const clickItem = async(e: FileInfo) => {
  if (e.dir) {
    const newPath = StringUtils.appendPath(props.path, e.name)
    await loadList(newPath)
  } else {
    console.log('isfile')
  }
}

const emits = defineEmits<{
  (event: 'update:path', path: string): void
}>()


const scrollBreadcrumbs = async() => {
  const el = breadcrumbs.value.$el as HTMLElement
  await nextTick()
  el.scrollLeft = el.scrollWidth

}
const updateListHeight = async() => {
  if (props.autoComputeHeight) {
    await nextTick()
    listHeight.value = document.documentElement.clientHeight - (listRef.value.$el as HTMLElement).getBoundingClientRect().top
  }
}
const resizeHandler = async() => {
  await scrollBreadcrumbs()
  await updateListHeight()
}
defineExpose({loadList})
onMounted(() => {
  fileUploadTaskManager.addEventListener('success', successListener)
  loadList(props.path)
  window.addEventListener('resize', resizeHandler)
  updateListHeight()
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
  fileUploadTaskManager.removeEventListener('success', successListener)
})
</script>

<script lang="ts">
import { FileInfo } from '@/core/model'
import { StringUtils } from '@/utils/StringUtils'
import {FileSystemHandler, FileSystemHandlerFactory} from '@/core/serivce/FileSystemHandler'
import { defineComponent, ref, Ref, onMounted, inject, PropType, computed, provide, nextTick, onUnmounted, watch, reactive } from 'vue'
import { context } from '@/core/context'
import { FileUploadExecutor, FileUploadInfo, fileUploadTaskManager } from '@/core/serivce/FileUpload'

export default defineComponent({
  name: 'FileBrowser'
})
</script>


<style>
.path-breadcrumbs {
  white-space: nowrap;
  padding: 6px 0;
  scroll-behavior:smooth
}
</style>