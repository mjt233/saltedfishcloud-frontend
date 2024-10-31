import { computed } from 'vue'
import { getContext } from '.'
import defaultBgUrl from 'sfc-common/assets/img/bg/bg1.jpg'

const enabledBg = computed(() => getContext().bg.value.main?.enabled)
const bgUrl = computed(() => `url("${getContext().bg.value.main?.url || defaultBgUrl}")`)
const bgOperacity = computed(() => `${getContext().bg.value.main?.operacity || 0.9}`)
const menuOperacity = computed(() => `${Number(bgOperacity.value) + 0.04}` )
const bgSize = computed(() => `${getContext().bg.value.main?.size || 'cover'}` )

export {
  enabledBg,
  defaultBgUrl,
  bgUrl,
  bgOperacity,
  menuOperacity,
  bgSize
}