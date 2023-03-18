import { MenuGroup } from 'sfc-common/core/context'
import { FileInfo, FileListContext, IdType } from 'sfc-common/model'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
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
   * 启用README.md的预览功能
   */
  previewReadme: {
    type: Boolean,
    default: false
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
  /**
   * 是否显示挂载目录图表
   */
  showMountIcon: {
    type: Boolean,
    default: false
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
  },
  /**
   * 是否启用选择功能
   */
  useSelect: {
    type: Boolean,
    default: true
  },
  /**
   * 访问的文件资源协议
   */
  protocol: {
    type: String,
    default: 'main'
  },
  /**
   * 目标资源的id
   */
  targetId: {
    type: [String, Number] as PropType<IdType>,
    default: undefined
  }
}
export default propsOptions