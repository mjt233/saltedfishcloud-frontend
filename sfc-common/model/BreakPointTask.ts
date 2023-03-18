export interface BreakPointTaskMetaData {
  taskId: string

  /**
   *  文件名
   */
  fileName: string

  /**
   *  文件长度
   */
  length: number

  /**
   * 每个分块的大小（默认2MiB）
   * 最小2MiB，最大64MiB
   */
  chunkSize: number

  /**
   * 分块总数
   */
  chunkCount: number

  /**
   * 最后一个分块的大小
   */
  lastChunkSize: number
}