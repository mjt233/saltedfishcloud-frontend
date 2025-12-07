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

interface DirScanItem {
  /**
   * 是否为文件
   */
  isFile: boolean

  /**
   * 是否为目录
   */
  isDir: boolean

  /**
   * 相对于开始搜索的目录下的所在路径（不包含自己的文件名）
   */
  relativePath: string

  /**
   * 文件名
   */
  name: string

  /**
   * 当isFile为true时的File对象
   */
  file: File | null
}

/**
 * 遍历文件夹
 * @param item 待扫描项
 * @param callback 扫描出子文件的回调
 * @returns 扫描完成后resolve的Promise
 */
export async function scanDir(item: DataTransferItem, callback: (item: DirScanItem) => any | Promise<any>) {
  if (!(await testIsDir(item)) ) {
    return
  }
  
  function doScan(entry: FileSystemDirectoryEntry, relationPath: string) {
    const reader = entry.createReader()
    return new Promise((resolve, reject) => {
      const subPromises = [] as Promise<any>[]
      reader.readEntries(e => {
        function invokeCallback(i: DirScanItem) {
          const r = callback(i)
          if (r instanceof Promise) {
            subPromises.push(r)
          }
        }

        e.forEach(ent => {
          if (ent.isDirectory) {
            subPromises.push(doScan(ent as FileSystemDirectoryEntry, relationPath + '/' + ent.name))
            invokeCallback({
              isDir: ent.isDirectory,
              isFile: ent.isFile,
              relativePath: relationPath,
              file: null,
              name: ent.name
            })
          } else {
            subPromises.push(new Promise((res, rej) => {
              (ent as FileSystemFileEntry).file(f => {
                invokeCallback({
                  isDir: ent.isDirectory,
                  isFile: ent.isFile,
                  relativePath: relationPath,
                  file: f,
                  name: ent.name
                })
                res(f)
              }, reject)
            }))
          }
        })
        Promise.all(subPromises).then(e => {
          resolve(relationPath)
        })
      })
    })
  }
  return await doScan(item.webkitGetAsEntry() as FileSystemDirectoryEntry, item.getAsFile()?.name || '')
}

export function testIsDir(item: DataTransferItem) {
  const entry = item.webkitGetAsEntry && item.webkitGetAsEntry()
  if (entry) {
    return entry.isDirectory
  }
  const file = item.getAsFile()
  if (!file) {
    return false
  } else {
    return undefined
  }

  // const reader = new FileReader()
  // reader.readAsDataURL(file)
  // return new Promise((resolve, reject) => {
  //   reader.onerror = e => resolve(false)
  //   reader.onprogress = e => resolve(true)
  //   reader.onload = e => resolve(true)
  // })
}

/**
 * 计算文件的md5
 * @param file     文件对象
 * @author xiaotao233 <mjt233@qq.com>
 */
export function computeMd5(file: File, { success, error, prog }: Md5ComputeOption): CancelablePromise<string> {
  const worker = new Worker(new URL('./file.worker.ts', import.meta.url), { type: 'module' })
  let rejectFunc: Function
  return new CancelablePromise((resolve, reject) => {
    rejectFunc = reject
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
        worker.terminate()
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
    rejectFunc && rejectFunc('cancel')
    worker.terminate()
  })
  
}