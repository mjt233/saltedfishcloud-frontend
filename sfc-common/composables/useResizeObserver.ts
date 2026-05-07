import { onMounted, onUnmounted } from 'vue'

export function useResizeObserver(el: () => HTMLElement, callback: ResizeObserverCallback) {
  const observer = new ResizeObserver(callback)
  onMounted(() => {
    if (el()) {
      observer.observe(el())
    }
  })
  onUnmounted(() => {
    observer.disconnect()
  })
}