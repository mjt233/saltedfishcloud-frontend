import { ref, computed, Ref, nextTick } from 'vue'
import { useElementSize } from '@vueuse/core'

export function useZoomManager(containerRef: Ref<HTMLElement | undefined>, imgRef: Ref<any>, showPosition: { top: string, left: string }) {
  const scaleSize = ref(100)
  const naturalSize = ref({ height: 0, width: 0 })
  const { width: containerWidth, height: containerHeight } = useElementSize(containerRef)

  const showSize = computed(() => {
    return {
      height: (naturalSize.value.height * scaleSize.value / 100) + 'px',
      width: (naturalSize.value.width * scaleSize.value / 100) + 'px',
    }
  })

  const isOverflowing = computed(() => {
    const w = parseFloat(showSize.value.width) || 0
    const h = parseFloat(showSize.value.height) || 0
    const top = parseFloat(showPosition.top) || 0
    const bottomBarHeight = 160
    
    if (w > containerWidth.value + 1) return true
    
    return top + h > containerHeight.value - bottomBarHeight + 5
  })

  /**
   * 设置主图缩放大小
   * @param scale 缩放大小
   * @param fromCenter  是否从图像中间锚点缩放 
   */
  const setScale = async(scale: number, fromCenter?: boolean) => {
    if (!fromCenter) {
      scaleSize.value = scale
    } else {
      const originWidth = parseFloat(showSize.value.width)
      const originHeight = parseFloat(showSize.value.height)
      scaleSize.value = scale
      await nextTick()
      const newWidth = parseFloat(showSize.value.width)
      const newHeight = parseFloat(showSize.value.height)
      showPosition.left = parseFloat(showPosition.left) - ((newWidth - originWidth) / 2) + 'px'
      showPosition.top = parseFloat(showPosition.top) - ((newHeight - originHeight) / 2) + 'px'
    }
  }

  /**
   * 使图片定位居中
   */
  const setCenter = () => {
    if (!containerRef.value) return
    const { width, height } = showSize.value
    const { clientHeight: containerHeight, clientWidth: containerWidth } = containerRef.value
    
    // 留出底部工具栏（约160px）的空间，确保居中时不遮盖
    const usableHeight = Math.max(containerHeight - 160, 0)
    
    const imgWidth = parseFloat(width), imgHeight = parseFloat(height)
    showPosition.top = (usableHeight - imgHeight) / 2 + 'px'
    showPosition.left = (containerWidth - imgWidth) / 2 + 'px'
  }

  /**
   * 设置图片为自适应尺寸
   */
  const setAdaptSize = () => {
    if (!imgRef.value || !imgRef.value.image || !containerRef.value) return
    const imgWidth = imgRef.value.image.naturalWidth
    const imgHeight = imgRef.value.image.naturalHeight
    const { clientHeight: containerHeight, clientWidth: containerWidth } = containerRef.value

    // 在自适应计算高度时同样刨去底部栏的高度，避免缩放后依然被遮盖
    const usableHeight = Math.max(containerHeight - 160, 100)

    if (imgWidth <= containerWidth && imgHeight <= usableHeight) {
      scaleSize.value = 100
      return
    }
    const xRatio = containerWidth / imgWidth * 100
    const yRatio = usableHeight / imgHeight * 100
    scaleSize.value = Math.min(xRatio, yRatio)
  }

  /**
   * 双击行为：在100%和AdaptSize之间切换
   */
  const handleDoubleClick = () => {
    if (scaleSize.value >= 100) {
      setAdaptSize()
    } else {
      setScale(100, true)
    }
    setCenter()
  }

  return {
    scaleSize,
    naturalSize,
    showSize,
    isOverflowing,
    setScale,
    setCenter,
    setAdaptSize,
    handleDoubleClick
  }
}
