import { getContext, type MenuGroup } from 'sfc-common/core'
import { fileUploadTaskManager, TaskManagerEventListener } from 'sfc-common/core/serivce/FileUpload'
import type { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'
import { type FileListContext, type FileInfo } from 'sfc-common/model'
import { MethodInterceptor } from 'sfc-common/utils'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

export interface ListMenuOptions {
  /**
   * 系统默认已配置的列表菜单
   */
  listMenu: MenuGroup<FileListContext>[],

  /**
   * 追加的右键菜单
   */
  appendMenu?: MenuGroup<FileListContext>[],

  /**
   * 启用的右键菜单id，若为空则表示默认全部启用。否则只启用指定的菜单id
   */
  enableMenu?: string[]

  /**
   * 停用的右键菜单id
   */
  disabledMenu?: string[]

  listContext: FileListContext
}

export function useFileUploadEvent() {
  const listener = MethodInterceptor.createThrottleProxyFunc(function(e) {
    console.log(e)
  } as TaskManagerEventListener, { afterExecute: true })
  onUnmounted(() => {
    fileUploadTaskManager.removeEventListener('success', listener)
  })

  onMounted(() => {
    fileUploadTaskManager.addEventListener('success', listener)
  })
}

/**
 * 创建文件列表的菜单，自动处理菜单项的启用停用过滤
 * @returns 配置后的菜单
 */
export function useListMenu({
  listMenu = [],
  appendMenu = [],
  enableMenu = [],
  disabledMenu = [],
  listContext
}: ListMenuOptions) {
  return computed(() => {
    const allMenu = listMenu.concat(appendMenu)
    const enableSet = new Set(enableMenu)
    const disabledSet = new Set(disabledMenu)
    const ret = allMenu.filter(group => !group.renderOn || group.renderOn(listContext)).map(group => {
      // 浅拷贝
      const newObj = {}
      Object.assign(newObj, group)
      return newObj as MenuGroup<FileListContext>
    })
    ret.forEach(group => {
      group.items = group.items.filter(menu => {
        // 未被停用 且 在启用范围内
        const enabledAndInRange = !disabledSet.has(menu.id + '') && (enableSet.size == 0 || enableSet.has(menu.id + ''))
        if (!enabledAndInRange) {
          return false
        }
        // 满足菜单条件
        return menu.renderOn ? menu.renderOn(listContext) : true
      })
    })
    return ret
  })
}


export interface AutoComputeHeightOptions {
  /**
   * 是否自动计算高度
   */
  autoComputeHeight: boolean

  /**
   * 要计算高度的目标元素
   */
  computeTarget: (() => HTMLElement) | HTMLElement

  /**
   * 检测高度变化的目标
   */
  observeTarget: (() => HTMLElement) | HTMLElement

  /**
   * 指定计算高度偏移
   */
  offset: number
}

/**
 * 检测指定容器的高度变化，自动计算目标元素位置 到 页面底部的距离
 * @returns 返回目标元素的高度
 */
export function useAutoComputeHeight({
  autoComputeHeight = false,
  computeTarget,
  offset = 0,
  observeTarget
} : AutoComputeHeightOptions) {
  
  
  const listHeight = ref(400)
  /**
   * 更新FileList组件的高度（自动计算高度）
   */
  const updateListHeight = async() => {
    if (autoComputeHeight) {
      await nextTick()
      const documentHeight = window.innerHeight
      const target = typeof computeTarget === 'function' ? computeTarget() : computeTarget
      const positionTop = target.getBoundingClientRect().top

      const oTarget = typeof observeTarget === 'function' ? observeTarget() : observeTarget

      const oc = getComputedStyle(oTarget)
      const b = parseInt(oc.marginBottom) + parseInt(oc.paddingBottom)
      // 列表的高度 = 文档高度 - 列表在文档中的top - 其他组件的高度 + 高度补偿参数 - 检测容器margin
      listHeight.value = documentHeight - positionTop + offset - b
    }
  }

  const obs = new ResizeObserver(updateListHeight)
  onMounted(() => {
    updateListHeight()
    obs.observe(typeof observeTarget === 'function' ? observeTarget() : observeTarget)
  })

  onUnmounted(() => {
    obs.disconnect()
  })

  return listHeight
}


export interface FileExplorerProps {
  /** 显示的根目录名称（可选） */
  rootName?: string

  /** 初始路径，默认 '/' */
  path?: string

  /** 文件系统处理器实例 */
  fileSystemHandler?: FileSystemHandler | null

  showMountIcon?: boolean

  readOnly?: boolean

  /** 自动计算文件列表高度以填充页面 */
  autoComputeHeight?: boolean

  /** 用户 id（用于识别上传任务完成时是否自动刷新） */
  uid?: number | string

  /** 文件过滤器，返回 true 的文件会被显示 */
  filter?: (file: FileInfo) => boolean

  /** 工具栏新建按钮 */
  toolButtons?: MenuGroup<FileListContext>[]

  /** 停用的右键菜单 id 列表 */
  disabledMenu?: string[]

  /** 启用的右键菜单 id 列表（为空表示全部启用） */
  enableMenu?: string[]

  /** 自动计算高度时的偏移量 */
  autoComputeHeightOffset?: number

  /** 追加的右键菜单 */
  appendMenu?: MenuGroup<FileListContext>[]

  topButtonMinWidth?: string

  /** 启用 README.md 预览 */
  previewReadme?: boolean

  /** 是否启用多选 */
  useSelect?: boolean

  /** 是否自动打开用户点击的文件 */
  autoOpenFile?: boolean
}