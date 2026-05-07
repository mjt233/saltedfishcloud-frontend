import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyboardManager(toClose: () => void, switchImage: (delta: number) => void) {
  /**
   * 键盘按键的处理函数
   * @param e 事件
   */
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      toClose()
    } else if (e.key === 'ArrowLeft') {
      switchImage(-1)
    } else if (e.key === 'ArrowRight') {
      switchImage(1)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', keyHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', keyHandler)
  })

  return {
    keyHandler
  }
}
