import FileBrowser from 'sfc-common/components/common/FileBrowser.vue'
import { IdType } from 'sfc-common/model'
import { FileInfo } from 'sfc-common/model/FileInfo'
import { FileSystemHandlerFactory } from 'sfc-common/core/serivce/FileSystemHandler'
import { computed, h, reactive, ref } from 'vue'
import { dialog, openComponentDialog } from '../common/Dialog'


export interface FileSelectParam {
    uid: IdType

    title?: string,

    path: string,

    filter?: (file: FileInfo) => boolean

    fullscreen?: boolean
    
}

/**
 * 打开网盘路径选择对话框
 * @param param 选择参数
 */
export function selectPath(param: FileSelectParam): Promise<string> {
  const { path, uid, title = '选择目录', filter = (e) => e.dir, fullscreen = false } = param

  // 我也不知道为什么要用computed，反正不用computed的话，这个handler的方法调用时，内部的this.uid通通变成number类型而不是Ref类型...
  // 我好没本领.jpg :(
  const handler = computed(() => FileSystemHandlerFactory.getFileSystemHandler(ref(uid)))
  const propsAttr = reactive({
    path,
    uid,
    filter,
    'onUpdate:path': (e: string) => {
      propsAttr.path = e
    },
    fileSystemHandler: handler,
    style: {
      height: '80vh'
    },
    autoComputeHeight: false,
    useSelect: false
  })
  return new Promise((resolve, reject) => {
    openComponentDialog(FileBrowser, {
      props: propsAttr,
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
