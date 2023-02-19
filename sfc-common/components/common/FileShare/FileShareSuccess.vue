<template>
  <div class="base-form" style="--form-label-width: 96px; --row-height: 64px">
    <v-row class="form-row">
      <v-col>
        <span class="form-label">分享链接：</span>
        <a
          target="_blank"
          class="link break-text"
          style="font-size: 14px"
          @click="doCopy"
        >
          {{ link }}
        </a>
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
  return ShareService.getShareLink(props.data as ShareInfo)
})
const doCopy = () => {
  ShareService.copyShareLinkText(props.data as ShareInfo)
}
</script>

<script lang="ts">
import { ShareInfo } from 'sfc-common/api/share'
import { ShareService } from 'sfc-common/core/serivce/ShareService'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'

export default defineComponent({
  name: 'FileShareSuccess'
})
</script>