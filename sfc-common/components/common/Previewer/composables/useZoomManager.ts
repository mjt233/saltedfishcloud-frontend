import { ref, computed, Ref, nextTick, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

export function useZoomManager(containerRef: Ref<HTMLElement | undefined>, imgRef: Ref<any>, showPosition: { top: string, left: string }, isFullscreen?: Ref<boolean>) {
  const scaleSize = ref(100)
  const naturalSize = ref({ height: 0, width: 0 })
  const rotateDeg = ref(0)
  const { width: containerWidth, height: containerHeight } = useElementSize(containerRef)

  watch([containerWidth, containerHeight], async() => {
    if (containerWidth.value && containerHeight.value && imgRef.value?.image) {
      await nextTick()
      setAdaptSize()
      setCenter()
    }
  })

  const showSize = computed(() => {
    return {
      height: (naturalSize.value.height * scaleSize.value / 100) + 'px',
      width: (naturalSize.value.width * scaleSize.value / 100) + 'px',
    }
  })

  const isOverflowing = computed(() => {
    if (isFullscreen?.value) return false
    const h = parseFloat(showSize.value.height) || 0
    const top = parseFloat(showPosition.top) || 0
    const bottomBarHeight = 160
    
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
    
    // 全屏模式下不要留出底部工具栏空间
    const usableHeight = isFullscreen?.value ? containerHeight : Math.max(containerHeight - 160, 0)
    
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

    // 全屏模式下不要留出底部工具栏空间
    const usableHeight = isFullscreen?.value ? containerHeight : Math.max(containerHeight - 160, 100)

    const xRatio = containerWidth / imgWidth * 100
    const yRatio = usableHeight / imgHeight * 100
    
    // 如果不是全屏且图片比容器小，则不放大图片，保持100%
    if (!isFullscreen?.value && imgWidth <= containerWidth && imgHeight <= usableHeight) {
      scaleSize.value = 100
      return
    }
    
    scaleSize.value = Math.min(xRatio, yRatio)
  }

  /**
   * 双击行为：在100%和AdaptSize之间切换
   */
  const handleDoubleClick = async() => {
    const originScale = scaleSize.value
    setAdaptSize()
    const adaptScale = scaleSize.value

    // 如果当前就是AdaptSize，那就切换到100%
    if (Math.abs(originScale - adaptScale) < 0.1) {
      setScale(100)
    } else {
      // 否则切换到AdaptSize
      scaleSize.value = adaptScale
    }
    await nextTick()
    setCenter()
  }

  const rotateBy = (delta: number) => {
    rotateDeg.value = rotateDeg.value + delta
  }

  const rotateLeft = () => rotateBy(-90)
  const rotateRight = () => rotateBy(90)
  const resetRotate = () => { rotateDeg.value = 0 }

  return {
    scaleSize,
    naturalSize,
    showSize,
    rotateDeg,
    isOverflowing,
    setScale,
    setCenter,
    setAdaptSize,
    handleDoubleClick,
    rotateBy,
    rotateLeft,
    rotateRight,
    resetRotate
  }
}
