import { EventSupport } from 'sfc-common'

/**
 * WebRTC信令消息类型
 */
export type RTCSignalingMessageType = 
  'CANDIDATE' |  // ICE候选信息，用于网络连接发现
  'OFFER' |      // SDP offer消息，发起连接请求
  'ANSWER' |     // SDP answer消息，回应连接请求
  'INTERRUPT' |   // 终止连接消息
  'PEER_ID' |    // 告知本端的标识
  'REDIRECT_NEW_PEER' |   // 需要将对端标识切换到指定的标识
  'DENY' |         // 拒绝连接消息
  'BUSINESS_MESSAGE'     // 其他自定义的普通消息

/**
 * 原始的WebRTC信令消息，主要用于WebRTC会话内发送，对端peerId和本端peerId可为空不指定，由WebRTC会话内部处理
 */
export interface RTCSignalingRawMessage {
  toPeerId?: string

  fromPeerId?: string

  dataType: RTCSignalingMessageType

  data: any
}

/**
 * WebRTC信令消息，主要
 */
export interface RTCSignalingMessage extends RTCSignalingRawMessage{
  toPeerId: string

  fromPeerId: string
}

/**
 * WebRTC信令服务
 */
export interface WebRTCSignalingService extends EventSupport<{
  'message': [msg: RTCSignalingMessage]
}> {
  /**
   * @param peerId 期望的本端标识
   * @returns 服务器最终确认的本端标识
   */
  init(peerId: string): Promise<string>

  /**
   * 获取本端标识
   */
  getPeerId(): string

  /**
   * 发送信令消息
   * @param msg 信令消息
   */
  sendMessage(msg: RTCSignalingMessage): Promise<void>

  close(): void
}

export type PeerType = 'host' | 'guest'

/**
 * 服务器提供的RTC连接配置
 */
export interface ServerRTCConfig {

  /**
   * 是否使用ICE服务器
   */
  useIceServer: boolean

  /**
   * ICE服务器URL，支持多个地址，使用支持配置多个URL，用半角英文逗号","分割
   */
  iceServerUrl: string
}

export interface PeerCreateOption {
  rtcConfig?: RTCConfiguration

  /**
   * 是否允许当收到新的对端接入时，创建多个RTC会话
   */
  allowMultiplePeer?: boolean
  
  /**
   * 当允许多个对端接入时，最多允许新创建的RTC会话数。若该值未定义则标识不限制
   */
  maxPeerCount?: number

  /**
   * 创建RTC会话的期望本端标识，将决定是否发送OFFER消息或发送ANSWER消息
   * - guest: 发送offer消息，应在对端建立PeerConnection前创建
   * - host: 发送answer消息
   */
  peerType: PeerType

  /**
   * 创建RTC会话的期望本端标识
   * 如果不指定或重复，则由系统生成
   */
  peerId?: string

  /**
   * 当peerType为client时，要连接的对端标识
   */
  targetPeerId?: string

  /**
   * 作为访问端guest时，发送offer后若超过指定时间，则抛出超时异常，单位ms。默认10000ms
   */
  offerTimeout?: number

  /**
   * 信令服务创建函数。未指定则使用默认的WebSocket服务。
   */
  signalingService?: () => WebRTCSignalingService | Promise<WebRTCSessionSignalingService>
}


/**
 * WebRTC会话事件定义
 */
export type WebRTCSessionEventTypeMap = {
  // 成功建立连接
  'connected': [],

  // 被对端拒绝连接
  'deny': []

  // 连接已断开
  'disconnected': [],

  // SDP交换完成，双方端标识已确定
  'sdp-exchange': [localPeerId: string, remotePeerId: string],

  // 发送信令消息
  'send-signaling-message': [msg: RTCSignalingMessage],

  // 从信令服务收到信令消息
  'get-signaling-message': [msg: RTCSignalingMessage],

  // 主机端从信令服务收到OFFER消息
  'get-offer': [offer: RTCSessionDescriptionInit],

  // 客户端从信令服务收到ANSWER消息
  'get-answer': [answer: RTCSessionDescriptionInit]

  // 从信令服务收到候选地址
  'get-candidate': [candidate: RTCIceCandidateInit]

  // 从信令服务收到服务终止消息
  'get-interrupt': [],

  // 由于多端请求连接而新创建了RTC会话
  'new-session': [session: WebRTCSession]
}

export interface WebRTCSession<T extends WebRTCSessionEventTypeMap = WebRTCSessionEventTypeMap> extends EventSupport<T> {
  /**
   * 获取本端标识
   */
  getLocalPeerId(): string

  /**
   * 获取对端标识
   */
  getRemotePeerId(): string | undefined

  getPeerConnection(): RTCPeerConnection

  /**
   * 作为guest侧时，主动发送OFFER消息，向目标建立连接
   * @params isWaitAnswer 是否等待对方返回ANSWER消息
   */
  sendOffer(isWaitAnswer?: boolean): Promise<void>

  /**
   * 发送信令消息
   * @param msg 信令消息
   */
  sendSignalingMessage(msg: RTCSignalingRawMessage): Promise<void>

  close(): void
}