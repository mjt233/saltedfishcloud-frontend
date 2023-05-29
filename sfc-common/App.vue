<template>
  <v-app :theme="theme">
    <teleport to="body">
      <loading-mask style="position: fixed; z-index: 114514" :style="{'background-color': loadingMaskBgColor}" :loading="loading" />
    </teleport>
    
    <router-view />
    <file-upload-dialog v-model:show="visiableWindows.uploadList" :task-manager="taskManager" />
    <!-- <debug-console :active="true" /> -->
  </v-app>
  
</template>
<script setup lang="ts">
import { fileUploadTaskManager } from 'sfc-common/core/serivce/FileUpload'
const theme = context.theme
const visiableWindows = context.visiableWindows.value
const taskManager = fileUploadTaskManager
const loading = SfcUtils.getGlobalLoadingManager().getLoadingRef()

const loadingMaskBgColor = computed(() => {
  if (context.theme.value == 'dark') {
    return 'rgba(0, 0, 0, .4)'
  } else {
    return 'rgba(255, 255, 255, .4)'
  }
})
</script>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { context } from 'sfc-common/core/context'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export default defineComponent({
  name: 'App',
  data() {
        
    return {
      //
    }
  }
})
</script>