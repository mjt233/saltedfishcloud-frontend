<template>
  <v-app :theme="theme">
    <teleport to="body">
      <!-- 全局加载遮罩 -->
      <loading-mask style="position: fixed; z-index: 114514" :style="{'background-color': loadingMaskBgColor}" :loading="loading" />

      <!-- snackbar气泡提示统一容器 -->
      <div class="body-snackbar-container" />

      <!-- 临时调试窗口 -->
      <!-- <debug-console :active="true" /> -->
    </teleport>
    
    <router-view />
    <file-upload-dialog v-model:show="visiableWindows.uploadList" :task-manager="taskManager" />

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

<style scoped>
.body-snackbar-container {
  position: fixed;
  z-index: 999999;
  width: 100vw;
  max-width: 640px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>