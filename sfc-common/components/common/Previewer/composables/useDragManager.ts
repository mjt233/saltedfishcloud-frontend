import { ref, reactive } from 'vue'

export function useDragManager(showPosition: { top: string, left: string }, emits: any, selectImageCallback: (delta: number) => void) {
  const mouseDownPosition = { y: 0, x: 0, imgY: 0, imgX: 0 }
  let moving = false
  const noTransition = ref(false)

  // touch handles
  let touchStartPos = { x: 0, y: 0 }

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
   * 兼容触摸事件（包括滑动切换逻辑）
   */
  const touchStartHandler = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      startDrag(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const touchMoveHandler = (e: TouchEvent) => {
    if (moving && e.touches.length === 1) {
      doDrag(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const touchEndHandler = (e: TouchEvent) => {
    if (moving && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartPos.x
      // 检测较大位移作为滑动切换
      if (Math.abs(dx) > 100) {
        selectImageCallback(dx > 0 ? -1 : 1)
      }
    }
    endDrag()
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
