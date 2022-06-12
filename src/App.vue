<template>
  <v-app :theme="theme">
    <router-view />
    <file-upload-list v-model:show="visiableWindows.uploadList" />
  </v-app>
  
</template>
<script setup lang="ts">
import FileUploadList from './components/common/FileUpload/FileUpload.vue'
const theme = context.theme
const visiableWindows = context.visiableWindows.value
</script>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { context } from './core/context'

export default defineComponent({
  name: 'App',
  data() {
        
    return {
      //
    }
  }
})
</script>
