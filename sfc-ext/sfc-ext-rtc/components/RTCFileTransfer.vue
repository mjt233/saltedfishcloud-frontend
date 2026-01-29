<template>
  <div v-if="isSupportWebRTC">
    <VCard :title="dataSession && role == 'host' ? undefined : '文件传输'">
      <VCardText v-if="dataSession == null || role == 'guest'">
        <VForm>
          <VRadioGroup
            v-model="role"
            :disabled="dataSession != null"
            label="请选择动作"
            inline
            color="primary"
          >
            <VRadio label="我要发文件" value="host" />
            <VRadio label="我要接收文件" value="guest" />
          </VRadioGroup>

          <!-- 发文件 -->
          <div v-if="role == 'host'" class="mb-3 ml-1">
            <VRow>
              <VCol cols="12">
                <VFileInput
                  v-model="needSendFile"
                  chips
                  show-size
                  label="请选择文件"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VCheckbox
                  v-model="allowMultipleSend"
                  color="primary"
                  label="允许多次接收"
                  density="comfortable"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VBtn 
                  color="primary" 
                  block
                  size="large"
                  @click="finishSelect"
                >
                  <VIcon left>
                    mdi-send
                  </VIcon>
                  开始分享
                </VBtn>
              </VCol>
            </VRow>
            
            <VRow v-if="dataSession">
              <VCol cols="12">
                <VDivider class="mb-3 mt-3" />
                <div class="text-caption text-medium-emphasis text-center">
                  <VIcon size="small">
                    mdi-information-outline
                  </VIcon>
                  请保持此页面打开，关闭页面将中断文件传输
                </div>
              </VCol>
            </VRow>
          </div>

          <!-- 收文件 -->
          <div v-if="role == 'guest'">
            <template v-if="!(isInWechat && !isSupportFileStream)">
              <VTextField
                v-model="targetPeerId"
                :disabled="dataSession != null"
                label="文件识别码"
              />
              <VBtn :disabled="dataSession != null" @click="getFile">
                获取文件
              </VBtn>
            </template>
            
            <v-alert
              v-if="!isSupportFileStream"
              class="mt-3"
              type="warning"
              variant="outlined"
              :title="isInWechat ? '不支持微信接收文件' : '注意'"
            >
              <template v-if="!isInWechat" #text>
                <p v-if="!isHttps">
                  在非https下，浏览器不支持本地文件流式写入API。
                </p>
                <p v-else>
                  您的浏览器不支持本地文件流式写入API，建议使用基于Chromium内核的浏览器（如Google Chrome、Microsoft Edge）。
                </p>
                <p>接收过程中的文件数据将临时保存在浏览器内存中，请留意有足够内存空间容纳文件</p>
                <p>接收完成后仅会触发一次文件保存，错过将需要重新接收</p>
              </template>
              <template v-else #text>
                请点击右上角"..."，选择“在浏览器中打开”
              </template>
            </v-alert>
          </div>
        </VForm>
      </VCardText>

      <!-- 选好要发送的文件后的界面 -->
      <template v-if="dataSession && role == 'host'">
        <VCardTitle class="pa-4 d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <VIcon class="mr-2">
              mdi-file
            </VIcon>
            <span>{{ needSendFile?.name }}</span>
          </div>
        </VCardTitle>
        <VCardSubtitle class="pt-2 pb-1">
          <div class="d-flex flex-wrap gap-4 px-4">
            <div><span>文件大小：</span>{{ StringFormatter.toSize(needSendFile?.size) }}</div>
            <div class="ml-2">
              <span>识别码：</span><span class="text-primary font-weight-bold">{{ peerId }}</span>
            </div>
          </div>
        </VCardSubtitle>
        <VCardText>
          <VDivider class="my-2" />
          <div class="d-flex flex-column align-center">
            <p class="mb-2">
              扫描下方二维码获取文件
            </p>
            <div class="qr-container mb-3">
              <img :src="qrcodeUrl" alt="QR Code" class="qr-image">
            </div>
            <div class="d-flex align-center" style="width: 100%;">
              <VTextField
                v-model="receiveUrl"
                label="分享链接"
                readonly
                hide-details
                class="url-text-field mr-2"
                @click="copyReceiveUrl"
              >
                <template #append-inner>
                  <VIcon>
                    mdi-content-copy
                  </VIcon>
                </template>
              </VTextField>
            </div>
            <VBtn 
              class="mt-3"
              color="error" 
              block
              size="default"
              @click="stop"
            >
              <CommonIcon icon="mdi-stop" />
              停止分享
            </VBtn>
          </div>
          
        </VCardText>
      </template>

      <!-- 传输列表 -->
      <VList v-if="transferList.length" class="mt-1">
        <VListItem
          v-for="item in transferList"
          :key="item.localPeerId"
        >
          <template #prepend>
            <CommonIcon
              :color="{
                'finish': 'success', 
                'failed': 'error',
                'transfering': 'primary'
              }[item.status]"
              :icon="{
                'finish': 'mdi-check',
                'failed': 'mdi-close',
                'transfering': 'mdi-dots-circle'
              }[item.status]"
            />
          </template>
          <span>{{ item.fileMeta.fileName }}</span>
          <div>
            <VProgressLinear
              :max="item.prog.total"
              :model-value="item.prog.loaded"
              color="primary"
            />
          </div>
          <div style="font-size: 12px;">
            <p v-if="item.status == 'failed'" class="text-error">
              {{ item.failMessage }}
            </p>
            <p v-if="item.status == 'transfering'">
              速度: {{ item.speedText }}
            </p>
            <p v-if="item.status == 'finish'">
              平均速度: {{ StringFormatter.toSize(item.fileMeta.fileSize / (item.endTime - item.startTime) * 1000) }}/s
            </p>
          </div>
        </VListItem>
      </VList>
    </VCard>
    
  </div>
  <div v-else>
    您的浏览器不支持WebRTC功能，建议使用Chrome浏览器或基于Chromium内核的浏览器（如Google Chrome、Microsoft Edge）
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  conf: {
    type: Object as PropType<RTCConfiguration>,
    default: () => {
      return {
      }
    }
  }
})
const peerId = ref('')
const targetPeerId = ref('')
const role = ref<'host' | 'guest'>('host')
const dataSession = ref<WebRTCDataSession | null>(null)
const needSendFile = ref<File | null>(null)
const hostSessionMap = new Map<string, WebRTCSession>()
const allowMultipleSend = ref(true)
const qrcodeUrl = ref('')
const receiveUrl = ref('')
const isHttps = ref(location.protocol == 'https:')
const writableStream: Ref<WritableStream<any> | null> = ref(null)
// 是否在微信浏览器内
const isInWechat = ref(window.navigator.userAgent.toLowerCase().indexOf('micromessenger') != -1)

interface TransferItem {
  prog: Prog,
  fileMeta: FileMetaData,
  session: WebRTCSession,
  status: 'finish' | 'failed' | 'transfering',
  failMessage?: string,
  localPeerId: string,
  startTime: number,
  endTime: number,
  lastUpdateTime: number,
  speedText: string
}
const transferList = ref<TransferItem[]>([])
const transferMap = new Map<string, TransferItem>()
const isSupportFileStream = ref(isSupportShowSaveFilePicker())
const isSupportWebRTC = ref('RTCPeerConnection' in window)

async function finishSelect() {
  if (needSendFile.value == null) {
    window.SfcUtils.alert('请选择文件')
    return
  }

  const session = await WebRTCService.createFileTransferPeer({
    peer: {
      rtcConfig: props.conf,
      peerType: 'host',
      peerId: peerId.value,
      allowMultiplePeer: allowMultipleSend.value
    },
    file: needSendFile.value
  })
  setupSession(session, await session.getFileMetaData())
  const originHostSession = session.getRawSession()
  originHostSession.addEventListener('new-session', e => {
    hostSessionMap.set(e.getLocalPeerId(), e)
  })
  hostSessionMap.set(session.getLocalPeerId(), originHostSession)

  dataSession.value = session
  peerId.value = session.getLocalPeerId()

  receiveUrl.value = `${location.origin}/#${getContext().routeInfo.value.curr?.path}?fileCode=${session.getLocalPeerId()}`
  qrcodeUrl.value = await QRCode.toDataURL(receiveUrl.value)
}

async function getFile() {
  // 校验表单参数
  if (targetPeerId.value == '') {
    window.SfcUtils.alert('请填写文件识别码')
    return
  }

  // 创建会话
  let ld: DialogPromise | null = null
  let isStartTransfer = false
  try {
    ld = window.SfcUtils.loadingDialog({ msg: '正在连接对端' })
    const session = await WebRTCService.createFileTransferPeer({
      peer: {
        rtcConfig: props.conf,
        peerType: 'guest',
        targetPeerId: targetPeerId.value,
        offerTimeout: 3000
      }
    })
    dataSession.value = session
    await session.sendOffer(true)

    // 获取文件元数据，并进行确认
    ld.close()
    ld = window.SfcUtils.loadingDialog({ msg: '正在查询文件信息' })
    let fileMetaData
    try {
      fileMetaData = await session.getFileMetaData()
      await window.SfcUtils.confirm(`是否接收文件 ${fileMetaData.fileName} 大小为 ${StringFormatter.toSize(fileMetaData.fileSize)}`, '文件接收确认', {cancelToReject: true})
    } finally {
      ld.close()
    }
    
    // 选择保存位置
    ld = window.SfcUtils.loadingDialog({ msg: '正在准备接收文件' })

    // 创建写入流
    writableStream.value = await createSaveFileStream(fileMetaData.fileName)
    setupSession(session, fileMetaData)
    
    ld.close()
    ld = null
    session.receiveFile(writableStream.value)
    // 标记已开始传输文件
    isStartTransfer = true
  } catch (e) {
    if (e == 'cancel') {
      return
    }
    ld?.close()
    console.error(e)
    if (e instanceof Error) {
      window.SfcUtils.alert(e.message, '文件接收失败')
    } else {
      window.SfcUtils.alert('' + e, '文件接收失败')
    }
    closeAll()
    return
  } finally {
    ld?.close()

    // 没开始传输文件则关闭需要会话（可能原因：拒绝了接收文件或取消保存文件选择）
    if (!isStartTransfer) {
      closeAll()
    }
  }
}

function stop() {
  if (writableStream.value && !writableStream.value.locked) {
    writableStream.value.close()
  }
  writableStream.value = null
  dataSession.value?.close()
  dataSession.value = null
  peerId.value = ''
  transferList.value.forEach(item => {
    if(item.status == 'transfering') {
      item.status = 'failed'
      item.failMessage = '已停止'
    }
  })
}

function closeAll() {
  stop()
  hostSessionMap.forEach(session => {
    session.close()
  })
}

function addTransferItem(localPeerId: string, fileMetaData: FileMetaData, session: WebRTCSession) {
  const now = Date.now()
  const item = reactive({
    prog: {
      loaded: 0,
      total: 0
    },
    fileMeta: fileMetaData,
    status: 'transfering',
    localPeerId,
    startTime: now,
    endTime: 0,
    lastUpdateTime: now,
    speedText: '',
    session
  }) as TransferItem
  transferList.value.unshift(item)
  transferMap.set(item.localPeerId, item)
}

function setupSession(session: WebRTCDataSession, fileMetaData: FileMetaData) {
  session.getRawSession().addEventListener('disconnected', () => {
    transferList.value.filter(item => item.status == 'transfering' && item.session.getLocalPeerId() == session.getLocalPeerId()).forEach(item => {
      item.status = 'failed'
      item.failMessage = '连接已断开'
    })
    if (!session.isSender) {
      closeAll()
    }
  })
  
  session.addEventListener('start-transfer', peerId => {
    addTransferItem(peerId, fileMetaData, session.getRawSession())
  })
  session.getRawSession().addEventListener('disconnected', () => { 
    console.log(`${session.getLocalPeerId()}连接已断开`)
    if (!session.isSender) {
      closeAll()
    }
  })
  

  session.addEventListener('progress', (e, localPeerId) => {
    const i = transferMap.get(localPeerId)
    if (!i) {
      return
    }
    const now = Date.now()
    const sizeChange = e.loaded - i.prog.loaded
    const timeChange = now - i.lastUpdateTime
    i.prog.loaded = e.loaded
    i.prog.total = e.total
    i.lastUpdateTime = now
    i.speedText = StringFormatter.toSize(sizeChange / timeChange * 1000) + '/s'
  })
  session.addEventListener('error', (e, localPeerId) => {
    const i = transferMap.get(localPeerId)
    if (!i) {
      return
    }
    i.status = 'failed'
    i.failMessage = e.message
    console.error(e)
    session.close()
    writableStream.value = null
    dataSession.value?.close()
    dataSession.value = null
  })
  session.addEventListener('completed', async(localPeerId) => {
    const i = transferMap.get(localPeerId)
    if (!i) {
      return
    }
    i.status = 'finish'
    i.endTime = Date.now()
    if (i.session != dataSession.value?.getRawSession()) {
      i.session.close()
      hostSessionMap.delete(localPeerId)
    }
    if (session.isSender && !allowMultipleSend.value) {
      window.SfcUtils.alert('文件传输已完成')
      dataSession.value?.close()
      dataSession.value = null
      needSendFile.value = null
      peerId.value = ''
    }
    
    if (writableStream.value) {
      if((writableStream.value as any).getResult) {
        const blob: Blob = await (writableStream.value as any).getResult()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileMetaData.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      writableStream.value = null
    }
    if (!session.isSender) {
      await window.SfcUtils.sleep(2000)
      closeAll()
    }
  })
}

onUnmounted(() => {
  closeAll()
})

onMounted(async() => {
  const code = getContext().routeInfo.value.curr?.query?.fileCode
  if (code) {
    role.value = 'guest'
    targetPeerId.value = code as string
    // 判断是否在微信浏览器内
    if (isInWechat.value && !isSupportFileStream.value) {
      await window.SfcUtils.alert('请在系统浏览器中重新打开该页面')
    }
  }
})

async function copyReceiveUrl() {
  try {
    await window.SfcUtils.copyToClipboard(receiveUrl.value)
    window.SfcUtils.snackbar('已复制分享链接')
  } catch (e) {
    window.SfcUtils.alert('复制失败')
  }
  
}


</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, onUnmounted, onMounted } from 'vue'
import { getContext, Prog, StringFormatter, StringUtils } from 'sfc-common'
import { type DialogPromise } from 'sfc-common/utils/SfcUtils/common/Dialog'
import { WebRTCSession } from '../model'
import * as QRCode from 'qrcode'
import { createSaveFileStream, FileMetaData, isSupportShowSaveFilePicker, WebRTCDataSession, WebRTCService } from '../core'

export default defineComponent({
  name: 'RTCFileTransfer'
})
</script>