<template>
  <div style="width: 32px; cursor: pointer;">
    <v-switch
      v-if="!brightness"
      hide-details
      :model-value="inDark"
      color="primary"
      @click="switchDark"
    />
    <template v-else>
      <v-icon v-if="inDark" icon="mdi-brightness-3" @click="switchDark" />
      <v-icon v-else icon="mdi-brightness-6" @click="switchDark" />
    </template>
  </div>
</template>

<script setup lang="ts">
const inDark = computed(() => {
  return context.theme.value == 'dark' 
})

const switchDark = () => {
  context.theme.value = inDark.value ? context.originTheme.value : 'dark'
}
const props = defineProps({
  brightness: {
    type: [Boolean, String],
    default: false
  }
})
</script>

<script lang="ts">
import { context } from '@/core/context'
import { computed } from '@vue/reactivity'
import { defineComponent, defineProps } from 'vue'

export default defineComponent({
  name: 'DarkSwitch'
})
</script>