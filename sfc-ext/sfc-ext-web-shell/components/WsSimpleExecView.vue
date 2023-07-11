<template>
  <div>
    <LoadingMask :loading="loading" />
    <WsSimpleTextConsole :output="output" style="height: 50vh;" />
    <div class="d-flex align-center">
      <TextInput
        v-model="param.cmd"
        label="输入命令"
        placeholder="输入命令，回车直接执行"
        style="margin-right: 6px"
        hide-details
        @keydown="switchHistoryCmd"
        @enter="asyncActions.send"
      />
      <CommonIcon
        v-ripple
        color="primary"
        style="padding: 12px; border-radius: 50%; cursor: pointer;"
        icon="mdi-send"
        flat
        @click="asyncActions.send"
      />
    </div>
    <br>
    <p class="text-header text-primary">
      附加参数
    </p>
    <div class="other-param">
      <VCheckbox
        v-model="selectCluster"
        color="primary"
        label="指定节点"
        hide-details
      />
      <ClusterSelector v-if="selectCluster" v-model="nodeId" style="max-width: 240px;" />
      <FormSelect
        v-model="param.charset"
        placeholder="程序输出编码"
        style="max-width: 92px;"
        hide-details
        :items="charsetOptions"
      />
      <VTextField
        v-model="param.timeout"
        class="float-label-t6"
        style="margin-bottom: 6px;"
        color="primary"
        variant="underlined"
        hide-details
        label="执行超时(s)"
      />
    </div>
    <p class="text-header text-primary" style="margin-bottom: 18px;">
      环境变量
    </p>
    <div>
      <VTable style="width: 100%;max-width: 480px;" class="elevation-1">
        <thead>
          <tr>
            <th>
              Name
            </th>
            <th style="min-width: 120px">
              Value
            </th>
            <th style="width: 81px;" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in envList" :key="idx">
            <td style="max-width: 92px;">
              <input v-model="item.name" class="plain-input">
            </td>
            <td>
              <input v-model="item.value" class="plain-input">
            </td>
            <td>
              <CommonIcon style="cursor: pointer;" icon="mdi-plus" @click="envList.push({name: '', value: ''})" />
              <CommonIcon
                v-if="envList.length != 1"
                style="cursor: pointer;"
                icon="mdi-delete"
                @click="envList.splice(idx, 1)"
              />
            </td>
          </tr>
        </tbody>
      </VTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Components, LoadingManager, MethodInterceptor, NameValueType, SelectOption } from 'sfc-common'

const charsetOptions: SelectOption[] = [ {
  title: 'UTF-8',
  value: 'utf8'
},{
  title: 'GBK',
  value: 'gbk'
}]
const SfcUtils = window.SfcUtils
const lm = new LoadingManager()
const loading = lm.getLoadingRef()
const output = ref('')
const nodeId = ref('')
const selectCluster = ref(false)
const envList = ref([{name: '', value: ''}]) as Ref<NameValueType[]>
const param = reactive({
  charset: 'utf8',
  cmd: '',
  env: {},
  timeout: 10
} as ShellExecuteParameter)
const historyCmd: string[] = []
let curHistoryIdx = 0

const asyncActions = MethodInterceptor.createAsyncActionProxy({
  async send() {
    if (loading.value) {
      return
    }
    if (param.cmd.length == 0) {
      return Promise.reject('命令不能为空')
    }
    try {
      // 添加到本地临时命令历史，方便用↑↓切换历史命令
      historyCmd.unshift(param.cmd)
      if (historyCmd.length >= 500) {
        historyCmd.pop()
      }

      // 执行命令
      output.value += `SHELL> ${param.cmd}\n`
      param.env = {}
      envList.value.filter(e => e.name.length > 0).forEach(env => {
        param.env[env.name] = env.value
      })
      const res = await SfcUtils.request(WebShellApi.sendSimpleCommand(param, selectCluster.value ? nodeId.value : null))
      output.value += `${res.data.data.output}\n执行耗时: ${res.data.data.time}ms 程序退出码: ${res.data.data.exitCode}\n`

      param.cmd = ''
    } catch (err) {
      output.value += '\n执行出错: ' + err + '\n'
      return Promise.reject(err)
    }
  }
}, false, lm)

/**
 * 切换历史命令
 * @param e 键盘事件
 */
const switchHistoryCmd = (e: KeyboardEvent) => {
  const isUp = e.code == 'ArrowUp'
  const isDown = e.code == 'ArrowDown'

  if (!isUp && !isDown ) {
    curHistoryIdx = 0
    return
  }

  if (!historyCmd.length) {
    return
  }

  if (isDown) {
    curHistoryIdx--
  }
  if (curHistoryIdx >= historyCmd.length || curHistoryIdx < 0) {
    if (isDown) {
      param.cmd = ''
      curHistoryIdx = 0
    }
    return
  }
  param.cmd = historyCmd[curHistoryIdx]

  if (isUp) {
    curHistoryIdx++
  }
}

</script>

<script lang="ts">
import WsSimpleTextConsole from './WsSimpleTextConsole.vue'
import { defineComponent, Ref, ref } from 'vue'
import { WebShellApi } from '../api'
import { reactive } from 'vue'
import { ShellExecuteParameter } from '../model'
import { ComponentPublicInstance } from 'vue'
import { nextTick } from 'vue'
export default defineComponent({
  name: 'WsSimpleExecView',
  components: {
    FormSelect: Components.FormSelect,
    ClusterSelector: Components.ClusterSelector,
    WsSimpleTextConsole
  }
})
</script>


<style lang="scss" scoped>
.output {
  font-family: Menlo,Monaco,Consolas,'Courier New',monospace;
  border-radius: 0;
  height: 50vh;
}

.other-param {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  &>* {
    margin-right: 6px;
    max-width: 120px;
    min-width: 120px;
  }
}
</style>

<style lang="scss">

.float-label-t6 {
  .v-field-label--floating {
    top: 6px !important;
  }
}
</style>

<style scoped>
.plain-input {
  padding: 3px 6px;
  border-radius: 3px;
  border: solid 1px rgba(var(--v-theme-primary), .3);
  width: 100%;
  outline: none;
  font-family: Consolas, "Courier New", monospace,Menlo, Monaco;
}
</style>