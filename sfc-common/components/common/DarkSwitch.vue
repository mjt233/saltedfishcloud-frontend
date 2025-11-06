<template>
  <div>
    <v-switch
      v-if="!brightness"
      hide-details
      :model-value="inDark"
      color="primary"
      density="compact"
      @click="switchDark"
    />
    <template v-else>
      <v-btn v-if="inDark" icon="mdi-brightness-3" @click="switchDark" />
      <v-btn v-else icon="mdi-brightness-6" @click="switchDark" />
    </template>
  </div>
</template>

<script setup lang="ts">
const inDark = computed(() => {
  return getContext().theme.value == 'dark' 
})

const switchDark = () => {
  getContext().theme.value = inDark.value ? getContext().originTheme.value : 'dark'
}
const props = defineProps({
  brightness: {
    type: [Boolean, String],
    default: false
  }
})
</script>

<script lang="ts">
import { getContext } from 'sfc-common/core/context'
import { computed } from '@vue/reactivity'
import { defineComponent, defineProps } from 'vue'

export default defineComponent({
  name: 'DarkSwitch'
})
</script>