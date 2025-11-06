import { reactive } from 'vue'

const logViewerMap = reactive({
  logger: 'logger-log-record-viewer',
  '发送邮件': 'mail-log-record-viewer'
} as {[type:string]: string})

export namespace LogRecordService {
  export function getLogViewerMap() {
    return logViewerMap
  }
}