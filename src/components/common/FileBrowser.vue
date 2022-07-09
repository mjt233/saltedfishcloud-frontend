<template>
  <div>
    <loading-mask :loading="loading" z-index="1000" />
    
    <!-- 顶部按钮 -->
    <div
      v-show="topButtons.length && topButtons.length"
      ref="topBtnRef"
      class="top-btn-group"
      justify="start"
    >
      <div v-for="(group) in topButtons" :key="group.id">
        <template v-if="group.renderOn ? group.renderOn(listContext) : true">
          <!-- 单个按钮 -->
          <v-btn
            v-if="group.items.length == 0"
            :color="group.color || 'primary'"
            :icon="group.icon"
            @click="topBtnClick(group)"
          >
            <v-icon
              v-if="group.icon"
              :size="18"
              :icon="group.icon"
              style="margin-right: 6px"
            />
            {{ group.name }}
          </v-btn>

          <!-- 按钮组 -->
          <v-menu
            v-else
            open-on-focus
            open-on-click
          >
            <!-- 触发按钮/标题 -->
            <template #activator="{ props: a }">
              <v-btn :color="group.color || 'primary'" v-bind="a">
                
                <v-icon
                  v-if="group.icon"
                  :size="18"
                  :icon="group.icon"
                  style="margin-right: 6px"
                />
                {{ group.name }}
              </v-btn>
            </template>

            <!-- 子按钮菜单 -->
            <v-list>
              <template
                v-for="(item) in group.items"
                :key="item.id"
              >
                <v-list-item v-if="item.renderOn ? item.renderOn(listContext) : true" :value="item.title" @click="topBtnClick(item)">
                  <v-icon
                    v-if="item.icon"
                    :size="18"
                    style="margin-right: 6px"
                    :icon="item.icon"
                  />
                  {{ item.title }}
                </v-list-item>
              </template> 
            </v-list>
          </v-menu>
        </template>
      </div>
    </div>

    <!-- 面包屑路径与视图切换 -->
    <v-row justify="space-between" style="max-width: calc(100% - 12px);padding-left: 12px;">

      <!-- 面包屑 -->
      <v-col style="max-width: calc(100% - 140px);">
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
      </v-col>

      <!-- 视图切换 -->
      <v-col :cols="1" style="min-width: 120px">
        <v-btn-toggle v-model="btnToggle">
          <v-btn
            color="background"
            size="small"
            icon="mdi-format-list-bulleted"
            @click="listType = 'list'"
          />
          <v-btn
            color="background"
            size="small"
            icon="mdi-dots-grid"
            @click="listType = 'grid'"
          />
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- 文件列表 -->
    <file-list
      ref="listRef"
      v-model:file-list="fileList"
      :type="listType"
      :loading-manager="loadingManager"
      :menu="menu.fileListMenu"
      :path="path"
      :uid="uid"
      :read-only="readOnly"
      :height="listHeight"
      @click-item="clickItem"
      @back="back"
    />
  </div>
</template>

<script setup lang="ts">
import FileList from './FileList/index.vue'
import LoadingMask from './LoadingMask.vue'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import { LoadingManager } from '@/utils/LoadingManager'
import { FileListModel } from '@/core/model/component/FileListModel'
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
  },
  /**
   * 文件过滤器，符合条件的文件才显示
   */
  filter: {
    type: Function as PropType<(file: FileInfo) => boolean>,
    default: () => true
  },
  topButtons: {
    type: Array as PropType<MenuGroup<FileListContext>[]>,
    default: () => []
  }
})

// data
type ListType = 'list' | 'grid'

// 文件列表布局类型
const listType: Ref<ListType> = ref('list')

// 顶部按钮容器引用
const topBtnRef = ref() as Ref<HTMLElement>

// 面包屑组件引用
const breadcrumbs = ref()

// 文件列表高度
const listHeight: Ref<undefined | number> = ref(undefined)

// 文件列表组件实例引用
const listRef = ref() as Ref<FileListModel>

// 文件列表右键菜单
const menu = context.menu
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()

// 当前的文件信息列表
const fileList: Ref<FileInfo[]> = ref([])

// 布局切换按钮组的值
const btnToggle = ref(0)



// computed
const listContext = computed(() => {
  return listRef.value?.context
})
const handler = computed(() => {
  let targetObj = props.fileSystemHandler
  if(targetObj == undefined) {
    targetObj = FileSystemHandlerFactory.getFileSystemHandler(ref(0))
  }
  return MethodInterceptor.createAutoCatch(
    MethodInterceptor.createAutoLoadingProxy(
      MethodInterceptor.createProxy(targetObj, (invoker, args, name) => {
        const ret = invoker(args)
        if (name != 'loadList') {
          return ret
        }

        return (ret as ReturnType<FileSystemHandler['loadList']>).then(e => {
          return e.filter(props.filter)
        })
      }), loadingManager)
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
        ret.filter(props.filter).forEach(e => fileList.value.push(e))
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
  fileList.value = (await handler.value.loadList(path)).filter(props.filter)
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

const clickItem = async(ctx: FileListContext, e: FileInfo) => {
  if (e.dir) {
    const newPath = StringUtils.appendPath(props.path, e.name)
    await loadList(newPath)
  } else {
    const files = [e]
    const handlers = context.fileOpenHandler.value.filter(handler => handler.matcher(ctx, files))
    if (handlers.length == 1) {
      handlers[0].action(ctx, files)
    }
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
    listHeight.value = document.documentElement.clientHeight - (listRef.value.$el as HTMLElement).getBoundingClientRect().top - (topBtnRef.value as HTMLElement).clientHeight
  }
}
const resizeHandler = async() => {
  await scrollBreadcrumbs()
  await updateListHeight()
}

const topBtnClick = (item: MenuItem<FileListContext> | MenuGroup<FileListContext>) => {
  if(!(item.action instanceof Function)) {
    return
  }
  MethodInterceptor.createAutoCatch(
    MethodInterceptor.createAutoLoadingProxy(MethodInterceptor.wrapFun(item.action), loadingManager)
  ).invoke(listContext.value)
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
import { FileInfo, FileListContext } from '@/core/model'
import { StringUtils } from '@/utils/StringUtils'
import {FileSystemHandler, FileSystemHandlerFactory} from '@/core/serivce/FileSystemHandler'
import { defineComponent, ref, Ref, onMounted, inject, PropType, computed, provide, nextTick, onUnmounted, watch, reactive, ComponentPublicInstance } from 'vue'
import { context, MenuGroup, MenuItem } from '@/core/context'
import { FileUploadExecutor, FileUploadInfo, fileUploadTaskManager } from '@/core/serivce/FileUpload'

export default defineComponent({
  name: 'FileBrowser'
})
</script>


<style lang="scss">
.path-breadcrumbs {
  white-space: nowrap;
  padding: 6px 0;
  scroll-behavior:smooth
}
.top-btn-group {
  padding-left: 12px;
  &>* {
    display: inline-block;
    margin-right: 12px;
    margin-bottom: 12px;
  }
}
</style>