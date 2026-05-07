<template>
  <div class="ret-screen-recorder">
    <VCard>
      <VCardText>
        <VForm ref="formRef">
          <LoadingMask :loading="isLoading" />
          <VRow v-if="!videoSession">
            <VCol>

              <VRadioGroup
                v-model="role"
                label="请选择角色"
                inline
                color="primary"
                hide-details
              >
                <VRadio label="主播" value="host" />
                <VRadio label="观众" value="guest" />
              </VRadioGroup>
            </VCol>
          </VRow>
          <template v-if="role == 'host'">
            <!-- 主播配置参数 -->
            <template v-if="videoSession == null">
              <VRow>
                <!-- 选择视频来源 录屏/摄像头 -->
                <VCol cols="12" sm="6" md="4">
                  <VSelect
                    v-model="mediaDataSource"
                    class="mt-3"
                    color="primary"
                    label="请选择视频来源"
                    variant="underlined"
                    hide-details
                    :items="supportSourceItems"
                  />
                </VCol>
                <!-- 选择视频帧率 -->
                <VCol cols="12" sm="6" md="4">
                  <VSelect
                    v-model="frameRate"
                    class="mt-3"
                    color="primary"
                    label="视频帧率(FPS)"
                    variant="underlined"
                    hide-details
                    :items="[10, 24, 30, 60, 75, 120, 144, 180, 240]"
                  />
                </VCol>
              </VRow>
            </template>
            <VRow v-if="videoSession == null">
              <VCol>
                <template v-if="isSupportRecord">
                  <VBtn
                    v-if="videoSession == null"
                    block
                    color="primary"
                    @click="startRecord"
                  >
                    <CommonIcon icon="mdi-play" />
                    开始直播
                  </VBtn>
                </template>
                <template v-else>
                  <VAlert
                    variant="outlined"
                    type="warning"
                    :text="isHttps ? '您的浏览器不支持录屏或调用摄像头' : '非https会话下不支持录屏'"
                  />
                </template>
              </VCol>
            </VRow>
            <!-- 开始直播后的信息页面 -->
            <template v-if="videoSession != null">
              <!-- 分享二维码 -->
              <VRow>
                <VCol align-self="center">
                  <div class="text-center">
                    <div>
                      <p>直播间id</p>
                      <div class="text-bold live-id mt-3 mb-3">
                        {{ peerId }}
                      </div>
                    </div>
                    <div>
                      <VBtn
                        color="error"
                        @click="stopAll"
                      >
                        <CommonIcon icon="mdi-stop" />
                        停止直播
                      </VBtn>
                    </div>
                  </div>
                </VCol>
                <VCol>
                  <div class="text-center">
                    <img :src="qrCodeUrl" alt="QR Code" class="qr-image">
                    <p class="tip">
                      扫描二维码进入直播间
                    </p>
                  </div>
                </VCol>
              </VRow>
              <VRow>
                <VCol>
                  <VTextField
                    v-model="liveUrl"
                    color="primary"
                    variant="outlined"
                    label="直播间地址"
                    readonly
                    @click="copyLiveUrl"
                  >
                    <template #append-inner>
                      <CommonIcon icon="mdi-content-copy" />
                    </template>
                  </VTextField>
                </VCol>
              </VRow>
            </template>
          </template>
          <VRow>
            <VCol v-if="role == 'guest'">
              <VTextField
                v-if="role == 'guest'"
                v-model="targetPeerId"
                :readonly="videoSession != null"
                density="comfortable"
                variant="underlined"
                color="primary"
                label="直播间id"
                :rules="[ Validators.notNull() ]"
              />
              <VBtn
                v-if="videoSession == null"
                block
                color="primary"
                @click="joinLive"
              >
                <CommonIcon icon="mdi-play" />
                加入直播
              </VBtn>
              <VBtn v-else block @click="stopAll">
                <CommonIcon icon="mdi-stop" /> 离开直播间
              </VBtn>
            </VCol>
          </VRow>
          
          <VRow v-if="role == 'guest'">
            <VCol>
              <video
                v-show="videoSession"
                ref="videoRef"
                controls
                width="320px"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
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
const videoSession: Ref<WebRTCVideoSession | null> = ref(null)
const formRef = ref()
const peerId = ref('')
const targetPeerId = ref('')
const videoRef = ref<HTMLVideoElement>()
const role = ref('host') as Ref<'host' | 'guest'>
const isLoading = ref(false)
const isSupportRecord = ref('mediaDevices' in navigator)
const isHttps = ref(window.location.protocol == 'https:')
const mediaDataSource = ref('screen') as Ref<'screen' | 'camera'>
const liveUrl = ref('')
const qrCodeUrl = ref('')
const frameRate = ref(60)

const supportSourceItems = computed(() => {
  if (!navigator.mediaDevices) {
    return []
  }
  const res = []
  if ('getDisplayMedia' in navigator.mediaDevices) {
    res.push({
      title: '屏幕录屏',
      value: 'screen'
    })
  }
  if ('getUserMedia' in navigator.mediaDevices) {
    res.push({
      title: '摄像头',
      value: 'camera'
    })
  }
  return res
})


/**
 * 开始录屏
 */
async function startRecord() {
  try {
    isLoading.value = true
    const vs = await WebRTCService.createVideoPeer({
      peer: {
        rtcConfig: props.conf,
        peerType: 'host',
        peerId: peerId.value,
        allowMultiplePeer: true
      },
      mediaStream: async() => {
        if (mediaDataSource.value == 'camera') {
          return await navigator.mediaDevices.getUserMedia({
            video: {
              frameRate: frameRate.value
            },
            audio: true
          })
        }
        return await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: frameRate.value
          },
          audio: true
        })
      }
    })
    vs.addEventListener('media-stream-stop', () => {
      stopAll()
    })
    const s = vs.getRawSession()
    if (s) {
      peerId.value = s.getLocalPeerId()
    }
    videoSession.value = vs
    liveUrl.value = `${location.origin}/#${getContext().routeInfo.value.curr?.path}?liveId=${peerId.value}`
    qrCodeUrl.value = await QRCode.toDataURL(liveUrl.value)
    
  } catch (e) {
    videoSession.value = null
    if (e instanceof Error) {
      if (e.message == 'Permission denied by user') {
        window.SfcUtils.alert('已拒绝了录屏权限')
      } else {
        window.SfcUtils.snackbar(e.message)
      }
      
    } else {
      window.SfcUtils.snackbar('请求失败: ' + e)
    }
  } finally { 
    isLoading.value = false
  }
}

/**
 * 加入观看直播
 */
async function joinLive() {
  try {
    isLoading.value = true
    const validateRes = await formRef.value.validate()
    if (!validateRes.valid) {
      window.SfcUtils.snackbar('请填写对端id')
      return
    }
    const vs = await WebRTCService.createVideoPeer({
      peer: {
        rtcConfig: props.conf,
        peerType: 'guest',
        targetPeerId: targetPeerId.value,
        offerTimeout: 3000
      },
      direction: 'recvonly'
    })
    vs.addEventListener('disconnected', () => {
      window.SfcUtils.alert('对方已下播')
      stopAll()
    })
    vs.addEventListener('track', (event) => { 
      if (videoRef.value) {
        videoRef.value.srcObject = event.streams[0]
        videoRef.value.play()
      }
    })
    videoSession.value = vs
  } catch (e) {
    videoSession.value = null
    if (e instanceof Error) {
      window.SfcUtils.snackbar(e.message)
    } else {
      window.SfcUtils.snackbar('请求失败: ' + e)
    }
  } finally { 
    isLoading.value = false
  }
}

function stopAll() {
  if (videoSession.value) {
    videoSession.value.close()
    videoSession.value = null
  }
}

async function copyLiveUrl() {
  await window.SfcUtils.copyToClipboard(liveUrl.value)
  window.SfcUtils.snackbar('已复制直播链接')
}

onMounted(async() => { 
  await window.SfcUtils.sleep(200)
  const liveId = getContext().routeInfo.value.curr?.query?.liveId
  if(liveId) {
    await window.SfcUtils.confirm(`是否立即加入观看直播间${liveId}`, '观看直播')
    role.value = 'guest'
    targetPeerId.value = liveId as string
    joinLive()
  }
})

onUnmounted(() => {
  stopAll()
})

</script>

<script lang="ts">
import { getContext, Validators } from 'sfc-common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onUnmounted, onMounted, computed } from 'vue'
import { WebRTCService, WebRTCVideoSession } from '../core/WebRTCService'
import * as QRCode from 'qrcode'

export default defineComponent({
  name: 'RTCScreenRecorder',
  components: {
    LoadingMask: window.components.LoadingMask
  }
})
</script>

<style scoped>
.live-id {
  color: rgb(var(--v-theme-primary));
  font-size: 21px;
}
</style>