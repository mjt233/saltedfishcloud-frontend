export interface Prog {
  loaded: number,
  total: number
}


export interface Md5ComputeOption {
  /**
   * 文件读取成功且完成md5计算时执行的回调
   */
  success?: (md5: string) => void

  /**
   * 文件读取失败时执行的回调
   */
  error?: (err: any) => void

  /**
   * 文件读取和md5计算中执行的回调
   */
  prog?: (prog: Prog) => void
}

export interface FileMd5TaskMsgData {
  stream: ReadableStream<Uint8Array>
  size: number
}

export type FileWorkerMessage = { type: 'progUpdate', data: Prog }
  | { type: 'finish', data: string }
  | { type: 'error', data: Error }
  | { type: 'start', data: FileMd5TaskMsgData }
  | { type: 'cancel' }

export class CancelablePromise<T> extends Promise<T> {
  private cancelAction: (() => void) | undefined
  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void, cancelAction: () => void) {
    super(executor)
    this.cancelAction = cancelAction
  }

  cancel() {
    this.cancelAction && this.cancelAction()
  }
}

/**
 * 计算文件的md5
 * @param file     文件对象
 * @author xiaotao233 <mjt233@qq.com>
 */
export function computeMd5(file: File, { success, error, prog }: Md5ComputeOption): CancelablePromise<string> {
  const worker = new Worker(new URL('./file.worker.ts', import.meta.url), { type: 'module' })
  return new CancelablePromise((resolve, reject) => {
    worker.onmessage = e => {
      const msg = e.data as FileWorkerMessage
      if (msg.type == 'finish') {
        worker.terminate()
        resolve(msg.data)
        success && success(msg.data)
      } else if (msg.type == 'error') {
        worker.terminate()
        reject(msg.data)
        error && error(msg.data)
      } else if (msg.type == 'progUpdate') {
        prog && prog(msg.data)
      } else if (msg.type == 'cancel') {
        reject('cancel')
      }
    }
    const stream = file.stream()
    const msg: FileWorkerMessage = {
      type: 'start',
      data: {
        stream: stream,
        size: file.size
      }
    }
    worker.postMessage(msg, [stream])
  }, () => {
    worker.postMessage({ type: 'cancel' } as FileWorkerMessage)
  })
  
}