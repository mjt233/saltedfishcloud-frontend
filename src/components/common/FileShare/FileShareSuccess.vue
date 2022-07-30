<template>
  <div class="base-form" style="--form-label-width: 96px; --row-height: 64px">
    <v-row class="form-row">
      <v-col>
        <span class="form-label">分享链接：</span>
        <a
          target="_blank"
          :href="link"
          class="link break-text"
          style="font-size: 14px"
        >{{ link }}</a>
      </v-col>
    </v-row>
    <v-row class="form-row">
      <v-col v-if="data?.extractCode">
        <span class="form-label">提取码：</span>
        <span class="tip">{{ data?.extractCode }}</span>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object as PropType<ShareInfo>,
    default: undefined
  }
})
const link = computed(() => {
  return StringUtils.appendPath(location.origin, '#/s', (props.data?.id || '') + '', props.data?.verification || '')
})
</script>

<script lang="ts">
import { ShareInfo } from '@/api/share'
import { StringUtils } from '@/utils/StringUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'

export default defineComponent({
  name: 'FileShareSuccess'
})
</script>