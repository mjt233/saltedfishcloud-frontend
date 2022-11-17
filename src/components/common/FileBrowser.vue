<template>
  <div ref="rootWrapRef">
    <loading-mask :loading="loading" z-index="1000" />
    <!-- 顶部工具栏和按钮 -->
    <div class="tool-bar" compute-height>
      <v-row class="justify-space-between">
        <v-col class="top-btn-group align-center" justify="start" :style="{minWidth: topButtonMinWidth}">
          <div v-for="(group) in toolButtons" v-show="toolButtons.length && toolButtons.length" :key="group.id">
            <template v-if="group.renderOn ? group.renderOn(listContext) : true">
              <!-- 单个按钮 -->
              <v-btn
                v-if="group.items.length == 0"
                :color="group.color || 'primary'"
                @click="topBtnClick(group)"
              >
                <v-icon
                  v-if="group.icon"
                  :size="18"
                  :icon="group.icon"
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
                        :icon="item.icon"
                      />
                      {{ item.title }}
                    </v-list-item>
                  </template> 
                </v-list>
              </v-menu>
            </template>
          </div>
        </v-col>
        <v-col class="top-right-bar-col" style="margin: 0 12px;">
          <div class="top-right-bar">
            <!-- TODO: 窄屏下收起 -->
            <div class="d-flex align-center justify-end">
              <slot name="top-bar" />
              <!-- 视图切换 -->
              <div style="min-width: 120px;max-width: 120px;" class="d-flex">
                <v-btn-toggle v-model="btnToggle">
                  <v-btn
                    color="background"
                    size="small"
                    icon="mdi-format-list-bulleted"
                    @click="changeListType('list')"
                  />
                  <v-btn
                    color="background"
                    size="small"
                    icon="mdi-dots-grid"
                    @click="changeListType('grid')"
                  />
                </v-btn-toggle>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <!-- 面包屑路径 -->
    <v-row justify="space-between" compute-height>
      <v-col>
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
    </v-row>

    <!-- 文件列表 -->
    <file-list
      ref="listRef"
      v-model:file-list="fileList"
      :type="listType"
      :loading-manager="loadingManager"
      :menu="listMenu"
      :path="path"
      :uid="uid"
      :read-only="readOnly"
      :height="listHeight"
      :show-mount-icon="showMountIcon"
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
import FormGrid from '../layout/FormGrid.vue'
const rootWrapRef = ref() as Ref<HTMLElement>
const props = defineProps({
  path: {
    type: String,
    default: '/'
  },
  fileSystemHandler: {
    type: Object as PropType<FileSystemHandler>,
    default: null
  },
  showMountIcon: {
    type: Boolean,
    default: false
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
    type: [Number, String],
    default: 0
  },
  /**
   * 文件过滤器，符合条件的文件才显示
   */
  filter: {
    type: Function as PropType<(file: FileInfo) => boolean>,
    default: () => true
  },
  /**
   * 工具栏按钮
   */
  toolButtons: {
    type: Array as PropType<MenuGroup<FileListContext>[]>,
    default: () => []
  },
  /**
   * 停用的右键菜单id
   */
  disabledMenu: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  /**
   * 启用的右键菜单id，若为空则表示默认全部启用。否则只启用指定的菜单id
   */
  enableMenu: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  /**
   * 自动计算高度时补偿的高度差
   */
  compensateHeight: {
    type: Number,
    default: 0
  },
  appendMenu: {
    type: Array as PropType<MenuGroup<FileListContext>[]>,
    default: () => []
  },
  topButtonMinWidth: {
    type: String,
    default: '360px'
  }
})

const emits = defineEmits<{
  (event: 'update:path', path: string): void
}>()

// data
type ListType = 'list' | 'grid'

const isSmallScreen: Ref<boolean> = ref(false)

// 文件列表布局类型
const listType: Ref<ListType> = ref('list')

// 面包屑组件引用
const breadcrumbs = ref()

// 文件列表高度
const listHeight: Ref<undefined | number> = ref(undefined)

// 文件列表组件实例引用
const listRef = ref() as Ref<FileListModel>

// 文件列表右键菜单
const menu = context.menu
const listMenu = computed(() => {
  const allMenu = menu.value.fileListMenu.concat(props.appendMenu)
  const enableSet = new Set(props.enableMenu)
  const disabledSet = new Set(props.disabledMenu)
  const ret = allMenu.map(group => {
    // 浅拷贝
    const newObj = {}
    Object.assign(newObj, group)
    return newObj as MenuGroup<FileListContext>
  })
  ret.forEach(group => {
    group.items = group.items.filter(menu => {
      // 未被停用 且 在启用范围内
      return !disabledSet.has(menu.id + '') && (enableSet.size == 0 || enableSet.has(menu.id + ''))
    })
  })
  
  return ret
})
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
const updateIsSmallScreen = () => {
  isSmallScreen.value = document.documentElement.clientWidth < 740
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

/**
 * 跳转到指定路径的某个目录节点
 * @param nodeIndex 路径节点索引，0为根目录
 */
const jumpIndex = (nodeIndex: number) => {
  const newArr = pathArr.value.filter((e, i) => i < nodeIndex)
  loadList('/' + newArr.join('/'))
}

/**
 * 加载目录下的文件列表
 * @param path 待加载的目录
 */
const loadList = async(path: string) => {
  fileList.value = await handler.value.loadList(path)
  if (props.path != path) {
    emits('update:path', path)
    scrollBreadcrumbs()
  }
}

/**
 * 返回上一级
 */
const back = async() => {
  if (props.path == '/') return
  const pathArr = props.path.split('/')
  pathArr.pop()
  await loadList(StringUtils.appendPath('/', pathArr.join('/')))
}

/**
 * 文件列表文件被点击事件回调
 * @param ctx 文件列表上下文信息
 * @param e 点击的文件
 */
const clickItem = async(ctx: FileListContext, e: FileInfo) => {
  if (e.dir) {
    const newPath = StringUtils.appendPath(props.path, e.name)
    await loadList(newPath)
  } else {
    SfcUtils.openFile(ctx, e)
  }
}


/**
 * 面包屑导航栏自动滚动到末尾
 */
const scrollBreadcrumbs = async() => {
  const el = breadcrumbs.value.$el as HTMLElement
  await nextTick()
  el.scrollLeft = el.scrollWidth

}

/**
 * 更新FileList组件的高度（自动计算高度）
 */
const updateListHeight = async() => {
  if (props.autoComputeHeight) {
    await nextTick()
    const documentHeight = document.documentElement.clientHeight
    let otherHeight = 0
    rootWrapRef.value.querySelectorAll('[compute-height=""]').forEach(e => {
      otherHeight += e.clientHeight
    })
    const positionTop = (listRef.value.$el as HTMLElement).getBoundingClientRect().top
    // 列表的高度 = 文档高度 - 列表在文档中的top - 其他组件的高度 + 高度补偿参数
    listHeight.value = documentHeight - positionTop + props.compensateHeight
  }
}

/**
 * 窗口尺寸变化回调
 */
const resizeHandler = async() => {
  await scrollBreadcrumbs()
  await updateListHeight()
  updateIsSmallScreen()
}

/**
 * 切换当前的列表展示类型
 * @param type 文件列表展示类型
 */
const changeListType = (type: ListType) => {
  listType.value = type

  // 记忆习惯
  localStorage.setItem('list-type', type)
  if (type == 'grid') {
    btnToggle.value = 1
  } else {
    btnToggle.value = 0
  }
}

/**
 * 执行顶部的按钮点击事件
 * @param item 点击的菜单项
 */
const topBtnClick = (item: MenuItem<FileListContext> | MenuGroup<FileListContext>) => {
  if(!(item.action instanceof Function)) {
    return
  }
  MethodInterceptor.createAutoCatch(
    MethodInterceptor.createAutoLoadingProxy(MethodInterceptor.wrapFun(item.action), loadingManager)
  ).invoke(listContext.value)
}
defineExpose({
  loadList,
  getListContext() {
    return listRef.value.context
  }
})
onMounted(() => {
  fileUploadTaskManager.addEventListener('success', successListener)
  loadList(props.path)
  window.addEventListener('resize', resizeHandler)
  updateListHeight()

  const historyListType = localStorage.getItem('list-type')
  if (historyListType) {
    changeListType(historyListType as ListType)
  }
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
import SfcUtils from '@/utils/SfcUtils'

export default defineComponent({
  name: 'FileBrowser'
})
</script>


<style lang="scss" scoped>
.path-breadcrumbs {
  white-space: nowrap;
  padding: 6px 0;
  scroll-behavior:smooth;
  margin: 0 12px;
}
.top-btn-group {
  margin-left: 12px;
  &>* {
    display: inline-block;
    margin: 3px 6px;
  }
}
.tool-bar .v-col {
  padding-bottom: 0;
}

.top-right-bar {
  padding-left: 16px;
  &.is-small-screen {
    display: none;
  }
  
}
.top-right-bar-col {
  padding: 0;
}
</style>