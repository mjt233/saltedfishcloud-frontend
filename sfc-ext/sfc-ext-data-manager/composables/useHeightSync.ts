import { useResizeObserver } from 'sfc-common'
import { ref } from 'vue'

/**
 * 同步一个元素的高度
 * @param el 需要取高度的元素
 * @returns 读取的高度响应式引用
 */
export function useHeightSync(el: () => HTMLElement) {
  const height = ref<number>()
  useResizeObserver(el, r => {
    height.value = r[0].contentRect.height
  })
  return height
}