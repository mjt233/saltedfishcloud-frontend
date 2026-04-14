import { PropType } from 'vue'
import { FileInfo } from 'sfc-common/model'

export const imageViewerProps = {
  /**
   * 待预览的图片列表
   */
  fileList: {
    type: Array as PropType<FileInfo[]>,
    default: () => []
  },
  /**
   * 外部指定要预览的图片下标
   */
  imageIndex: {
    type: Number,
    default: 0
  },
  /**
   * 主图的url生成策略函数，默认使用根据md5加载
   */
  urlGenerator: {
    type: Function as PropType<((fileInfo: FileInfo) => string)>,
    default: undefined
  },
  /**
   * 缩略图的自定义url生成器
   */
  thumbnailUrlGenerator: {
    type: Function as PropType<((fileInfo: FileInfo) => string)>,
    default: undefined
  }
}

export const imageViewerEmits = ['close', 'update:imageIndex']

export interface ImageViewerExpose {
  /**
   * 选择一张图片预览
   * @param idx 图片下标索引
   */
  selectImage: (idx: number) => Promise<void>
  /**
   * 设置主图缩放大小
   * @param scale 缩放大小
   * @param fromCenter 是否从图像中间锚点缩放
   */
  setScale: (scale: number, fromCenter?: boolean) => Promise<void>
  /**
   * 使图片定位居中
   */
  setCenter: () => void
  /**
   * 设置图片为自适应尺寸
   */
  setAdaptSize: () => void
}
