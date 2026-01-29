import { StringUtils } from 'sfc-common'
import { PeerCreateOption, WebRTCSession } from '../model'
import { WebRTCSessionImpl } from './WebRTCSession'
import { WebRTCWebSocketSignalingService } from './WebRTCSignalingService'


/**
 * WebRTC会话工厂
 * 职责：创建和配置 WebRTCSession 实例
 */
export class WebRTCSessionFactory {
  /**
   * 创建一个原始的WebRTC会话
   * @param opt 创建选项
   * @returns WebRTCSession 实例
   */
  static async createPeer(opt: PeerCreateOption): Promise<WebRTCSession> {
    // 参数验证
    if (opt.peerType === 'guest' && !opt.targetPeerId) {
      throw new Error('target peer id is required for guest.')
    }

    // 创建信令服务
    const signalingService = opt.signalingService 
      ? await opt.signalingService()
      : new WebRTCWebSocketSignalingService()

    // 创建 PeerConnection
    const pc = new RTCPeerConnection(opt.rtcConfig)

    // 初始化信令服务并获取本地 peerId
    const peerId = await signalingService.init(
      opt.peerId || StringUtils.getRandomStr(6, { withNumber: true })
    )

    // 创建并返回会话
    return new WebRTCSessionImpl(opt, peerId, signalingService, pc)
  }
}