<template>
  <div>
    <span>离线下载任务</span>
    <v-btn
      v-if="canOpenCreate"
      icon
      size="small"
      flat
      style="margin-left: 12px"
      @click="openCreate"
    >
      <v-icon style="font-size: 20px;margin-right: 1px;margin-bottom: 1px;">
        mdi-plus
      </v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  path: {
    type: String,
    default: '/'
  },
  canOpenCreate: {
    type: Boolean,
    default: false
  }

})
const openCreate = () => {
  DownloadTaskService.openCreateTask(props.uid, props.path, false)
}
</script>

<script lang="ts">
import { DownloadTaskService } from 'sfc-common/core/serivce/DownloadTaskService'
import { defineComponent, defineProps } from 'vue'

export default defineComponent({
  name: 'DownloadTaskHeader'
})
</script>