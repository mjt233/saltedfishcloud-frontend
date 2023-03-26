<template>
  <v-radio-group>
    <v-radio
      v-for="item in props.subtitles"
      :key="item.index"
      color="primary"
      :label="`${item.language}${item.title ? '(' + item.title + ')' : ''}`"
      :value="item"
    />
  </v-radio-group>
</template>

<script setup lang="ts">
const props = defineProps({
  subtitles: {
    type: Array as PropType<StreamInfo[]>,
    default: () => []
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { StreamInfo } from '../model'

export default defineComponent({
  name: 'SubtitleSelector'
})
</script>