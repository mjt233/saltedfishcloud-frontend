import { EventSupportImpl, StringUtils, WebSocketService } from 'sfc-common'
import { RTCSignalingMessage, WebRTCSignalingService } from '../model'

/**
 * WebSocket信令服务
 */
export class WebRTCWebSocketSignalingService extends EventSupportImpl<{
  'message': [msg: RTCSignalingMessage]
}> implements WebRTCSignalingService { 
  private ws: WebSocket | null = null
  private actualPeerId: string | null = null

  private id = StringUtils.getRandomStr(3, { withNumber: true })

  constructor() {
    super()
  }
  
  async init(peerId: string) {
    if (this.ws != null) {
      throw new Error('is already initialized')
    }
    this.ws = await WebSocketService.createNativeWebSocket({
      url: '/api/webrtc/ws/' + peerId || StringUtils.getRandomStr(6, { withNumber: true })
    })
    this.ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data) as RTCSignalingMessage
      this.dispatchEvent('message', msg)
    })
    return new Promise<string>((resolve, reject) => {
      // 请求获取本端标识
      const cb = (ev: MessageEvent<any>) => {
        const msg = JSON.parse(ev.data) as RTCSignalingMessage
        if (msg.dataType == 'PEER_ID') {
          
          this.actualPeerId = msg.data
          this.ws?.removeEventListener('message', cb)
          resolve(this.actualPeerId as string)
        }
      }
      this.ws?.addEventListener('message', cb)
    })
  }
  getPeerId(): string {
    return this.actualPeerId as string
  }
  async sendMessage(msg: RTCSignalingMessage) {
    if (!this.ws) {
      throw new Error('信令服务未初始化')
    }
    if (this.ws.readyState != WebSocket.OPEN) {
      throw new Error('信令服务未就绪')
    }
    const textMsg = JSON.stringify(msg)
    this.ws.send(textMsg)
  }

  close(): void {
    if (this.ws != null) {
      this.ws.close()
    }
  }
}