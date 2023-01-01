<template>
  <v-app :theme="theme">
    <loading-mask :loading="loading" />
    <router-view />
    <file-upload v-model:show="visiableWindows.uploadList" :task-manager="taskManager" />
  </v-app>
  
</template>
<script setup lang="ts">
import FileUpload from './components/common/FileUpload/FileUpload.vue'
import { fileUploadTaskManager } from './core/serivce/FileUpload'
const theme = context.theme
const visiableWindows = context.visiableWindows.value
const taskManager = fileUploadTaskManager
const loading = SfcUtils.getGlobalLoadingManager().getLoadingRef()
</script>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { context } from './core/context'
import SfcUtils from './utils/SfcUtils'

export default defineComponent({
  name: 'App',
  data() {
        
    return {
      //
    }
  }
})
</script>
