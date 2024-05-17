import { IdType } from 'sfc-common/model'
import { CommonRequest, StringUtils, useJsonBody } from 'sfc-common'
import { ShellExecuteParameter, ShellExecuteResult, ShellSessionRecord } from './model'
const prefix = '/webShell'
const SfcUtils = window.SfcUtils
export namespace WebShellApi {
  /**
   * 获取shell实时交互websocket url
   * @param sessionId 会话id
   */
  export function getShellWebSocketUrl(sessionId: IdType) {
    return StringUtils.appendPath(SfcUtils.axios.defaults.baseURL || '', `/webshell/${sessionId}`)
  }
  /**
   * 获取交互式shell的WebSocket实时交互URL
   * @param sessionId 会话id
   */
  export function getShellWsUrl(sessionId: IdType): string {
    return `${prefix}/${sessionId}`
  }
  /**
   * 发送简单命令执行
   */
  export function sendSimpleCommand(param: ShellExecuteParameter, nodeId?: IdType | null): CommonRequest<ShellExecuteResult> {
    return useJsonBody({
      url: `${prefix}/executeCommand`,
      method: 'post',
      params: { nodeId },
      data: param
    })
  }

  /**
   * 创建可交互的shell会话
   * @param param 会话创建参数
   * @param nodeId 指定的节点id
   */
  export function createSession(param: ShellExecuteParameter, nodeId?: IdType | null): CommonRequest<ShellSessionRecord> {
    return useJsonBody({
      url: `${prefix}/createSession`,
      params: { nodeId },
      data: param,
      method: 'post'
    })
  }

  /**
   * 重启会话
   * @param sessionId 会话id
   */
  export function restart(sessionId: IdType): CommonRequest<ShellSessionRecord> {
    return {
      url: `${prefix}/restart`,
      params: { sessionId }
    }
  }

  /**
   * 修改pty会话终端尺寸
   * @param sessionId 会话id
   */
  export function resizePty(sessionId: IdType, rows: number, cols: number): CommonRequest<ShellSessionRecord> {
    return {
      url: `${prefix}/resizePty`,
      params: { sessionId, rows, cols }
    }
  }

  /**
   * 删除会话
   * @param sessionId 会话id
   */
  export function remove(sessionId: IdType): CommonRequest {
    return {
      url: `${prefix}/remove`,
      params: { sessionId }
    }
  }

  /**
   * 终止会话进程
   * @param sessionId 会话id
   */
  export function kill(sessionId: IdType): CommonRequest {
    return {
      url: `${prefix}/kill`,
      params: { sessionId }
    }
  }

  /**
   * 重命名会话
   * @param sessionId 会话id
   * @param newName   新名称
   */
  export function rename(sessionId: IdType, newName: string): CommonRequest {
    return {
      url: `${prefix}/rename`,
      params: { name: newName, sessionId }
    }
  }

  /**
   * 获取所有运行中的会话
   */
  export function listSession(): CommonRequest<ShellSessionRecord[]> {
    return {
      url: `${prefix}/listSession`
    }
  }

  /**
   * 获取会话最近的输出
   * @param sessionId 会话id
   */
  export function getLog(sessionId: IdType): CommonRequest<string> {
    return {
      url: `${prefix}/getLog`,
      params: { sessionId }
    }
  }
}