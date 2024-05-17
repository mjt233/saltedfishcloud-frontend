<template>
  <div>
    <LoadingMask :loading="loading" />
    <VBtn color="primary" @click="actions.createSession">
      <div class="d-flex align-center justify-center">
        <CommonIcon icon="mdi-plus" /> 创建会话
      </div>
    </VBtn>
    <VBtn style="margin-left: 6px;" @click="asyncActions.listSession">
      <div class="d-flex align-center justify-center">
        <CommonIcon icon="mdi-refresh" /> 刷新
      </div>
    </VBtn>
    <div class="session-list">
      <WsCard
        v-for="item in sessionList"
        :key="item.id"
        :session="item"
        style="animation: up-in .2s"
        @rename="asyncActions.rename(item, $event)"
        @open-console="asyncActions.openConsole(item)"
        @restart="asyncActions.restart(item)"
        @remove="asyncActions.remove(item)"
        @kill="asyncActions.kill(item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const lm = new LoadingManager()
const loading = lm.getLoadingRef()

const sessionList = ref([]) as Ref<ShellSessionRecord[]>

const openTextConsole = async(session: ShellSessionRecord) => {
  const log = (await SfcUtils.request(WebShellApi.getLog(session.id))).data.data
  const ws = await WebSocketService.connect({url: WebShellApi.getShellWebSocketUrl(session.id)})
  const consoleProps = reactive({
    output: log,
    showInput: true,
    style: {
      height: 'calc(100vh - 180px)'
    },
    onInput(text: string) {
      ws.send(text + '\n')
    }
  })
  ws.onmessage = msg => {
    consoleProps.output += msg.data
  }
  SfcUtils.openComponentDialog(WsSimpleTextConsole, {
    title: session.name,
    props: consoleProps,
    fullscreen: true,
    onCancel() {
      ws.close()
      actions.listSession()
      return true
    },
    showConfirm: false
  })
}


const openPtyConsole = async(session: ShellSessionRecord) => {
  const log = (await SfcUtils.request(WebShellApi.getLog(session.id))).data.data
  const ws = await WebSocketService.connect({url: WebShellApi.getShellWebSocketUrl(session.id)})
  let isCloseDialog = false
  ws.onclose = () => {
    if (!isCloseDialog) {
      SfcUtils.alert('WebSocket连接已断开，终端无法交互')
    }
    
  }
  ws.onerror = () => {
    SfcUtils.snackbar('WebSocket连接出错')
  }
  const consoleProps = reactive({
    initOutput: log,
    style: {
      height: 'calc(100vh - 150px)'
    },
    onInput(key: string, event: KeyboardEvent) {
      ws.send(key)
    },
    sessionId: session.running ? session.id : undefined,
    initRows: session.rows,
    initCols: session.cols,
  })
  const dialog = SfcUtils.openComponentDialog(XTerminal, {
    title: session.name,
    props: consoleProps,
    fullscreen: true,
    onCancel() {
      isCloseDialog = true
      ws.close()
      actions.listSession()
      return true
    },
    showConfirm: false
  })
  ws.onmessage = msg => {
    (dialog.getComponentInstRef() as XTerminalModel).write(msg.data)
  }
}

const actions = {
  async listSession() {
    sessionList.value  = ((await SfcUtils.request(WebShellApi.listSession())).data.data || []).sort((a, b) => Number(b.createAt) - Number(a.createAt))
  },
  async rename(session: ShellSessionRecord, newName: string) {
    await SfcUtils.request(WebShellApi.rename(session.id, newName))
    await this.listSession()
  },
  async openConsole(session: ShellSessionRecord) {
    if (session.parameter.pty) {
      await openPtyConsole(session)
    } else {
      await openTextConsole(session)
    }
  },
  createSession() {
    const inst = SfcUtils.openComponentDialog(WsCreateSessionForm, {
      title: '创建交互式shell会话',
      async onConfirm() {
        const res = await inst.getInstAsForm().submit()
        if (res.success) {
          asyncActions.listSession()
            .then(async() => {
              await SfcUtils.sleep(200)
              actions.openConsole(res.data?.data.data)
            })
          return true
        } else {
          console.error(res.err)
          return false
        }
      },
    })
  },
  async restart(session: ShellSessionRecord) {
    await SfcUtils.request(WebShellApi.restart(session.id))
    await SfcUtils.sleep(200)
    await this.listSession()
  },
  async remove(session: ShellSessionRecord) {
    await SfcUtils.request(WebShellApi.remove(session.id))
    await SfcUtils.sleep(200)
    await this.listSession()
  },
  async kill(session: ShellSessionRecord) {
    await SfcUtils.request(WebShellApi.kill(session.id))
    await SfcUtils.sleep(200)
    await this.listSession()
  }
}
const asyncActions = MethodInterceptor.createAsyncActionProxy(actions, false, lm)

onMounted(asyncActions.listSession)
</script>

<script lang="ts">
import WsCard from './WsCard.vue'
import { LoadingManager, MethodInterceptor, WebSocketService } from 'sfc-common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { WebShellApi } from '../api'
import { ShellExecuteResult, ShellSessionRecord, XTerminalModel } from '../model'
import { onMounted } from 'vue'
import WsCreateSessionForm from './WsCreateSessionForm.vue'
import WsSimpleTextConsole from './WsSimpleTextConsole.vue'
import { reactive } from 'vue'
import XTerminal from './XTerminal.vue'

export default defineComponent({
  name: 'WsInteractiveExecView',
  components: { WsCard }
})
</script>

<style lang="scss" scoped>
.session-list {
  margin-top: 24px;
}
</style>