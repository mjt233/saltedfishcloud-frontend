import { SfcUtils } from '@/utils/SfcUtils'
import md5 from 'js-md5'
import { buildAsyncTaskQueue } from '../AsyncTaskQueue'
import { sliceFile } from './sliceFile'

const queue = buildAsyncTaskQueue<string>()

export interface Prog {
  loaded: number,
  total: number
}

/**
 * 将blob转换成ArrayBuffer
 * @param blob 待转换的blob
 * @param onprogress 转换进度回调
 * @returns 转换结果
 */
export function blobToArrayBuffer(blob: Blob, onprogress: (e: ProgressEvent<FileReader>) => void): Promise<ArrayBuffer> {
  const reader = new FileReader()
  return new Promise((res, rej) => {
    reader.onload = () => {
      res(reader.result as ArrayBuffer)
    }
    reader.onerror = rej
    reader.onprogress = e => {
      onprogress && onprogress(e)
    }
    reader.readAsArrayBuffer(blob)
  })
}

export interface Md5ComputeOption {
  success?: (md5: string) => void,
  error?: (err: any) => void,
  prog?: (prog: Prog) => void
}


/**
 * 计算文件的md5
 * @param file     文件对象
 * @param options  选项
 * @param options.success 文件读取成功且完成md5计算时执行的回调
 * @param options.error 文件读取失败时执行的回调
 * @param options.prog   文件读取和md5计算中执行的回调
 * @author xiaotao233 <mjt233@qq.com>
 */
export async function executeComputeMd5(file: File, { success, error, prog }: Md5ComputeOption) {
  const md5obj = md5.create()

  // 按每16MiB分块读取
  const chunkSize = 1024 * 1024 * 16
  // 已读大小
  let cnt = 0
  const generator = sliceFile(file, chunkSize)
  let part
  while (!(part = generator.next()).done) {
    try {
      const buffer = await blobToArrayBuffer(part.value, e => {
        prog && prog({
          total: file.size,
          loaded: cnt + e.loaded
        })
      })
      md5obj.update(buffer)
      cnt += buffer.byteLength
    } catch (err) {
      error && error(err)
      return Promise.reject(err)
    }
  }
  const res = md5obj.hex()
  success && success(res)
  return res
}

/**
 * 计算文件的md5
 * @param {File} file     文件对象
 * @param {Object} options  选项
 * @param {Md5Callback} options.success 文件读取成功且完成md5计算时执行的回调
 * @param {ProgressCallback} options.error 文件读取失败时执行的回调
 * @param {ProgCallback} options.prog   文件读取和md5计算中执行的回调
 * @author xiaotao233 <mjt233@qq.com>
 */
export function computeMd5(file: File, { success, error, prog }: Md5ComputeOption) {
  return new Promise<string>((resolve, reject) => {
    queue.addTask(() => {
      const promise = executeComputeMd5(file, { success, error, prog })
      promise.then(resolve).catch(reject)
      return promise
    })
  })
  
}