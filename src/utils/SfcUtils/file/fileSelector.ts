import FileBrowser from '@/components/common/FileBrowser.vue'
import { FileInfo } from '@/core/model/FileInfo'
import { h, reactive, ref } from 'vue'
import { dialog } from '../common/Dialog'


export interface FileSelectParam {
    uid: number

    title?: string,

    path: string,

    filter?: (file: FileInfo) => boolean
    
}

/**
 * 打开网盘路径选择对话框
 * @param param 选择参数
 */
export function selectPath(param: FileSelectParam): Promise<string> {
  const { path, uid, title = '选择目录', filter = (e) => e.dir } = param
  const propsAttr = reactive({
    path,
    uid,
    filter,
    'onUpdate:path': (e: string) => {
      propsAttr.path = e
    }
  })
  return new Promise((resolve, reject) => {
    dialog({
      children: () => h(FileBrowser, propsAttr),
      onConfirm() {
        resolve(propsAttr.path)
        return true
      },
      onCancel() {
        reject('cancel')
        return true
      },
      title
    })
  })
}
