<template>
  <div class="upload-list elevation-2" :class="{'hid': !show}">
    <v-tabs
      v-model="tab"
      
      fixed-tabs
    >
      <v-tab value="upload">
        上传中
      </v-tab>
      <v-tab value="finish">
        已完成
      </v-tab>
      <v-tab value="failed">
        传输失败
      </v-tab>
    </v-tabs>
    <div>

      <v-window :model-value="tab">
        <v-window-item value="upload">
          上传中
        </v-window-item>
        <v-window-item value="finish">
          已完成
        </v-window-item>
        <v-window-item value="failed">
          失败
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = context.session
const tab = ref('upload')
const props = defineProps({
  show: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits(['update:show'])
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits, computed } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileUploadList'
})
</script>


<style lang="scss" scope>
.upload-list {
  position: fixed;
  top: 32px;
  z-index: 1100;
  right: 10px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  max-width: 720px;
  max-height: 400px;
  margin: 20px;
  background-color: rgb(var(--v-theme-background));
  border: 1px solid rgba(var(--v-theme-primary), .2);
  transition: all .2s;
  &.hid {
    opacity: 0;
    transform: translateY(30px);
    pointer-events: none;
  }
}
</style>