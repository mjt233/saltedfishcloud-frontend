import { md5 } from 'js-md5'
import { ref, computed, Ref, watch } from 'vue'
import { FileExplorerViewEmits, FileExplorerViewExpose } from './baseDefine'
import { FileInfo } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { useTypeToSearch } from 'sfc-common/composables/useTypeToSearch'
import { MethodInterceptor } from 'sfc-common/utils'
import { useCheckIsMobile } from 'sfc-common/composables/useCheckIsMobile'

export interface FileListTypeToSearchOption {
  /** 获取可实时搜索内容所在的根元素，用于确保最后一次的焦点在该元素内时只触发本次搜索 */
  focusRoot: () => HTMLElement

  /** 待搜索的文件列表 */
  fileList: () => FileInfo[]

  /** 系统当前已选中的文件名集合 */
  selectedSet: Ref<Set<string>>

  /** 系统当前已选中的文件列表 */
  selectedList: Ref<string[]>

  /** 成功匹配搜索回调 */
  matchCallback?: (fileName: string) => void
}

/**
 * 实现文件视图的Type To Search快捷键入搜索功能，焦点在文件视图中时直接按键盘输入时触发文件的快速选中
 */
export function useFileListTypeToSearch({ focusRoot, selectedSet, selectedList, fileList, matchCallback }: FileListTypeToSearchOption) {
  useTypeToSearch({
    focusRoot: focusRoot,
    searchCallback(key, repeatKey) {
      
      const useFirstCharMatch = repeatKey !== undefined
      // 一直重复输入一个key时，采用按单个首字母检索模式，每重复一次就自动切换到下一个文件选中
      const actualSearchKey = useFirstCharMatch ? repeatKey : key
      // 下面两个变量只在首字母检索模式下赋值，确保文件可以一直从当前已选的文件开始往后选中而不会倒回去前面
      let startSearchIdx = -1
      let curSelectedFile: string
      const files = fileList()
      if (useFirstCharMatch && selectedSet.value.size == 1) {
        curSelectedFile = selectedList.value[0]
        startSearchIdx = files.findIndex(f => f.name == curSelectedFile)
      }

      const matchFile = files.find((e, idx) => idx > startSearchIdx && e.name != curSelectedFile && e.name.toLowerCase().startsWith(actualSearchKey.toLowerCase()))
      if (!matchFile) {
        return
      }
      // 搜索匹配上了就自动选择这个文件
      selectedList.value = [matchFile.name]
      matchCallback?.(matchFile.name)
    }
  })
}

export interface FileSelectOptions {
  /**
   * 文件被点击时，提取被点击的文件名的方法
   * @param e 点击事件
   * @returns 点击的项目的文件名
   */
  itemClickFileNameExtractor: (e: MouseEvent) => string | undefined | null

  emits: FileExplorerViewEmits

  fileList: () => FileInfo[]

  /** 是否允许多选 */
  multipleSelect?: ValueType<boolean>
}

export function useFileViewText() {
  return {
    loadingText: '正在拼命加载中...o((>ω< ))o',
    noDataText: '这里啥也没有 =￣ω￣=',
  }
}

/**
 * 实现文件选择相关的逻辑
 * @returns 
 */
export function useFileSelect({
  itemClickFileNameExtractor,
  emits,
  fileList,
  multipleSelect
} : FileSelectOptions) {
  const multipleSelectValue = getValue(multipleSelect)
  const isMobile = useCheckIsMobile()

  // 是否需要等待双击执行回调，双击回调优先，防止第二下点击时同时执行单击和双击的回调
  let waitDoubleClick = false
  // 记录上一个选中的文件名，用于Shift+Click范围选中
  let lastSelectedFileName: string | undefined

  const selectedList = ref<string[]>([])
  const selectedSet = computed(() => new Set(selectedList.value))

  watch(() => fileList(), () => {
    selectedList.value = []
    lastSelectedFileName = undefined
  })
  watch([selectedList, () => selectedList.value.length], () => {
    emits('fileSelect', selectedList.value)
  })

  return {
    /**
     * 被选中的文件列表
     */
    selectedList,

    /**
     * 被选中的文件名称集合
     */
    selectedSet,
    
    /**
     * 文件项DOM双击回调
     */
    itemDoubleClickFunction(e: MouseEvent) {
      waitDoubleClick = true
    },

    /**
     * 文件列表容器点击回调，该函数用于处理容器点击后触发的文件选中逻辑
     */
    async containerClickFunction(e: MouseEvent) {
      await SfcUtils.sleep(1)
      if (waitDoubleClick) {
        waitDoubleClick = false
        return
      }
      waitDoubleClick = false

      const fileName = itemClickFileNameExtractor(e)
      if (!fileName) {
        selectedList.value = []
        return
      }
      
      if (isMobile.value) {
        const fi = fileList().find(f => f.name == fileName)
        if (fi) {
          emits('fileClick', fi)
        }
        return
      }

      const files = fileList()
      const fileNames = files.map(f => f.name)

      // 处理Shift+Click范围选中
      if (e.shiftKey && lastSelectedFileName) {
        const lastIndex = fileNames.indexOf(lastSelectedFileName)
        const currentIndex = fileNames.indexOf(fileName)
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          // 获取范围内的所有文件名
          const startIndex = Math.min(lastIndex, currentIndex)
          const endIndex = Math.max(lastIndex, currentIndex)
          const rangeFileNames = fileNames.slice(startIndex, endIndex + 1)
          
          // 如果按下Ctrl，则将范围内的文件添加到已选择的列表中
          if (e.ctrlKey) {
            const newSelected = new Set(selectedList.value)
            rangeFileNames.forEach(name => newSelected.add(name))
            selectedList.value = Array.from(newSelected)
          } else {
            // 否则替换为范围内的文件
            selectedList.value = rangeFileNames
          }
          return
        }
      }

      // 判断是否按下了Ctrl
      if (e.ctrlKey && multipleSelectValue) {
        if (selectedSet.value.has(fileName)) {
          selectedList.value = selectedList.value.filter(name => name != fileName)
        } else {
          selectedList.value.push(fileName)
        }
      } else {
        selectedList.value = [fileName]
      }

      // 更新lastSelectedFileName
      lastSelectedFileName = fileName
    },

    oncontextmenu(e: PointerEvent) {
      const name = itemClickFileNameExtractor(e)
      if (!name) {
        selectedList.value = []
      } else {
        
        if (!multipleSelectValue) {
          selectedList.value = [name]
          return
        } else if (!selectedSet.value.has(name)) {
          selectedList.value = [name]
        }
        
      }
    }
  }
}

export type ValueType<T> = T | (() => T)

function getValue<T>(v: ValueType<T>) {
  return v instanceof Function ? v() : v
}

export interface ExposeAttr {
  selectedList: Ref<string[]>
  selectedSet: Ref<Set<string>>
  fileList: () => FileInfo[]
  fileItemLocator: {

    // 文件项DOM元素，每一项文件信息的直接父级容器
    fileItemContainer: ValueType<HTMLElement>

    // 文件视图的滚动容器，默认为fileItemContainer的父级
    scrollContainer?: ValueType<HTMLElement>

    // 每行的文件数
    perRowFileCount?: ValueType<number | null | undefined>

    // 每行高度
    perRowHeight?: ValueType<number>
  }
}

interface RowDetail {
  col: number
  height: number
}

function findIndex<T>(iterable: any, length: number, predicate: (item: T) => boolean): number {
  let idx = 0
  while(idx < length) {
    const item = iterable[idx]
    if (predicate(item)) {
      return idx
    }
    idx++
  }
  return -1
}


/**
 * 获取容器中每行元素的信息（每行有多少列、每行占多高）
 * @param el DOM 元素
 */
function getPerRowDetail(el: HTMLElement): RowDetail {
  const children = el.children
  const len = children.length
  const isFileItem = (el: HTMLElement) => el.clientWidth >= 32 && el.clientHeight >= 32

  const firstElIdx = findIndex<HTMLElement>(children, len, isFileItem)  
  if (firstElIdx === -1) return { col: 0, height: 0 }

  const firstEl = children[firstElIdx] as HTMLElement
  const firstTop = firstEl.offsetTop

  // 1. 开始找换行位置
  let col = -1
  let wrapIdx = findIndex<HTMLElement>(children, len, (el) => {
    if (isFileItem(el)) {
      col++
    }
    return el.offsetTop > firstTop
  })


  // 2. 计算高度
  // 如果 col < len，说明有第二行，直接减；否则说明只有一行，直接取第一个的高度
  const height = wrapIdx == -1 ? firstEl.offsetHeight: (children[wrapIdx] as HTMLElement).offsetTop - firstEl.offsetTop

  return { col, height }
}

export function getExpose({ selectedList, selectedSet, fileList, fileItemLocator }: ExposeAttr): FileExplorerViewExpose {
  return {
    getSelectedFileList() {
      return fileList().filter(file => selectedSet.value.has(file.name))
    },
    selectFile(fileName: string[]) {
      selectedList.value = fileName
    },
    scrollTo(fileName) {
      let defaultColAndHeight = MethodInterceptor.cacheReturnValue((el: HTMLElement) => {
        return getPerRowDetail(getValue(el))
      })

      const {
        fileItemContainer,
        scrollContainer = getValue(fileItemContainer).parentElement as HTMLElement,
        perRowFileCount = defaultColAndHeight(getValue(fileItemContainer)).col,
        perRowHeight = defaultColAndHeight(getValue(fileItemContainer)).height
      } = fileItemLocator
      const idx = fileList().findIndex(file => file.name == fileName)
      if (idx == -1) {
        console.warn('无法滚动定位到文件 ' + fileName + ' 文件不存在')
        return
      }
      const perRowFileCountValue = getValue(perRowFileCount)
      if (!perRowFileCountValue) {
        console.warn('无法滚动定位到文件 ' + fileName + ' 每行文件数未指定')
        return
      }
      const perRowHeightValue = getValue(perRowHeight)
      if (!perRowHeightValue) {
        console.warn('无法滚动定位到文件 ' + fileName + ' 每行高度未指定')
        return
      }

      const rowNum = Math.floor((idx + 1) / perRowFileCountValue)
      const top = (rowNum - 1) * perRowHeightValue
      getValue(scrollContainer).scrollTo({
        top: top,
        behavior: 'smooth'
      })
    },
  }
}