import md5 from 'js-md5'

const md5obj = md5.create()
const progInfo = {
  total: 0,
  loaded: 0
}
let lastUpdateProgTime = 0

function updateMd5(data: Uint8Array) {
  progInfo.loaded += data.byteLength
  md5obj.update(data)
  const nowTime = Date.now()
  if (nowTime - lastUpdateProgTime > 500) {
    postMessage({
      type: 'progUpdate',
      data: progInfo
    })
    lastUpdateProgTime = nowTime
  }
}


onmessage = async e => {
  // 接收需要计算的原始参数
  const fileInfo = e.data as {
    stream: ReadableStream<Uint8Array>,
    size: number
  }
  progInfo.loaded = fileInfo.size

  const begin = Date.now()
  try {
    // 开始读取
    const reader = fileInfo.stream.getReader()
    while(true) {
      const {done, value} = await reader.read()

      if (value && value.byteLength > 0) {
        updateMd5(value)
      }
      
      // 完成，不用继续读取
      if (done) {
        break
      }
    }
    postMessage({
      type: 'finish',
      data: md5obj.hex()
    })
    // console.log(`读取完成，耗时:${(Date.now() - begin) / 1000}s`)
  } catch (err) {
    console.error(err)
    postMessage({
      type: 'error',
      data: err
    })
  }
}