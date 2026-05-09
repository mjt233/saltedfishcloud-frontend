import { getContext, type MenuGroup } from 'sfc-common/core'
import { fileUploadTaskManager, TaskManagerEventListener } from 'sfc-common/core/serivce/FileUpload'
import type { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'
import { type FileListContext, type FileInfo, ProtocolParams } from 'sfc-common/model'
import { MethodInterceptor } from 'sfc-common/utils'
import { computed, onMounted, onUnmounted, Ref } from 'vue'
import { useDocumentFocus } from 'sfc-common/composables/useDocumentFocus'

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
 * 在指定元素中监听Backspace按键，按下时触发回调
 */
export function useBackspaceGoBack({ focusRoot, onGoBack }: { focusRoot: (() => HTMLElement), onGoBack?: () => void }) {
  const { curFocusRootId, focusRootId } = useDocumentFocus({ focusRoot })
  const keyCallback = (e: KeyboardEvent) => {
    if (e.key === 'Backspace' && curFocusRootId.value.includes(focusRootId.value)) {
      onGoBack && onGoBack()
    }
  }
  onMounted(() => {
    window.addEventListener('keydown', keyCallback)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', keyCallback)
  })
}

/**
 * 创建回车键按下时触发相当于双击文件的逻辑
 */
export function useEnterAsClick({ focusRoot, selectedFile, onEnter }: { focusRoot: (() => HTMLElement), selectedFile: Ref<FileInfo[]>, onEnter?: (f: FileInfo) => void }) {
  const { curFocusRootId, focusRootId } = useDocumentFocus({ focusRoot })
  const keyCallback = (e: KeyboardEvent) => {
    if (selectedFile.value.length == 1 && e.key === 'Enter' && curFocusRootId.value.includes(focusRootId.value) && onEnter) {
      onEnter(selectedFile.value[0])
    }
  }
  onMounted(() => {
    window.addEventListener('keydown', keyCallback)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', keyCallback)
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
  computeTarget: (() => HTMLElement | null | undefined) | HTMLElement | null | undefined

  /**
   * 检测高度变化的目标
   */
  observeTarget: (() => HTMLElement) | HTMLElement

  /**
   * 指定计算高度偏移
   */
  offset: number

  /**
   * 文档总高度
   */
  documentHeight?: number | (() => number)
}

export type FileViewType = 'table' | 'list' | 'grid' | 'tile'


export interface FileExplorerProps {
  /**
   * 文件列表视图类型（默认table）
   */
  fileViewType?: FileViewType

  /**
   * 文件来源协议类型。默认为网盘主文件列表 main
   * 
   * 该属性支持通过父组件的provide穿透提供，但手动为组件的props传入protocol时会优先于provide
   */
  protocol?: string

  /**
   * 目标文件资源的统一资源请求接口参数对象
   * 
   * 该属性支持通过父组件的provide穿透提供，但手动为组件的props传入protocol时会优先于provide
   */
  protocolParams?: () => ProtocolParams

  /**
   * 是否隐藏文件视图切换按钮
   */
  hideFileViewToggle?: boolean

  /** 是否隐藏工具栏操作按钮 */
  hideToolBar?: boolean

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

  /** 启用 README.md 预览，默认为false */
  previewReadme?: boolean

  /** 是否启用多选，默认为true */
  useSelect?: boolean

  /** 是否自动打开用户点击的文件，默认true */
  autoOpenFile?: boolean
}