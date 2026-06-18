<template>
  <DesktopTabsView v-model="curTab" :tabs="tabs" />
</template>

<script setup lang="ts">
const curTab = ref(0)
const props = defineProps({})

const tabs = computed(() => {
  if (!ConditionFunction.hasLogin(getContext())) {
    return undefined
  } else {
    const user = getContext().session.value.user
    return [
      {
        uid: getContext().session.value.user.id,
        label: '我的桌面',
        id: user.id
      },
      {
        uid: 0,
        label: '公共桌面',
        id: 0
      }
    ] as DesktopTabItem[]
  }
})

const eventBus = useEventBus()

watch(() => getContext().session.value.user.id, () => {
  console.log('change')
  if (ConditionFunction.hasLogin(getContext())) {
    curTab.value = getContext().session.value.user.id
  } else {
    curTab.value = 0
  }
})

watch(curTab, tab => {
  eventBus.emit(EventNameConstants.DESKTOP_TAB_CHANGE, tab)
})

onMounted(() => {
  if (ConditionFunction.hasLogin(getContext())) {
    curTab.value = getContext().session.value.user.id
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { DesktopTabItem, DesktopTabsView } from 'sfc-common/components'
import { computed } from 'vue'
import { ConditionFunction, getContext } from 'sfc-common/core'
import { onMounted } from 'vue'
import { EventNameConstants } from 'sfc-common/core/constans/EventName'
import { watch } from 'vue'
import { useEventBus } from 'sfc-common/composables'

export default defineComponent({
  name: 'IndexDesktopView'
})
</script>