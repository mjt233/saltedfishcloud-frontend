import { EventSupportImpl, MethodInterceptor, Prog } from 'sfc-common'
import { PeerCreateOption, WebRTCSession } from '../model'
import { WebRTCSessionFactory } from './WebRTCSessionFactory'


export class WebRTCVideoSession extends EventSupportImpl<{
  'track': [event: RTCTrackEvent],
  'connected': [],
  'disconnected': [],
  'failed': [],
  'media-stream-stop': []
}> implements WebRTCVideoSession {
  
  private hostRTCSessions: WebRTCSession[] = []
  private senderStream: MediaStream | null = null
  private isGuest: boolean = false
  private rawSession: WebRTCSession | null = null

  public getRawSession() {
    return this.rawSession
  }

  public getMediaStream() {
    return this.senderStream
  }

  constructor(
    private opt: WebRTCVideoCreateOption
  ) {
    super()
    this.isGuest = opt.peer.peerType === 'guest'
  }

  public async init() {
    const session = await WebRTCSessionFactory.createPeer(this.opt.peer)
    this.rawSession = session
    if (!this.isGuest) {
      this.initHostSession(session)
    }

    session.addEventListener('connected', () => {
      this.dispatchEvent('connected')
    })
    session.addEventListener('disconnected', () => {
      this.dispatchEvent('disconnected')
      this.closeSession(session)
    })
    session.addEventListener('get-interrupt', () => { 
      this.dispatchEvent('disconnected')
      this.closeSession(session)
    })
    session.addEventListener('new-session', (newSession) => {
      this.initHostSession(newSession)
      newSession.addEventListener('disconnected', () => {
        this.closeSession(newSession)
      })
      newSession.addEventListener('get-interrupt', () => {
        this.closeSession(newSession)
      })
      this.hostRTCSessions.push(newSession)
    })
    const pc = session.getPeerConnection()
    pc.addEventListener('track', e => this.dispatchEvent('track', e))
    if (this.opt.direction) {
      pc.addTransceiver('video', {
        direction: this.opt.direction
      })
      pc.addTransceiver('audio', {
        direction: this.opt.direction
      })
    }
    if (this.isGuest) {
      await session.sendOffer(true)
    } else if (this.opt.mediaStream) {
      if (this.opt.mediaStream instanceof MediaStream) {
        this.senderStream = this.opt.mediaStream
      } else {
        this.senderStream = await this.opt.mediaStream()
        const mediaStream = this.senderStream;
        
        [
          ...mediaStream.getAudioTracks(),
          ...mediaStream.getVideoTracks()
        ].forEach(track => { 
          track.onended = () => { 
            this.close()
          }
        })
        this.bindMediaStream(session)
      }
    }
  }

  private initHostSession(session: WebRTCSession) {
    this.hostRTCSessions.push(session)
    this.bindMediaStream(session)
  }

  /**
   * 将媒体流绑定到WebRTC会话用于输出
   * @param session 待绑定媒体流的WebRTC会话
   */
  private bindMediaStream(session: WebRTCSession) { 
    const mediaStream = this.senderStream
    if (mediaStream) {
      for(const track of mediaStream.getTracks()) {
        session.getPeerConnection().addTrack(track, mediaStream)
      }
    }
  }

  private closeSession(session: WebRTCSession) {
    const idx = this.hostRTCSessions.indexOf(session)
    if (idx >= 0) {
      this.hostRTCSessions.splice(idx, 1)
    }

  
    // 当主机端存在多个访问端时，只关闭非原始会话，确保后续能通过原始的本端id加入会话
    if (!this.isGuest) {
      if (session != this.rawSession) {
        session.close()
      }
      
      if (this.hostRTCSessions.length == 0) {
        if (this.opt.autoStopWhenGuestLeave) {
          this.stopSenderStream()
          this.rawSession?.close()
        }
        
      }
    } else {
      session.close()
      this.rawSession = null
    }
  }

  /**
   * 关闭整个WebRTC视频会话
   */
  public close() { 
    if (this.rawSession) {
      this.rawSession.close()
      this.rawSession = null
    }
    this.hostRTCSessions.forEach(session => { 
      session.close()
    })
    this.hostRTCSessions = []
    this.stopSenderStream()
  }


  private stopSenderStream() {
    if (this.senderStream) {
      this.senderStream.getTracks()
        .forEach(track => {
          track.stop()
        })
      this.senderStream = null
      this.dispatchEvent('media-stream-stop')
    }
  }
}

export interface WebRTCVideoCreateOption {
  /**
   * 底层的WebRTC会话创建选项
   */
  peer: PeerCreateOption

  /**
   * 媒体流。当只作为接收端时，可以不指定
   */
  mediaStream?: MediaStream | (() => Promise<MediaStream> | MediaStream)

  /**
   * 当所有访客离开时，是否自动停止会话并关闭媒体流
   */
  autoStopWhenGuestLeave?: boolean

  /**
   * 媒体流方向，未指定时，默认为sendrecv
   */
  direction?: 'recvonly' | 'sendonly' | 'sendrecv'
}

export interface WebRTCFileTransferCreateOption {
  /**
   * 底层的WebRTC会话创建选项
   */
  peer: PeerCreateOption

  /**
   * 作为发送端时，文件传输完毕后是否自动关闭会话
   */
  autoStopWhenComplete?: boolean

  /**
   * 作为发送端时，要发送的文件
   */
  file?: File
}

export interface FileMetaData {
  fileName: string
  fileSize: number
}

export interface WebRTCDataBusinessMessageData {
  type: 'start-transfer' | 'transfer-completed'
}

/**
 * 利用WebRTC实现P2P文件传输
 */
export class WebRTCDataSession extends EventSupportImpl<{
  'error': [Error, localPeerId: string],
  'progress': [Prog, localPeerId: string],
  'completed': [localPeerId: string],
  'start-transfer': [localPeerId: string],
  'get-file-meta-data': [FileMetaData, localPeerId: string]
}> { 
  private rawSession: WebRTCSession | null = null
  public readonly isSender: Readonly<boolean> = false
  public fileMetaData: Readonly<FileMetaData | null> = null

  // 作为接收端持有的自己创建的信道
  private localDataChannel: RTCDataChannel | null = null

  private hostSessions: WebRTCSession[] = []
  constructor(
    private opt: WebRTCFileTransferCreateOption
  ) {
    super()
    this.isSender = this.opt.peer.peerType === 'host'
    if (this.opt.peer.peerType === 'host') {
      this.fileMetaData = { 
        fileName: this.opt.file?.name || '',
        fileSize: this.opt.file?.size || 0
      }
    }
  }

  public getRawSession(): WebRTCSession {
    if (!this.rawSession) {
      throw new Error('未初始化')
    }
    return this.rawSession
  }

  public getLocalPeerId() { 
    return this.rawSession?.getLocalPeerId() as string
  }

  private async initSenderSession(session: WebRTCSession) {
    this.hostSessions.push(session)
    let dataChannel: RTCDataChannel | null = null
    const pc: RTCPeerConnection = session.getPeerConnection()
    pc.addEventListener('datachannel', e => {
      if (e.channel.label == 'data') {
        dataChannel = e.channel
        dataChannel.binaryType = 'arraybuffer'
      }
    })

    // 发送端在完成SDP交换后，就直接通过信令服务发送文件信息
    session.addEventListener('sdp-exchange', () => {
      session.sendSignalingMessage({
        dataType: 'BUSINESS_MESSAGE',
        data: {
          type: 'file-meta-data',
          content: {
            fileName: this.opt.file?.name,
            fileSize: this.opt.file?.size
          }
        }
      })
    })

    // 通过信令服务收到开始传输文件的请求，开始传输文件内容
    session.addEventListener('get-signaling-message', async(msg) => { 
      if (msg.dataType === 'BUSINESS_MESSAGE') { 
        const data = msg.data as WebRTCDataBusinessMessageData
        if (data.type === 'start-transfer') {
          if (!this.opt.file) {
            this.dispatchEvent('error', new Error('未选择文件，无法传输文件'), this.getLocalPeerId())
            return
          }
          this.sendFile(this.opt.file, await this.getDataChannel(session, dataChannel), session)
        }
        if (data.type === 'transfer-completed') {
          this.dispatchEvent('completed', session.getLocalPeerId())
          if (session != this.rawSession) {
            session.close()
          }
        }
      }
    })

    session.addEventListener('new-session', newSession => this.initSenderSession(newSession))
  }

  public async init() {
    const session = await WebRTCSessionFactory.createPeer(this.opt.peer)
    this.rawSession = session

    const pc: RTCPeerConnection = session.getPeerConnection()
    if (this.isSender) {
      this.initSenderSession(session)
    } else {
      this.localDataChannel = pc.createDataChannel('data', { ordered: true })
      this.localDataChannel.binaryType = 'arraybuffer'
      
      session.addEventListener('get-signaling-message', (msg) => { 
        if (msg.dataType === 'BUSINESS_MESSAGE' && msg.data.type === 'file-meta-data') {
          this.fileMetaData = msg.data.content
          this.dispatchEvent('get-file-meta-data', msg.data.content, this.getLocalPeerId())
        }
      })
      session.addEventListener('deny', () => this.dispatchEvent('error', new Error('由于达到传输上限，对方拒绝连接'), this.getLocalPeerId()))
    }
  }

  private updateProgress = MethodInterceptor.createThrottleProxyFunc((prog: Prog, peerId: string) => {
    this.dispatchEvent('progress', prog, peerId)
  }, { afterExecute: true, delay: 200 })
  

  private async sendFile(file: File, dataChannel: RTCDataChannel, session: WebRTCSession) {
    if (!dataChannel) {
      throw new Error('未创建数据通道，无法传输文件')
    }

    // 1. 设置合理的缓冲区阈值（例如 4MB）
    // 当缓冲区数据低于此值时，会触发 onbufferedamountlow 事件
    const THRESHOLD = 4 * 1024 * 1024 
    dataChannel.bufferedAmountLowThreshold = THRESHOLD

    const chunkSize = 256 * 1024 // 256KB 分片
    let offset = 0

    // 2. 核心：封装一个分片发送函数
    const sendNextChunk = async() => {
      while (offset < file.size) {
        // 检查当前缓冲区是否已满
        if (dataChannel.bufferedAmount > THRESHOLD) {
          // 如果满了，先停下来，等待 onbufferedamountlow 事件触发后再继续
          return 
        }

        // 读取分片
        const chunk = file.slice(offset, offset + chunkSize)
        const buffer = await chunk.arrayBuffer() // 建议转换为 ArrayBuffer 稳定性更高

        try {
          dataChannel.send(buffer)
          offset += chunkSize
        
          // 进度更新建议：以已发送的大小为准
          this.updateProgress({ 
            loaded: Math.min(offset, file.size), 
            total: file.size,
          }, session.getLocalPeerId() as string)
        } catch (e) {
          this.dispatchEvent('error', e instanceof Error ? e : new Error('' + e), this.getLocalPeerId())
          throw e
        }
      }
    }

    // 3. 绑定缓冲区水位监听事件
    dataChannel.onbufferedamountlow = () => {
      sendNextChunk()
    }

    // 4. 开始第一次发送
    sendNextChunk()
    this.dispatchEvent('start-transfer', session.getLocalPeerId() as string)
  }

  public async sendOffer(isWaitAnswer?: boolean) { 
    return await this.rawSession?.sendOffer(isWaitAnswer)
  }

  public getFileMetaData() {
    if (this.fileMetaData) {
      return Promise.resolve(this.fileMetaData)
    }
    return new Promise<FileMetaData>((resolve, reject) => { 
      this.addEventListener('get-file-meta-data', (metaData) => { 
        resolve(metaData)
      })
    })
  }

  private async getDataChannel(session: WebRTCSession, optionalDataChannel: RTCDataChannel | null) { 
    if (!session) {
      return Promise.reject(new Error('未初始化WebRTC会话'))
    }
    return new Promise<RTCDataChannel>((resolve, reject) => {
      // 1. 先确保获取到数据通道
      if (optionalDataChannel) {
        resolve(optionalDataChannel)
      } else {
        session.getPeerConnection().addEventListener('datachannel', (e) => { 
          if (e.channel.label === 'data') {
            resolve(e.channel)
          }
        })
      }
    })
    // 2. 等待数据通道就绪
      .then(channel => { 
        if (channel.readyState === 'open') {
          return channel
        } else {
          return new Promise<RTCDataChannel>(resolve => { 
            channel.addEventListener('open', () => { 
              resolve(channel)
            })
          })
        }
      })
  }

  /**
   * 开始接收文件。需要确保在获得了文件元数据之后调用，否则会抛出异常
   */
  public async receiveFile(writableStream: WritableStream) { 
    return new Promise<void>(async(resolve, reject) => { 
      try {
        const pc = this.rawSession?.getPeerConnection()
        if (!this.rawSession || !pc) {
          throw new Error('未创建数据通道，无法传输文件')
        }
        const toPeerId = this.rawSession.getRemotePeerId()
        if (!toPeerId) {
          throw new Error('未与对端创建连接，无法传输文件')
        }

        if (!this.fileMetaData) {
          throw new Error('未获取到文件信息，无法传输文件')
        }
        let receivedSize = 0
        const fileInfo = this.fileMetaData
        const channel = await this.getDataChannel(this.rawSession, this.localDataChannel)
        const w = writableStream.getWriter()
        channel.addEventListener('message', async(event: MessageEvent) => {
          const data = event.data as ArrayBuffer
          await w.write(data)
          receivedSize += data.byteLength

          // 触发进度事件
          this.updateProgress({ 
            loaded: receivedSize, 
            total: fileInfo.fileSize
          }, this.rawSession?.getLocalPeerId() as string)

          // 检查是否接收完毕（根据预先收到的 fileInfo）
          if (receivedSize >= fileInfo.fileSize) {
            await w.close()

            // 通知发送端传输完成
            this.dispatchEvent('completed', this.getLocalPeerId())
            await this.rawSession?.sendSignalingMessage({
              dataType: 'BUSINESS_MESSAGE',
              data: {
                type: 'transfer-completed'
              }
            })
            await window.SfcUtils.sleep(5000)
            this.close()
            resolve()
          }
        })

        // 通知发送端可以发送了
        await this.rawSession.sendSignalingMessage({
          dataType: 'BUSINESS_MESSAGE',
          data: {
            type: 'start-transfer'
          } as WebRTCDataBusinessMessageData
        })
        this.dispatchEvent('start-transfer', this.getLocalPeerId())
      } catch (e) {
        const err = e instanceof Error ? e : new Error('' + e)
        this.dispatchEvent('error', err, this.getLocalPeerId())
        reject(err)
      }
    })
  }

  public close() {
    this.hostSessions.forEach(session => { 
      session.close()
    })
    this.rawSession?.close()
    this.rawSession = null
  }
}

export class WebRTCService {

  /**
   * 创建一个用于视频传输的WebRTC会话
   * @param opt 
   * @returns
   */
  public static async createVideoPeer(opt: WebRTCVideoCreateOption): Promise<WebRTCVideoSession> {
    const s = new WebRTCVideoSession(opt)
    try {
      await s.init()
      return s
    } catch(e) {
      s.close()
      throw e
    }
  }

  /**
   * 创建一个用于文件传输的WebRTC会话
   * @param opt 
   * @returns
   */
  public static async createFileTransferPeer(opt: WebRTCFileTransferCreateOption): Promise<WebRTCDataSession> { 
    const s = new WebRTCDataSession(opt)
    try {
      await s.init()
      return s
    } catch(e) {
      s.close()
      throw e
    }
  }
}