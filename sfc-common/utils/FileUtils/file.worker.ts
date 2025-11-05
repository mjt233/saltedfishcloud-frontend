import md5 from 'js-md5'
import { FileMd5TaskMsgData, FileWorkerMessage } from './FileDataProcess'

const md5obj = md5.create()
let reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> | undefined
const progInfo = {
  total: 0,
  loaded: 0
}
let lastUpdateProgTime = 0
let isCancel = false

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

let fileInfo: FileMd5TaskMsgData | undefined

async function startCompute(task: FileMd5TaskMsgData) {
  if (fileInfo) {
    console.error('不能重复开始计算')
    return
  }
  fileInfo = task

  progInfo.total = fileInfo.size

  try {
    // 开始读取
    reader = fileInfo.stream.getReader()
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
    if (isCancel) {
      postMessage({
        type: 'cancel'
      } as FileWorkerMessage)
    } else {
      postMessage({
        type: 'finish',
        data: md5obj.hex()
      } as FileWorkerMessage)
    }
  } catch (err) {
    console.error(err)
    postMessage({
      type: 'error',
      data: err
    })
  }
}

function cancelCompute() {
  if (!reader) {
    console.error('未开始计算，无需取消')
    return
  }
  reader.cancel('cancel')
  isCancel = true
}

onmessage = async e => {
  const msg = e.data as FileWorkerMessage
  if (msg.type == 'start') {
    startCompute(msg.data)
  } else if (msg.type == 'cancel') {
    cancelCompute()
  } else {
    console.error('不支持的操作类型', msg.type)
  }
}