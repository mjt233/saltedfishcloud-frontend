import { IdType } from 'sfc-common/model/Common'
import { context } from 'sfc-common'


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

export interface WebSocketOption {
  url?: string

  onMessage?: WebSocketMessageHandler

  onError?: (e: Event) => void

  onOpen?: (e: Event) => void
}

function doConnect(option: WebSocketOption) {
  const url = (option.url || '/api/ws').replaceAll(/^\/+/g, '')
  let port
  
  // vite反代websocket会出问题导致vite进程退出，不知道为啥，先这样写死
  if (import.meta.env.DEV) {
    port = '8087'
  } else {
    port = location.port
  }

  ws = new WebSocket(`${location.protocol == 'https' ? 'wss' : 'ws'}://${location.hostname}:${port}/${url}?Token=${context.session.value.token}`)
  return new Promise<WebSocket>((resolve, reject) => {
    ws.onerror = e => {
      option.onError && option.onError(e)
      reject(e)
    }
    ws.onopen = e => {
      option.onOpen && option.onOpen(e)
      resolve(ws)
    }
    ws.onmessage = msg => {
      const response: WebSocketResponse = JSON.parse(msg.data)
      option.onMessage && option.onMessage(response)
    }
  })
}

export namespace WebSocketService {
  /**
   * 连接服务
   */
  export async function connect(option: WebSocketOption) {
    return doConnect(option)
  }

  /**
   * 订阅异步任务日志消息
   * @param ws websocket实例
   * @param taskId 任务id
   */
  export function subscribeAsyncTaskLog(ws: WebSocket, taskId: IdType) {
    const request = {
      action: 'subscribe',
      type: 'async_task_log',
      data: taskId
    } as WebSocketRequest
    ws.send(JSON.stringify(request))
  }
}