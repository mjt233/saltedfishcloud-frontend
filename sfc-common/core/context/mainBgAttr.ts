import { computed } from 'vue'
import { getContext } from '.'
import defaultBgUrl from 'sfc-common/assets/img/bg/bg1.jpg'

// 全局属性
const enabledBg = computed(() => getContext().bg.value.main?.enabled)
const bgUrl = computed(() => `url("${getContext().bg.value.main?.url || defaultBgUrl}")`)
const bgOperacity = computed(() => `${getContext().bg.value.main?.operacity || 0.9}`)
const menuOperacity = computed(() => `${Number(bgOperacity.value) + 0.04}` )
const bgSize = computed(() => `${getContext().bg.value.main?.size || 'cover'}`)
const globalGassValue = computed(() => `${getContext().bg.value.main?.globalGassValue || 0}px`)

// 局部属性 - 卡片
const enabledGlass = computed(() => getContext().bg.value.main?.enabledCardEffect || false)
const cardOpacity = computed(() => `${getContext().bg.value.main?.cardOpacity || 0}`)
const cardGassValue = computed(() => `${getContext().bg.value.main?.cardGassValue || 0}px`)

// 局部属性 - 抽屉
const enabledDrawerEffect = computed(() => getContext().bg.value.main?.enabledDrawerEffect)
const drawerOpacity = computed(() => `${getContext().bg.value.main?.drawerOpacity || 0}`)
const drawerGassValue = computed(() => `${getContext().bg.value.main?.drawerGassValue || 0}px`)

export {
  // 全局属性
  enabledBg,
  defaultBgUrl,
  bgUrl,
  bgOperacity,
  menuOperacity,
  bgSize,
  globalGassValue,

  // 局部属性 - 卡片
  enabledGlass,
  cardOpacity,
  cardGassValue,

  // 局部属性 - 抽屉
  enabledDrawerEffect,
  drawerOpacity,
  drawerGassValue,
}