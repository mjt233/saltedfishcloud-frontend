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

type WorkerMessage = { type: 'progUpdate', data: { total: number, loaded: number } }
  | { type: 'finish', data: string }
  | { type: 'error', data: Error }

/**
 * 计算文件的md5
 * @param file     文件对象
 * @author xiaotao233 <mjt233@qq.com>
 */
export function computeMd5(file: File, { success, error, prog }: Md5ComputeOption): Promise<string> {
  const worker = new Worker(new URL('./file.worker.ts', import.meta.url), { type: 'module' })
  return new Promise((resolve, reject) => {
    worker.onmessage = e => {
      const msg = e.data as WorkerMessage
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
      }
    }
    const stream = file.stream()
    worker.postMessage({ stream: stream, size: file.size }, [stream])
  })
  
}