import { ref, reactive } from 'vue'

export function useDragManager(showPosition: { top: string, left: string }, emits: any, selectImageCallback: (delta: number) => void, zoomManager: any) {
  const mouseDownPosition = { y: 0, x: 0, imgY: 0, imgX: 0 }
  let moving = false
  const noTransition = ref(false)

  // touch handles
  let touchStartPos = { x: 0, y: 0 }
  
  // pinch & rotate handles
  let isPinching = false
  let touchSessionPinching = false
  let initialPinchDistance = 0
  let initialPinchScale = 100
  let initialPinchAngle = 0
  let initialRotationBase = 0

  const getPinchAngle = (touches: TouchList) => {
    const dx = touches[1].clientX - touches[0].clientX
    const dy = touches[1].clientY - touches[0].clientY
    return (Math.atan2(dy, dx) * 180) / Math.PI
  }

  /**
   * 鼠标/触摸按下的处理
   */
  const startDrag = (x: number, y: number) => {
    mouseDownPosition.x = x
    mouseDownPosition.y = y
    mouseDownPosition.imgX = parseFloat(showPosition.left) || 0
    mouseDownPosition.imgY = parseFloat(showPosition.top) || 0
    moving = true
  }

  /**
   * 鼠标/触摸移动的处理
   */
  const doDrag = (x: number, y: number) => {
    if (!moving) return
    noTransition.value = true
    const moveX = x - mouseDownPosition.x
    const moveY = y - mouseDownPosition.y
    showPosition.left = mouseDownPosition.imgX + moveX + 'px'
    showPosition.top = mouseDownPosition.imgY + moveY + 'px'
  }

  /**
   * 鼠标/触摸释放的处理
   */
  const endDrag = () => {
    noTransition.value = false
    moving = false
  }

  /**
   * 兼容鼠标事件
   */
  const mouseDownHandler = (e: MouseEvent) => {
    if (e.button !== 0) return
    startDrag(e.clientX, e.clientY)
  }
  const mousemoveHandler = (e: MouseEvent) => doDrag(e.clientX, e.clientY)
  const mouseUpHandler = () => endDrag()

  /**
   * 兼容触摸事件（包括滑动切换逻辑及双指缩放逻辑）
   */
  const touchStartHandler = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchSessionPinching = false
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      startDrag(e.touches[0].clientX, e.touches[0].clientY)
    } else if (e.touches.length === 2) {
      touchSessionPinching = true
      isPinching = true
      initialPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      initialPinchScale = zoomManager?.scaleSize.value || 100
      initialPinchAngle = getPinchAngle(e.touches)
      initialRotationBase = zoomManager?.rotateDeg.value || 0
      noTransition.value = true
    }
  }

  const touchMoveHandler = (e: TouchEvent) => {
    if (moving && e.touches.length === 1 && !isPinching && !touchSessionPinching) {
      doDrag(e.touches[0].clientX, e.touches[0].clientY)
    } else if (isPinching && e.touches.length === 2 && zoomManager) {
      const currentPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      const scale = (currentPinchDistance / initialPinchDistance) * initialPinchScale
      zoomManager.setScale(Math.max(10, Math.min(scale, 1600)), true)
      
      const currentAngle = getPinchAngle(e.touches)
      let stepDelta = currentAngle - initialPinchAngle
      
      // Fix wrapping when angle crosses 180/-180 boundary between frames
      if (stepDelta > 180) stepDelta -= 360
      if (stepDelta < -180) stepDelta += 360
      
      initialPinchAngle = currentAngle
      initialRotationBase += stepDelta
      
      zoomManager.rotateDeg.value = initialRotationBase
    }
  }

  const touchEndHandler = (e: TouchEvent) => {
    if (isPinching) {
      if (zoomManager) {
        zoomManager.rotateDeg.value = Math.round(zoomManager.rotateDeg.value / 90) * 90
      }
      isPinching = false
    }
    if (moving && e.changedTouches.length === 1 && !touchSessionPinching) {
      const dx = e.changedTouches[0].clientX - touchStartPos.x
      // 检测较大位移作为滑动切换
      if (Math.abs(dx) > 100) {
        selectImageCallback(dx > 0 ? -1 : 1)
      }
    }
    if (e.touches.length === 0) {
      endDrag()
      touchSessionPinching = false
    }
  }

  return {
    mouseDownPosition,
    noTransition,
    mouseDownHandler,
    mousemoveHandler,
    mouseUpHandler,
    touchStartHandler,
    touchMoveHandler,
    touchEndHandler
  }
}
