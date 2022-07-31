import { MenuGroup } from '@/core/context'
import { FileInfo, FileListContext } from '@/core/model'
import { LoadingManager } from '@/utils/LoadingManager'
import { PropType, defineProps } from 'vue'

const propsOptions = {
  readOnly: {
    type: Boolean,
    default: true
  },
  fileList: {
    type: Array as PropType<FileInfo[]>,
    default: () => []
  },
  showBack: {
    type: Boolean,
    default: true
  },
  /**
   * 文件列表所处的路径
   */
  path: {
    type: String,
    default: '/'
  },
  menu: {
    type: Array as PropType<MenuGroup<FileListContext>[]>,
    default: () => []
  },
  height: {
    type: Number,
    default: undefined
  },
  uid: {
    type: [Number, String],
    default: 0
  },
  loadingManager: {
    type: Object as PropType<LoadingManager>,
    default: undefined
  },
  /**
   * 文件列表展示视图类型，list - 表格列表，grid - 栅格平铺
   */
  type: {
    type: String as PropType<'list' | 'grid'>,
    default: 'list'
  }
}
export default propsOptions