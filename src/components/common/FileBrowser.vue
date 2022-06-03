<template>
  <div>
    <loading-mask :loading="loading" />
    <file-list
      v-model:file-list="fileList"
      :menu="menu.fileListMenu"
      :path="path"
      :read-only="readOnly"
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
  }
})

// data
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
  return MethodInterceptor.createAutoLoadingProxy(targetObj, loadingManager)
})
provide('fileSystemHandler', handler)




const loadList = async(path: string) => {
  fileList.value = await handler.value.loadList(path)
  if (props.path != path) {
    emits('update:path', path)
  }
}

const back = async() => {
  if (props.path == '/') return
  const pathArr = props.path.split('/')
  pathArr.pop()
  await loadList('/' + pathArr.join('/'))
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

onMounted(() => {
  loadList(props.path)
})
</script>

<script lang="ts">
import { FileInfo } from '@/core/model'
import { StringUtils } from '@/utils/StringUtils'
import {FileSystemHandler, FileSystemHandlerFactory} from '@/core/serivce/FileSystemHandler'
import { defineComponent, ref, Ref, onMounted, inject, PropType, computed, provide } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileBrowser'
})
</script>