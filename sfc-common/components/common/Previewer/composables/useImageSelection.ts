import { ref, computed, nextTick, watch, Ref } from 'vue'
import { FileInfo } from 'sfc-common/model'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import API from 'sfc-common/api'

export function useImageSelection(props: any, emits: any, zoomManager: any) {
  const activeIdx = ref(0)
  const showMainImg = ref(true)

  /**
   * 选择一张图片预览
   * @param idx 图片下标索引
   */
  const selectImage = async (idx: number) => {
    activeIdx.value = idx
    zoomManager.setAdaptSize()
    await nextTick()
    zoomManager.setCenter()
    emits('update:imageIndex', idx)
  }

  /**
   * 切换图片，正数向下，负数向上
   * @param delta 偏移量
   */
  const switchImage = (delta: number) => {
    let nextIdx = activeIdx.value + delta
    if (nextIdx < 0) {
      nextIdx = props.fileList.length - 1
    } else if (nextIdx >= props.fileList.length) {
      nextIdx = 0
    }
    selectImage(nextIdx)
  }

  /**
   * 图片的显示地址
   */
  const imgSrc = computed(() => {
    const targetFile = props.fileList[activeIdx.value]
    if (!targetFile) return ''
    if (props.urlGenerator) {
      return props.urlGenerator(targetFile)
    } else {
      return StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(targetFile.md5, targetFile.name).url)
    }
  })

  watch(() => props.imageIndex, () => {
    if (props.imageIndex != activeIdx.value) {
      selectImage(props.imageIndex)
    }
  })

  return {
    activeIdx,
    showMainImg,
    selectImage,
    switchImage,
    imgSrc
  }
}
