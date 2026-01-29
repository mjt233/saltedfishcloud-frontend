import { EventSupportImpl } from 'sfc-common'
import { WebRTCSessionEventTypeMap, WebRTCSession, PeerCreateOption, WebRTCSignalingService, RTCSignalingMessage, RTCSignalingRawMessage } from '../model'
import { WebRTCSessionFactory } from '.'


export class WebRTCSessionImpl extends EventSupportImpl<WebRTCSessionEventTypeMap> implements WebRTCSession {
  private remotePeerId?: string
  
  // Track additional peer sessions count
  private additionalPeerSessions: number = 0

  // 是否已完成SDP交换
  private sdpIsExchange: boolean = false

  // 缓存的候选地址，只有当SDP完成后才发送
  private candidateQueue: RTCIceCandidateInit[] = []

  // 作为Host时，由于允许接受多个会话而多创建的RTC会话
  private subSessions: WebRTCSession[] = []
  

  private isClosed: boolean = false

  constructor(
    private opt: PeerCreateOption,
    private localPeerId: string,
    private signalingService: WebRTCSignalingService,
    private pc: RTCPeerConnection
  ) {
    super()
    if (opt.targetPeerId) {
      this.remotePeerId = opt.targetPeerId
    }
    this.initSignalingService()
    this.initPeerConnection()
  }

  /**
   * 初始化PeerConnection的事件回调
   */
  private async initPeerConnection() { 
    this.pc.addEventListener('icecandidate', (ev) => {
      if (ev.candidate == null) {
        return
      }
      this.trySendCandidate(ev.candidate)
    })

    this.pc.addEventListener('connectionstatechange', e => {
      if(this.pc.connectionState == 'closed' || this.pc.connectionState == 'disconnected' || this.pc.connectionState == 'failed') {
        this.dispatchEvent('disconnected')
        this.additionalPeerSessions--
      } else if (this.pc.connectionState == 'connected') {
        this.dispatchEvent('connected')
      }
    })
  }

  /**
   * 初始化信令服务的消息处理回调
   */
  private async initSignalingService() { 
    // 处理信令消息
    this.signalingService.addEventListener('message', async(msg) => {
      // 记录对端标识
      if (!this.remotePeerId && msg.fromPeerId) {
        this.remotePeerId = msg.fromPeerId
      }
      this.dispatchEvent('get-signaling-message', msg)
      switch(msg.dataType) {
      case 'OFFER':
        // 主机收到OFFER消息，设置远端SDP并返回ANSWER消息
        console.log(`${this.localPeerId} 收到来自 ${this.remotePeerId} 的OFFER`)
        if (this.opt.peerType == 'host') {
          if (!this.remotePeerId) {
            console.warn('收到非预期的信令消息: 主机未指定对端标识')
            return
          }

          if (this.remotePeerId != msg.fromPeerId
            || (this.opt.maxPeerCount !== undefined && this.additionalPeerSessions >= this.opt.maxPeerCount)
          ) {
            // Check if multiple peers are allowed
            if (!this.opt.allowMultiplePeer) {
              console.warn(`收到来自新的对端 ${msg.fromPeerId} 的连接请求，但未启用多连接支持 或 已超出最大连接数`)
              // Send deny message back to the peer
              this.sendSignalingMessage({
                data: '不再接受新连接',
                dataType: 'DENY',
                fromPeerId: this.localPeerId,
                toPeerId: msg.fromPeerId
              })
              return
            }

            // 收到来自新的对端，创建新的RTC会话
            const newSession = await WebRTCSessionFactory.createPeer({
              peerType: 'host',
              rtcConfig: this.opt.rtcConfig,
              targetPeerId: msg.fromPeerId,
              signalingService: this.opt.signalingService
            })
            newSession.addEventListener('disconnected', () => {
              this.additionalPeerSessions--
            })

            console.log(`${this.localPeerId} 创建了新的RTC会话 ${newSession.getLocalPeerId()}`)
            
            // Increment the additional peer session counter
            this.additionalPeerSessions++
            this.dispatchEvent('new-session', newSession)
            // this.getAllEventListeners().forEach(e => newSession.addEventListener(e.type, e.listener as any))

            // 告知对端，改用新创建RTC会话
            newSession.sendSignalingMessage({
              data: newSession.getLocalPeerId(),
              dataType: 'REDIRECT_NEW_PEER',
              fromPeerId: this.getLocalPeerId(),
              toPeerId: msg.fromPeerId
            })
            return
          }
          this.dispatchEvent('get-offer', msg.data)
          this.pc.setRemoteDescription(msg.data)
          const answer = await this.pc.createAnswer()
          this.pc.setLocalDescription(answer)

          // 发送ANSWER消息
          console.log(`${this.localPeerId}发送ANSWER => ${this.remotePeerId}`)
          this.sendSignalingMessage({
            dataType: 'ANSWER',
            data: answer
          })
          this.sdpIsExchange = true
          this.dispatchEvent('sdp-exchange', this.localPeerId, this.remotePeerId)
          this.trySendCandidate()
        } else {
          console.warn('收到非预期的信令消息: guest不应该收到OFFER消息，该消息已忽略')
        }
        break
      case 'REDIRECT_NEW_PEER':
        console.log(`切换到新的对端id，重新发送OFFER。对端id由${this.remotePeerId} 切换到 ${msg.data}`)
        this.remotePeerId = msg.data
        this.sendOffer()
        break
      case 'ANSWER':
        // 客户端收到ANSWER消息，设置远端SDP
        console.log('收到ANSWER')
        
        this.dispatchEvent('get-answer', msg.data)
        if (this.opt.peerType == 'host') {
          console.warn('收到非预期的信令消息: host不应该收到ANSWER消息，该消息已忽略')
          return
        }
        this.pc.setRemoteDescription(msg.data)
        if (this.remotePeerId) {
          this.sdpIsExchange = true
          this.dispatchEvent('sdp-exchange', this.localPeerId, this.remotePeerId)
          this.trySendCandidate()
        } else {
          console.warn('收到非预期的信令消息: 对端标识未指定时收到ANSWER消息')
        }
        break
      case 'PEER_ID':
        if (!msg.fromPeerId) {
          this.localPeerId = msg.data
        }
        break
      case 'CANDIDATE':
        // 添加对端候选地址
        if (this.remotePeerId == msg.fromPeerId) {
          this.dispatchEvent('get-candidate', msg.data)
          this.pc.addIceCandidate(msg.data)
        } else {
          console.warn(`收到其他对端id的候选地址 ${msg.fromPeerId} 当前已绑定对端id: ${this.remotePeerId}`)
        }
        break
      case 'INTERRUPT':
        if (this.remotePeerId == msg.fromPeerId) {
          this.dispatchEvent('get-interrupt')
        } else {
          console.warn(`收到其他对端id的终止信号 ${msg.fromPeerId} 当前已绑定对端id: ${this.remotePeerId}`)
        }
        break
      case 'BUSINESS_MESSAGE':
        // 自定义业务消息，不做内部逻辑处理
        break
      case 'DENY':
        // 拒绝连接
        this.dispatchEvent('deny')
        break
      default:
        console.warn('收到未定义的信令消息类型:', msg.dataType)
      }
    })
  }

  /**
   * 尝试发送候选地址，确保在SDP已交换后才发送
   * @param candidate 候选地址
   * @returns 本次调用是否满足发送条件
   */
  private async trySendCandidate(candidate?: RTCIceCandidateInit) {
    if (candidate) {
      this.candidateQueue.push(candidate)
    }
    if (!this.sdpIsExchange || !this.remotePeerId) {
      return false
    }

    while(this.candidateQueue.length > 0) {
      const c = this.candidateQueue.shift()
      if (!c) {
        break
      }
      this.sendSignalingMessage({
        dataType: 'CANDIDATE',
        data: c
      })
    }
    return true
  }
  async sendSignalingMessage(msg: RTCSignalingRawMessage) {
    if (!msg.fromPeerId) {
      msg.fromPeerId = this.localPeerId
    }
    if (!msg.toPeerId) {
      msg.toPeerId = this.remotePeerId
    }
    await this.signalingService.sendMessage(msg as RTCSignalingMessage)
    this.dispatchEvent('send-signaling-message', msg as RTCSignalingMessage)
  }
  
  getLocalPeerId() {
    return this.localPeerId
  }
  getRemotePeerId() {
    return this.remotePeerId
  }
  getPeerConnection(): RTCPeerConnection {
    return this.pc
  }
  async sendOffer(isWaitAnswer?: boolean): Promise<void> {
    console.log('发送OFFER')
    
    // 参数校验
    if (!this.localPeerId) {
      throw new Error('local peer id is not valid.')
    }

    if (this.opt.peerType == 'guest') {
      // 创建OFFER消息
      const offer = await this.pc.createOffer()
      this.pc.setLocalDescription(offer)

      return new Promise<void>(async(resolve, reject) => {
        if (!this.remotePeerId) {
          reject('remote peer id is not valid.')
          return
        }

        // 通过信令服务发送OFFER消息
        await this.signalingService.sendMessage({
          toPeerId: this.remotePeerId,
          fromPeerId: this.localPeerId,
          dataType: 'OFFER',
          data: offer
        })

        // 不等待应答
        if (!isWaitAnswer) {
          resolve()
          return
        }

        // 需要等待对端应答，超时则reject
        const timeout = this.opt.offerTimeout || 10000
        const i = setTimeout(() => {
          reject(new Error('等待响应超时'))
        }, timeout)
        const callback = (msg: RTCSignalingMessage) => {
          if (msg.dataType == 'ANSWER' && msg.fromPeerId == this.remotePeerId) {
            clearTimeout(i)
            this.signalingService.removeEventListener('message', callback)
            resolve()
          } else if (msg.dataType == 'DENY' && msg.fromPeerId == this.remotePeerId) {
            clearTimeout(i)
            this.signalingService.removeEventListener('message', callback)
            reject(new Error('对端拒绝连接 ' + msg.data))
          }
        }
        this.signalingService.addEventListener('message', callback)
      })
    }
  }
  close(): void {
    if (this.isClosed) {
      return
    }
    if (this.localPeerId && this.remotePeerId) {
      console.log('发送中断消息')
      // 给对端发送终止消息
      this.signalingService.sendMessage({
        toPeerId: this.remotePeerId,
        fromPeerId: this.localPeerId,
        dataType: 'INTERRUPT',
        data: null
      })
    }
    
    this.pc.close()
    console.log(`WebRTC会话关闭${this.localPeerId}`)
    this.signalingService.close()
    this.isClosed = true
    
  }
}