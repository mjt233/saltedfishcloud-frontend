<template>
  <v-radio-group>
    <v-radio
      v-for="(item, idx) in props.subtitleList"
      :key="idx"
      color="primary"
      :label="item.title"
      :value="item"
    />
  </v-radio-group>
</template>

<script setup lang="ts">
const props = defineProps({
  subtitleList: {
    type: Array as PropType<Subtitle[]>,
    default: () => []
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { Subtitle } from '../model'

export default defineComponent({
  name: 'SubtitleSelector'
})
</script>