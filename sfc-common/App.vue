<template>
  <v-app
    :theme="theme"
    :class="{
      'bg-main-view': enabledBg,
      'enabled-card-effect': enabledGlass,
      'enabled-drawer-effect': enabledDrawerEffect,
      'global-gass': globalGassValue != '0px'
    }"
    :style="{
      '--v-card-glass-value': cardGassValue,
      '--v-card-opacity': cardOpacity,
      '--v-drawer-gass-value': drawerGassValue,
      '--v-drawer-opacity': drawerOpacity
    }"
  >
    <teleport to="body">
      <!-- 全局加载遮罩 -->
      <loading-mask style="position: fixed; z-index: 114514" :style="{'background-color': loadingMaskBgColor}" :loading="loading" />

      <!-- snackbar气泡提示统一容器 -->
      <div class="body-snackbar-container" />

      <!-- 临时调试窗口 -->
      <!-- <debug-console :active="true" /> -->
    </teleport>
    
    <router-view />
    <file-upload-dialog v-model:show="visiableWindows.uploadList" :task-manager="taskManager" :auto-hide="true" />

  </v-app>
  
</template>
<script setup lang="ts">
import 'sfc-common/styles/common.scss'
import FileUploadDialog from './components/common/FileUpload/FileUploadDialog.vue'
import { fileUploadTaskManager } from 'sfc-common/core/serivce/FileUpload'
const theme = getContext().theme
const visiableWindows = getContext().visiableWindows.value
const taskManager = fileUploadTaskManager
const loading = SfcUtils.getGlobalLoadingManager().getLoadingRef()

const loadingMaskBgColor = computed(() => {
  if (getContext().theme.value == 'dark') {
    return 'rgba(0, 0, 0, .4)'
  } else {
    return 'rgba(255, 255, 255, .4)'
  }
})
</script>

<script lang="ts">
import {
  enabledBg,
  bgUrl,
  bgOperacity,
  menuOperacity,
  bgSize, 
  enabledGlass,
  globalGassValue,
  cardGassValue,
  cardOpacity,
  enabledDrawerEffect,
  drawerGassValue,
  drawerOpacity
} from 'sfc-common/core/context/mainBgAttr'
import { computed, defineComponent, reactive, ref } from 'vue'
import { getContext } from 'sfc-common/core/context'
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

<style scoped lang="scss">
.body-snackbar-container {
  position: fixed;
  z-index: 999999;
  width: 100vw;
  max-width: 640px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}



.bg-main-view {
  position: relative;
  background-image: v-bind(bgUrl);
  background-size: v-bind(bgSize);
  background-attachment: fixed;

  &.global-gass {
    &::before {
      backdrop-filter: blur(v-bind(globalGassValue));
    }
  }

  &::before {
    content: '';
    position: fixed;
    background: rgba(var(--v-theme-background), v-bind(bgOperacity));
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}


</style>

<style lang="scss">

// 启用玻璃毛边效果
.enabled-card-effect {

  // VCard卡片
  .v-card--variant-elevated {
    backdrop-filter: blur(var(--v-card-glass-value));
    background: rgba(var(--v-theme-surface), var(--v-card-opacity));

    .v-table {
      background: transparent;
      thead>tr>th {
        
      }
    }
  }
}

.enabled-drawer-effect .bg-drawer {
  backdrop-filter: blur(v-bind(drawerGassValue)) !important;
  background: rgba(var(--v-theme-background), v-bind(drawerOpacity)) !important;
}
</style>