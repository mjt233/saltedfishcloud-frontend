import { ref, onMounted, onUnmounted, isRef, unref, Ref, watch } from 'vue'

type MaybeElement = HTMLElement | undefined | null
type MaybeElementRef = MaybeElement | (() => MaybeElement) | Ref<MaybeElement>

/**
 * 根据所在的 DOM 元素宽度，动态计算 VCol 适合的 cols 值
 * 用于替代依赖全局页面宽度的 cols / md / lg 属性
 *
 * 计算规则基于 Vuetify 默认断点：
 * < 960px: cols 12 (对应默认 xs, sm)
 * 960px - 1279px: cols 6 (对应默认 md)
 * >= 1280px: cols 4 (对应默认 lg, xl)
 */
export function useDynamicColCols(target: MaybeElementRef): Ref<number> {
  const cols = ref(12)
  let observer: ResizeObserver | null = null

  const calculateCols = (width: number) => {
    if (width < 960) {
      cols.value = 12
    } else if (width < 1280) {
      cols.value = 6
    } else {
      cols.value = 3
    }
  }

  const getElement = () => {
    if (typeof target === 'function') {
      return target()
    }
    return unref(target)
  }

  onMounted(() => {
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
          calculateCols(entry.borderBoxSize[0].inlineSize)
        } else {
          calculateCols(entry.contentRect.width)
        }
      }
    })

    const el = getElement()
    if (el) {
      observer.observe(el)
      calculateCols(el.getBoundingClientRect().width)
    }

    if (typeof target === 'function' || isRef(target)) {
      watch(() => getElement(), (newEl, oldEl) => {
        if (oldEl && observer) observer.unobserve(oldEl)
        if (newEl && observer) {
          observer.observe(newEl)
          calculateCols(newEl.getBoundingClientRect().width)
        }
      })
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return cols
}
