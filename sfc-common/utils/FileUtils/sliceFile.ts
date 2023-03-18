
/**
 * 将文件按指定的块大小进行分割，文件最后一小块大小可能小于指定的块大小
 * @param {File} file 文件
 * @param {Number} chunkSize 每个分块的大小
 * @returns {Generator<Blob, void, unknown>}
 */
export function * sliceFile(file: File, chunkSize = 1024 * 1024 * 2) {
  const fileSize = file.size
  let index = 0
  while (index < fileSize) {
    const end = index + Math.min(fileSize, chunkSize)
    yield file.slice(index, end)
    index = end
  }
}

/**
 * 根据文件大小生成合适的分块大小
 * @param {Number} size 文件大小
 */
export function getChunkSize(size: number) {
  let chunkSize = 2097152
  if (size > 1024 * 1024 * 16) {
    chunkSize *= 2
  } else if (chunkSize > 1024 * 1024 * 128) {
    chunkSize *= 8
  }
  return chunkSize
}
