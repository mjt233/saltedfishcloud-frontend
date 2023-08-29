<template>
  <VCard class="ws-card">
    <template #title>
      <div class="d-flex align-center justify-between" style="width: 100%">
        <div class="status-icon elevation-2" :class="{active: session?.running}" />
        <div class="d-flex align-center text-primary" style="width: 100%">
          <div style="width: 40px;">
            <CommonIcon icon="mdi-console" />
          </div>
          <div>{{ session?.name }}</div>
          <CommonIcon class="edit-icon" icon="mdi-pencil" @click="rename" />
        </div>
        <div class="d-flex align-center">
          <VBtn
            v-if="!session?.running"
            style="margin-right: 6px;"
            icon="mdi-restart"
            title="重启会话"
            size="small"
            flat
            @click="restart"
          />
          <VBtn
            v-else
            style="margin-right: 6px;"
            icon="mdi-stop"
            title="终止进程"
            size="small"
            flat
            @click="kill"
          />
          <VBtn
            icon="mdi-open-in-new" 
            style="margin-right: 6px;"
            size="small"
            title="打开控制台"
            flat
            @click="emits('openConsole')"
          />
          <VBtn
            icon="mdi-close" 
            size="small"
            title="删除会话"
            flat
            @click="remove"
          />
        </div>
      </div>
    </template>
    <VCardText>
      <div class="d-flex">
        <div class="tip">
          <div class="d-flex">
            <div style="width: 81px;text-align: right;">
              创建于：
            </div>
            <div>{{ StringFormatter.toDate(Number(session?.createAt)) }}</div>
          </div>
          <div class="d-flex">
            <div style="width: 81px;text-align: right;">
              执行主机：
            </div>
            <div>{{ session?.host }}</div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const props = defineProps({
  session: {
    type: Object as PropType<ShellSessionRecord>,
    default: undefined
  }
})

const emits = defineEmits<{
  (e: 'rename', v: string): void
  (e: 'openConsole'): void
  (e: 'restart'): void
  (e: 'remove'): void
  (e: 'kill'): void
}>()

const rename = async() => {
  const newName = await SfcUtils.prompt({ title: '会话重命名', label: '会话名称' ,defaultValue: props.session?.name })
  if (newName != props.session?.name) {
    emits('rename', newName)
  }
}

const restart = async() => {
  await SfcUtils.confirm('是否确认重启该Shell会话？', '重启会话')
  emits('restart')
}

const remove = async() => {
  await SfcUtils.confirm('是否确认移除该Shell会话？' + (props.session?.running ? '进程仍在运行中，移除后将强制结束进程' : ''), '移除会话')
  emits('remove')
}

const kill = async() => {
  await SfcUtils.confirm('是否确认终止Shell会话进程？', '终止进程')
  emits('kill')
}
</script>

<script lang="ts">
import { defineComponent, defineProps, PropType } from 'vue'
import { ShellSessionRecord } from '../model'
import { StringFormatter } from 'sfc-common'

export default defineComponent({
  name: 'WsCard'
})
</script>

<style lang="scss" scoped>
.ws-card {
  display: inline-block;
  max-width: 480px;
  width: 100%;
  margin-right: 12px;
  margin-bottom: 12px;
  .edit-icon {
    font-size: 12px;
    margin-left: 6px;
    cursor: pointer;
  }
}

.status-icon {
  display: inline-block;
  padding: 8px;
  margin-right: 6px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-error));
  transition: all .2s;
  &.active {
    background-color: rgb(var(--v-theme-success));
  }
}
</style>