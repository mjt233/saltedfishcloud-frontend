import { computed } from 'vue'
import { context } from '.'
import defaultBgUrl from '@/assets/img/bg/bg1.jpg'

const enabledBg = computed(() => context.bg.value.main?.enabled)
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