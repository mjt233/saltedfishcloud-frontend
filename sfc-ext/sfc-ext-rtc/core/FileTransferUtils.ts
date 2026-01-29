/**
 * 判断当前浏览器是否支持showSaveFilePicker
 */
export function isSupportShowSaveFilePicker() {
  return 'showSaveFilePicker' in window
}

/**
 * 实现一个内存中的可写流，用于保存写入的数据
 */
class MemoryWritableStream {
  private chunks: (ArrayBuffer | Blob)[] = []
  private size = 0

  /**
   * 写入数据到内存缓冲区
   */
  async write(chunk: Blob | ArrayBuffer) {
    this.chunks.push(chunk)
    if (chunk instanceof ArrayBuffer) {
      this.size += chunk.byteLength
    } else {
      this.size += chunk.size
    }
  }

  /**
   * 获取写入的所有数据作为一个 Blob
   */
  async getResult(): Promise<Blob> {
    const totalSize = this.chunks.reduce((sum, chunk) => {
      if (chunk instanceof ArrayBuffer ) {
        return sum + chunk.byteLength
      } else {
        return sum + chunk.size
      }
    }, 0)
    const buffer = new Uint8Array(totalSize)

    let offset = 0
    for (const chunk of this.chunks) {
      if (chunk instanceof ArrayBuffer) {
        buffer.set(new Uint8Array(chunk), offset)
        offset += chunk.byteLength
      } else {
        const chunkArrayBuffer = await chunk.bytes()
        buffer.set(chunkArrayBuffer, offset)
        offset += chunkArrayBuffer.byteLength
      }
    }

    return new Blob([buffer])
  }

  /**
   * 关闭流
   */
  async close() {
    // 不需要额外的操作，因为数据已经保存在内存中
  }
}

/**
 * 创建用于保存文件的流。
 * @param suggestedName 建议的文件名
 */
export async function createSaveFileStream(suggestedName: string): Promise<WritableStream> {
  // 调用isSupportShowSaveFilePicker，当浏览器支持showSaveFilePicker时，使用showSaveFilePicker创建文件写入流
  if (isSupportShowSaveFilePicker()) {
    const handle: FileSystemFileHandle = await (window as any).showSaveFilePicker({ suggestedName })
    return handle.createWritable()
  } else {
    // 浏览器不支持 showSaveFilePicker 时，使用内存写入流
    const memoryStream = new MemoryWritableStream()
    
    // 返回一个实现了 WritableStream 接口的对象
    const writableStream = new WritableStream({
      write(chunk) {
        return memoryStream.write(chunk)
      },
      close() {
        return memoryStream.close()
      }
    })
    
    // 添加 getResult 方法到 writableStream 对象
    ;(writableStream as any).getResult = () => memoryStream.getResult()
    return writableStream
  }
}