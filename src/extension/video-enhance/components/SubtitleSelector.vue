<template>
  <v-radio-group>
    <v-radio
      v-for="item in props.subtitles"
      :key="item.no"
      color="primary"
      :label="`${item.remark}${item.title ? '(' + item.title + ')' : ''}`"
      :value="item.no"
    />
  </v-radio-group>
</template>

<script setup lang="ts">
const props = defineProps({
  subtitles: {
    type: Array as PropType<SubtitleStream[]>,
    default: () => []
  }
})
</script>

<script lang="ts">
import { VRadio, VRadioGroup } from 'vuetify/components'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { SubtitleStream } from '../model'

export default defineComponent({
  name: 'SubtitleSelector'
})
</script>