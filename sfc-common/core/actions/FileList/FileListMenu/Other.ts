import { VBtn } from 'vuetify/components'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { SfcUtils } from 'sfc-common/utils/SfcUtils'

import { FileClipBoard, FileClipBoardType } from 'sfc-common/core/context/type'
import { FileListContext, FileTransferParam } from 'sfc-common/model'
import { defineComponent, h, reactive } from 'vue'
import { context } from 'sfc-common/core/context'
import { MenuGroup } from 'sfc-common/core/context/menu/type'
import API from 'sfc-common/api'
import { Validators } from 'sfc-common/core/helper/Validators'
import { WebSocketService } from 'sfc-common/core/serivce/WebSocketService'
import LogView from 'sfc-common/components/common/LogView.vue'
import { AsyncTaskInfo } from 'sfc-common/components'

const archiveTypeCache = new Map<string, boolean>()

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
        const wid = (await SfcUtils.request(API.wrap.createWrap({
          filenames: ctx.selectFileList.map(e => e.name),
          source: 'file',
          sourceId: ctx.uid,
          path: ctx.path
        }))).data.data
        const nodeName = (ctx.path as string).split('/').pop()
        const wrapName = nodeName ? `${nodeName}.zip` : '打包下载.zip' 
        const url = API.wrap.downloadWrap(wid, wrapName).url
        const fullUrl = StringUtils.appendPath(API.getDefaultPrefix(), url)
        window.open(fullUrl)
      }
    },
    {
      id: 'unpackage',
      icon: 'mdi-package-up',
      title: '解压缩',
      renderOn(ctx) {
        // 只读模式不允许解压
        if (ctx.readonly) {
          return false
        }
        // 选择的文件数量必须是1
        if (ctx.selectFileList.length != 1) {
          return false
        }
        const name = ctx.selectFileList[0].name
        const idx = name.lastIndexOf('.')

        // 没有拓展名，排除
        if (idx == -1) {
          return false
        }

        // 判断拓展名是否在支持的压缩类型范围内
        if (archiveTypeCache.size == 0) {
          context.feature.value.archiveType.forEach(type => archiveTypeCache.set(type, true))
        }
        const extName = name.substring(idx + 1)
        return archiveTypeCache.get(extName) == true
      },
      async action(ctx) {
        try {
          const path = await SfcUtils.selectPath({
            title: '选择解压位置',
            uid: ctx.uid,
            path: ctx.path
          })
          await SfcUtils.request(API.file.unzip(ctx.uid, ctx.path, ctx.selectFileList[0].name, path))
          if (path == ctx.path) {
            await ctx.modelHandler.refresh()
          }
        } catch(err) {
          if (err != 'cancel') {
            return Promise.reject(err)
          }
        }
      }
    },
    {
      id: 'compress',
      title: '压缩',
      icon: 'mdi-package-down',
      renderOn(ctx) {
        if (ctx.readonly) {
          return false
        }
        return ctx.selectFileList.length != 0
      },
      async action(ctx) {
        try {
          // 选择文件
          const path = await SfcUtils.selectPath({
            uid: ctx.uid,
            path: ctx.path
          })

          // 设置文件名
          const name = await SfcUtils.prompt({
            title: '压缩文件名',
            cancelToReject: true,
            rules: [
              Validators.notNull('压缩文件名不能为空'),
              (val: string) => {
                if (!val.endsWith('.zip')) {
                  return '必须以.zip结尾'
                } else {
                  return true
                }
              }
            ]
          })

          // 发起异步任务
          const taskId = (await SfcUtils.request(API.file.asyncCompress({
            sourceUid: ctx.uid,
            sourceNames: ctx.selectFileList.map(e => e.name),
            sourcePath: ctx.path,
            targetFilePath: StringUtils.appendPath(path, name),
            targetUid: ctx.uid,
            archiveParam: {
              type: 'zip',
              encoding: context.feature.value.archiveEncoding
            },
            waitExit: false
          }))).data.data
          
          let isFinish = false
          // 查看任务状态
          const dialog = SfcUtils.openComponentDialog(AsyncTaskInfo, {
            props: {
              taskId: taskId,
              async onTaskExit() {
                isFinish = true

                // 原地保存时刷新
                if (path == ctx.path) {
                  await ctx.modelHandler.refresh()
                }
              }
            },
            showCancel: false,
            title: '任务状态',
            extraDialogOptions: {
              maxWidth: '1280px'
            }
          })
        } catch(err) {
          if (err != 'cancel') {
            return Promise.reject(err)
          }
        }
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