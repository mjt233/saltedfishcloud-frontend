import { ref, computed, ComputedRef, Ref, watch } from 'vue'
import { FileExplorerListEmits, FileExplorerListExpose } from './baseDefine'
import { FileInfo } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export interface FileSelectOptions {
  /**
   * 文件被点击时，提取被点击的文件名的方法
   * @param e 点击事件
   * @returns 点击的项目的文件名
   */
  itemClickFileNameExtractor: (e: PointerEvent) => string | undefined | null

  emits: FileExplorerListEmits

  fileList: () => FileInfo[]
}

/**
 * 实现文件选择相关的逻辑
 * @returns 
 */
export function useFileSelect({
  itemClickFileNameExtractor,
  emits,
  fileList
} : FileSelectOptions) {

  // 是否需要等待双击执行回调，双击回调优先，防止第二下点击时同时执行单击和双击的回调
  let waitDoubleClick = false

  const selectedList = ref<string[]>([])
  const selectedSet = computed(() => new Set(selectedList.value))

  watch(() => fileList(), () => {
    selectedList.value = []
  })
  watch([selectedList, () => selectedList.value.length], () => {
    emits('fileSelect', selectedList.value)
  })

  return {
    loadingText: '正在拼命加载中...o((>ω< ))o',
    noDataText: '这里啥也没有 =￣ω￣=',
    /**
     * 被选中的文件列表
     */
    selectedList,

    /**
     * 被选中的文件名称集合
     */
    selectedSet,
    
    /**
     * 文件项DOM单击回调
     */
    async itemClickFunction(e: PointerEvent) {
      await SfcUtils.sleep(1)
      if (waitDoubleClick) {
        waitDoubleClick = false
        return
      }
      waitDoubleClick = false

      const fileName = itemClickFileNameExtractor(e)
      if (!fileName) {
        return
      }

      // 判断是否按下了Ctrl
      if (e.ctrlKey) {
        if (selectedSet.value.has(fileName)) {
          selectedList.value = selectedList.value.filter(name => name != fileName)
        } else {
          selectedList.value.push(fileName)
        }
      } else {
        selectedList.value = [fileName]
      }
    },
    
    /**
     * 文件项DOM双击回调
     */
    itemDoubleClickFunction(e: PointerEvent) {
      waitDoubleClick = true
    },

    /**
     * 文件列表容器点击回调
     */
    async containerClickFunction(e: PointerEvent) {
      await SfcUtils.sleep(1)
      if (waitDoubleClick) {
        waitDoubleClick = false
        return
      }
      waitDoubleClick = false

      // 没有点击到文件项，则取消所有选中
      const fileName = itemClickFileNameExtractor(e)
      if (!fileName) {
        selectedList.value = []
        return
      }

      // 判断是否按下了Ctrl
      if (e.ctrlKey) {
        if (selectedSet.value.has(fileName)) {
          selectedList.value = selectedList.value.filter(name => name != fileName)
        } else {
          selectedList.value.push(fileName)
        }
      } else {
        selectedList.value = [fileName]
      }
    },

    oncontextmenu(e: PointerEvent) {
      const name = itemClickFileNameExtractor(e)
      if (!name) {
        selectedList.value = []
      } else if(!selectedSet.value.has(name)) {
        selectedList.value = [name]
      }
    }
  }
}

export interface ExposeAttr {
  selectedList: Ref<string[]>,
  selectedSet: Ref<Set<string>>,
  fileList: () => FileInfo[]
}

export function getExpose({ selectedList, selectedSet, fileList }: ExposeAttr): FileExplorerListExpose {
  return {
    getSelectedFileList() {
      return fileList().filter(file => selectedSet.value.has(file.name))
    },
    selectFile(fileName: string[]) {
      selectedList.value = fileName
    }
  }
}