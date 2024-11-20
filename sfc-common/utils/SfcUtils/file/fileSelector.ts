import FileBrowser from 'sfc-common/components/common/FileBrowser.vue'
import { IdType } from 'sfc-common/model'
import { FileInfo, FileListContext } from 'sfc-common/model/FileInfo'
import { FileSystemHandlerFactory } from 'sfc-common/core/serivce/FileSystemHandler'
import { computed, h, reactive, ref } from 'vue'
import { ComponentDialogInstance, dialog, DialogPromise, openComponentDialog } from '../common/Dialog'
import SfcUtils from '..'
import { FileBrowserModel } from 'sfc-common/model/component/FileListModel'


export interface FileSelectParam {
  /**
   * 目标用户id
   */
  uid: IdType

  /**
   * 对话框标题
   */
  title?: string,

  /**
   * 初始路径
   */
  path: string,

  /**
   * 文件过滤函数，默认只显示目录
   * @param file 待检测能否通过过滤的文件
   * @returns 能否显示
   */
  filter?: (file: FileInfo) => boolean

  /**
   * 是否全屏显示对话框
   */
  fullscreen?: boolean

  /**
   * 是否只读
   */
  readOnly?: boolean
  
  /**
   * 是否必须要选择一个文件
   */
  requireFile?: boolean
}

export interface FileSelectResult {
  file: FileInfo[],
  path: string,
  fileListContext: FileListContext
}

export function selectFile(param: FileSelectParam): Promise<FileSelectResult> {
  const { path, uid, title = '选择目录', filter = (e) => e.dir, fullscreen = false, readOnly = true } = param

  let lastClickItem: FileInfo | null = null
  let dialogInst: DialogPromise & ComponentDialogInstance

  // 我也不知道为什么要用computed，反正不用computed的话，这个handler的方法调用时，内部的this.uid通通变成number类型而不是Ref类型...
  // 我好没本领.jpg :(
  const handler = computed(() => FileSystemHandlerFactory.getFileSystemHandler(ref(uid)))
  const propsAttr = reactive({
    path,
    uid,
    filter,
    'onUpdate:path': (e: string) => {
      propsAttr.path = e
      lastClickItem = null
    },
    fileSystemHandler: handler,
    style: {
      height: '80vh'
    },
    autoComputeHeight: true,
    compensateHeight: -108,
    useSelect: false,
    readOnly,
    autoOpenFile: false,
    onClickItem: (ctx: FileListContext, file: FileInfo) => {
      lastClickItem = file
    },
    onClickFile: (ctx: FileListContext, file: FileInfo) => {
      dialogInst.doConfirm()
    }
  })

  return new Promise((resolve, reject) => {
    dialogInst = openComponentDialog(FileBrowser, {
      props: propsAttr,
      onConfirm() {
        if (param.requireFile && !lastClickItem) {
          SfcUtils.snackbar('请选择一个文件')
          return false
        }
        resolve({
          path: propsAttr.path,
          file: lastClickItem ? [lastClickItem] : [],
          fileListContext: (dialogInst.getComponentInstRef() as any as FileBrowserModel).getListContext()
        })
        return true
      },
      onCancel() {
        reject('cancel')
        return true
      },
      title,
      extraDialogOptions: {
        maxWidth: '720px'
      }
    })
  })
}

/**
 * 打开网盘路径选择对话框
 * @param param 选择参数
 */
export async function selectPath(param: FileSelectParam): Promise<string> {
  return (await selectFile(param)).path
}
