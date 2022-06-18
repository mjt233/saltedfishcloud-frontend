import { StringUtils } from '@/utils/StringUtils'
import { SfcUtils } from '@/utils/SfcUtils'
import { FileClipBoard, FileClipBoardType } from './../../type'
import { FileListContext, FileTransferParam } from '@/core/model'
import { reactive } from 'vue'
import { context } from '../..'
import { MenuGroup } from '../type'
import API from '@/api'
function setToClipBoard(ctx: FileListContext, type: FileClipBoardType) {
  context.fileClipBoard.value = reactive({
    files: ctx.selectFileList,
    path: ctx.path,
    type: type,
    otherAttr: {
      uid: ctx.uid
    }
  } as FileClipBoard)
}
const otherGroup: MenuGroup<FileListContext> = 
{
  id: 'other',
  name: '其他操作',
  items: [
    {
      id: 'wrap',
      title: '打包下载',
      icon: 'mdi-download',
      renderOn(ctx) {
        return ctx.selectFileList.length > 1 || ctx.selectFileList.find(e => e.dir) != undefined
      },
      async action(ctx) {
        const wrapId = await SfcUtils.request(API.file.createWrap(ctx.uid as number, {
          filenames: ctx.selectFileList.map(e => e.name),
          source: ctx.path as string
        }))
        const nodeName = (ctx.path as string).split('/').pop()
        const wrapName = nodeName ? `${nodeName}.zip` : '打包下载.zip' 
        const url = API.file.downloadWrap(wrapId.data.data, wrapName).url
        const fullUrl = StringUtils.appendPath(API.getDefaultPrefix(), url)
        window.open(fullUrl)
      }
    },
    {
      id: 'copy',
      title: '复制',
      icon: 'mdi-content-copy',
      renderOn(ctx) {
        return ctx.selectFileList.length > 0 && !!context.session.value.token
      },
      async action(ctx) {
        setToClipBoard(ctx, 'copy')
        SfcUtils.snackbar('已复制，在目标目录可粘贴')
      }
    },
    {
      id: 'cut',
      title: '剪切',
      icon: 'mdi-content-cut',
      renderOn(ctx) {
        return !ctx.readonly && ctx.selectFileList.length > 0 && !!context.session.value.token
      },
      async action(ctx) {
        setToClipBoard(ctx, 'cut')
        SfcUtils.snackbar('已剪切，在目标目录可粘贴')
      }
    },
    {
      id: 'paste',
      title: '粘贴',
      icon: 'mdi-content-paste',
      renderOn(ctx) {
        // 只读模式不显示
        if (ctx.readonly) {
          return false
        }

        // 剪切板没文件不显示
        const clipBoard = context.fileClipBoard.value
        if (!clipBoard) {
          return false
        }

        // 跨盘剪切不显示
        if (clipBoard.type == 'cut' && clipBoard.otherAttr?.uid !== ctx.uid) {
          return false
        }

        // 其他情况显示
        return true
      },
      async action(ctx) {
        const clip = context.fileClipBoard.value
        if ((clip.otherAttr.uid === 0 || clip.otherAttr.uid) && ctx.path) {
          const param: FileTransferParam = {
            files: clip.files.map(e => { return {
              source: StringUtils.appendPath(clip.path, e.name),
              target: StringUtils.appendPath(ctx.path as string, e.name),
            } }),
            sourceUid: clip.otherAttr.uid,
            targetUid: ctx.uid as number
          }

          if (clip.type == 'copy') {
            await SfcUtils.request(API.file.copy(param))
          } else if (clip.type == 'cut') {
            await SfcUtils.request(API.file.move(param))
            context.fileClipBoard.value = reactive({} as FileClipBoard)
          }
          await ctx.modelHandler.refresh()
        }
      }
    }
  ]
}

export default otherGroup