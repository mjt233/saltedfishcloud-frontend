<template>
  <DesktopTabsView v-model="curTab" :tabs="tabs" />
</template>

<script setup lang="ts">
const curTab = ref(0)
const props = defineProps({})

const tabs = computed(() => {
  if (!ConditionFunction.hasLogin(context)) {
    return undefined
  } else {
    const user = context.session.value.user
    return [
      {
        uid: context.session.value.user.id,
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

watch(() => context.session.value.user.id, () => {
  console.log('change')
  if (ConditionFunction.hasLogin(context)) {
    curTab.value = context.session.value.user.id
  } else {
    curTab.value = 0
  }
})

onMounted(() => {
  if (ConditionFunction.hasLogin(context)) {
    curTab.value = context.session.value.user.id
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { DesktopTabItem, DesktopTabsView } from 'sfc-common/components'
import { computed } from 'vue'
import { ConditionFunction, context } from 'sfc-common/core'
import { onMounted } from 'vue'
import { EventNameConstants } from 'sfc-common/core/constans/EventName'
import { watch } from 'vue'

export default defineComponent({
  name: 'IndexDesktopView'
})
</script>