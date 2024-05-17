<template>
  <div class="desktop-tabs-view">
    <VTabs
      color="primary"
      :model-value="curTab"
      align-tabs="center"
      @update:model-value="curTab = $event;emits('update:modelValue', $event)"
    >
      <VTab
        v-for="item in tabs"
        :key="item.id"
        v-ripple
        :value="item.id"
      >
        {{ item.label }}
      </VTab>
    </VTabs>
    <VWindow v-if="curTab !== undefined" :model-value="curTab" @update:model-value="curTab = $event;emits('update:modelValue', $event)">
      <VWindowItem
        v-for="item in tabs"
        :key="item.id"
        :value="item.id"
        :eager="true"
      >
        <DesktopView :uid="item.uid" />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<script setup lang="ts">
const curTab = ref()
const props = defineProps({
  tabs: {
    type: Array as PropType<DesktopTabItem[]>,
    default: () => [{
      uid: 0,
      label: '公共桌面',
      id: 0
    }]
  },
  modelValue: {
    type: [String, Number],
    default: undefined
  }
})
const emits = defineEmits<{
  (e: 'update:modelValue', val: IdType): void
}>()

onMounted(() => {
  if (props.modelValue == undefined) {
    curTab.value = props.tabs[0].id
  }
})
watch(() => props.modelValue, () => {
  if (props.modelValue !== null && props.modelValue !== undefined ) {
    curTab.value = props.modelValue
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { DesktopTabItem } from './type'
import { IdType } from 'sfc-common/model'
import DesktopView from './DesktopView.vue'
import { onMounted } from 'vue'
import { watch } from 'vue'

export default defineComponent({
  name: 'DesktopTabsView'
})
</script>