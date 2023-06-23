import { IdType } from 'sfc-common/model'
import { CommonRequest, useJsonBody } from 'sfc-common'
import { ShellExecuteParameter, ShellExecuteResult } from './model'
const prefix = '/webShell'
export namespace WebShellApi {
  /**
   * 发送简单命令执行
   */
  export function sendSimpleCommand(param: ShellExecuteParameter, nodeId: IdType): CommonRequest<ShellExecuteResult> {
    return useJsonBody({
      url: `${prefix}/executeCommand`,
      method: 'post',
      params: { nodeId },
      data: param
    })
  }
}