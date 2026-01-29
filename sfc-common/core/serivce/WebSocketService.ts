import { IdType } from 'sfc-common/model/Common'
import { getContext } from '../context'

let ws: WebSocket

export type WsBusinessType = 'async_task_log'

export interface WebSocketRequest {
  /**
   * 请求动作
   */
  action: 'subscribe' | 'unsubscribe'

  /**
   * 数据业务类型
   */
  type: WsBusinessType

  /**
   * 参数数据
   */
  data: any
}

export interface WebSocketResponse {
  /**
   * 业务数据id
   */
  id: IdType

  /**
   * 业务类型
   */
  type: WsBusinessType

  /**
   * 业务数据
   */
  data: any
}

export type WebSocketMessageHandler = (msg: WebSocketResponse) => void

export interface NativeWebSocketOption {
  url?: string

  onError?: (e: Event) => void

  onOpen?: (e: Event) => void
}

export interface WebSocketOption extends NativeWebSocketOption {

  /**
   * 咸鱼云通用WebSocket消息处理函数，会覆盖WebSocket实例的onmessage属性。后续再另外设置的WebSocket消息处理函数会覆盖此函数。
   */
  onMessage?: WebSocketMessageHandler
}

export namespace WebSocketService {

  /**
   * 创建一个JavaScript原生的WebSocket对象
   * @param option WebSocket连接配置
   */
  export async function createNativeWebSocket(option: NativeWebSocketOption) {
    const url = (option.url || '/api/ws').replaceAll(/^\/+/g, '')
    let port
    
    // vite反代websocket会出问题导致vite进程退出，不知道为啥，先这样写死
    if (import.meta.env.DEV) {
      port = '8087'
    } else {
      port = location.port
    }

    ws = new WebSocket(`${location.protocol == 'https:' ? 'wss' : 'ws'}://${location.hostname}:${port}/${url}?Token=${getContext().session.value.token}`)
    return new Promise<WebSocket>((resolve, reject) => {
      ws.onerror = e => {
        option.onError && option.onError(e)
        reject(e)
      }
      ws.onopen = e => {
        option.onOpen && option.onOpen(e)
        resolve(ws)
      }
    })
  }
  /**
   * 连接咸鱼云网盘的通用WebSocket服务
   */
  export async function connect(option: WebSocketOption) {
    const ws = await createNativeWebSocket(option)
    ws.onmessage = msg => {
      const response: WebSocketResponse = JSON.parse(msg.data)
      option.onMessage && option.onMessage(response)
    }
    return ws
  }

  /**
   * 向咸鱼云网盘的通用WebSocket服务订阅消息
   * @param ws websocket实例
   * @param type 业务类型
   * @param data 订阅的业务数据
   */
  export function subscribe(ws: WebSocket, type: WsBusinessType, data: any) {
    const request = {
      action: 'subscribe',
      type,
      data
    } as WebSocketRequest
    ws.send(JSON.stringify(request))
  }

  /**
   * 订阅异步任务日志消息
   * @param ws websocket实例
   * @param taskId 任务id
   */
  export function subscribeAsyncTaskLog(ws: WebSocket, taskId: IdType) {
    return subscribe(ws, 'async_task_log', taskId)
  }
}