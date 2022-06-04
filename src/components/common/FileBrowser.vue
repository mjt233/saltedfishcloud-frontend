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
const breadcrumbs = ref()
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
provide('fileSystemHandler', handler)

const jumpIndex = (nodeIndex: number) => {
  const newArr = pathArr.value.filter((e, i) => i < nodeIndex)
  loadList('/' + newArr.join('/'))
}
const scrollBreadcrumbs = async() => {
  const el = breadcrumbs.value.$el as HTMLElement
  await nextTick()
  el.scrollLeft = el.scrollWidth
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

defineExpose({loadList})
onMounted(() => {
  loadList(props.path)
  window.addEventListener('resize', scrollBreadcrumbs)
})
onUnmounted(() => {
  window.removeEventListener('resize', scrollBreadcrumbs)
})
</script>

<script lang="ts">
import { FileInfo } from '@/core/model'
import { StringUtils } from '@/utils/StringUtils'
import {FileSystemHandler, FileSystemHandlerFactory} from '@/core/serivce/FileSystemHandler'
import { defineComponent, ref, Ref, onMounted, inject, PropType, computed, provide, nextTick, onUnmounted } from 'vue'
import { context } from '@/core/context'

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