import { computed } from 'vue'
import { context } from '.'

const enabledBg = computed(() => context.bg.value.main?.enabled)
const defaultBgUrl = new URL('/src/assets/img/bg/bg1.jpg', import.meta.url).href
const bgUrl = computed(() => `url("${context.bg.value.main?.url || defaultBgUrl}")`)
const bgOperacity = computed(() => `${context.bg.value.main?.operacity || 0.9}`)
const menuOperacity = computed(() => `${Number(bgOperacity.value) + 0.04}` )
const bgSize = computed(() => `${context.bg.value.main?.size || 'cover'}` )

export {
  enabledBg,
  defaultBgUrl,
  bgUrl,
  bgOperacity,
  menuOperacity,
  bgSize
}