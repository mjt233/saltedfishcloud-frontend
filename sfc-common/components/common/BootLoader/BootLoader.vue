<template>
  <v-app>
    <div v-if="attr.interruptMsg && attr.interruptMsg.length > 0" style="color: rgb(var(--v-theme-error));">
      {{ attr.interruptMsg }}
    </div>
    <div v-else>
      正在加载...
    </div>
    <div v-if="!attr.interruptMsg">
      <span>状态：</span>
      <span class="title">{{ attr.title }}</span>
    </div>
    <v-progress-linear
      style="width: 100%; margin: 6px 0"
      color="primary"
      :model-value="prog"
    />
    <v-divider style="margin: 6px 0" />
    <div class="log-box">
      <div v-for="(log,idx) in attr.logData" :key="idx">
        <span :style="{color: `rgb(var(--v-theme-${log.type}))`}">{{ log.message }}</span> 
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">

const attr = reactive({
  title: '',
  logData: [] as LogData[],
  interruptMsg: ''
})
const prog = ref(0)
const bootHandler: BootContextHandler = {
  setBootTaskTitle: function(title: string): void {
    attr.title = title
  },
  logError: function(msg: string): void {
    attr.logData.unshift({
      type: 'error',
      message: msg
    })
  },
  logWarning: function(msg: string): void {
    attr.logData.unshift({
      type: 'warning',
      message: msg
    })
  },
  logInfo: function(msg: string): void {
    attr.logData.unshift({
      type: 'info',
      message: msg
    })
  },
  updateProgress(max, val) {
    prog.value = val / max * 100
  },
  setInterruptMsg(msg) {
    attr.interruptMsg = msg
  }
}
defineExpose(bootHandler)
</script>

<script lang="ts">
import { BootContextHandler } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, getCurrentInstance, toRefs } from 'vue'
import { LogData } from './type'

export default defineComponent({
  name: 'BootLoader'
})
</script>