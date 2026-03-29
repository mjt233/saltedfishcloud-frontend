import FileBrowser from 'sfc-common/components/common/FileBrowser.vue'
import { IdType } from 'sfc-common/model'
import { FileInfo, FileListContext } from 'sfc-common/model/FileInfo'
import { FileSystemHandlerFactory } from 'sfc-common/core/serivce/FileSystemHandler'
import { computed, h, reactive, ref } from 'vue'
import { ComponentDialogInstance, dialog, DialogPromise, openComponentDialog } from '../common/Dialog'
import SfcUtils from '..'
import FileExplorer from 'sfc-common/components/common/FileExplorer/FileExplorer.vue'
import { StringUtils } from 'sfc-common/utils/StringUtils'


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
   * 选择的文件类型，默认为all 表示同时可以选择文件或目录
   */
  selectType?: 'file' | 'dir' | 'all'

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
  const { path, uid, title = '选择目录', filter = (e) => e.dir, fullscreen = false, readOnly = true, selectType = 'all' } = param

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
    },
    showMountIcon: true,
    fileSystemHandler: handler,
    style: {
      height: '80vh'
    },
    autoComputeHeight: true,
    autoComputeHeightOffset: -72,
    useSelect: false,
    fileViewType: 'list',
    readOnly,
    autoOpenFile: false,
    hideToolBar: true,
    hideFileViewToggle: true,
    onFileClick(file: FileInfo) {
      if (!file.dir) {
        dialogInst.doConfirm()
      }
    }
  })

  return new Promise((resolve, reject) => {
    dialogInst = openComponentDialog(FileExplorer, {
      props: propsAttr,
      onConfirm() {
        const explorer = dialogInst.getComponentInstRef() as InstanceType<typeof FileExplorer>
        const { selectFileList } = explorer.getListContext()
        if (selectFileList.length == 1 && selectFileList[0].dir) {
          // 单独选了一个文件夹时，直接进入这个文件夹
          explorer.changePath(StringUtils.appendPath(propsAttr.path, selectFileList[0].name))
          return false
        }

        if (param.requireFile && explorer.getListContext().selectFileList.length == 0) {
          SfcUtils.snackbar('请选择一个文件')
          return false
        }
        resolve({
          path: propsAttr.path,
          file: explorer.getListContext().selectFileList,
          fileListContext: (dialogInst.getComponentInstRef() as InstanceType<typeof FileExplorer>).getListContext()
        })
        return true
      },
      onCancel() {
        reject('cancel')
        return true
      },
      dense: true,
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
