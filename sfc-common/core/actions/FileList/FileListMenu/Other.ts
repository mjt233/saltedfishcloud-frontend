import { StringUtils } from 'sfc-common/utils/StringUtils'
import { SfcUtils } from 'sfc-common/utils/SfcUtils'

import { FileClipBoard, FileClipBoardType } from 'sfc-common/core/context/type'
import { FileListContext } from 'sfc-common/model'
import { reactive } from 'vue'
import { getContext } from 'sfc-common/core/context'
import { MenuGroup } from 'sfc-common/core/context/menu/type'
import API from 'sfc-common/api'
import { FileListMenuItem } from './type'
import { AsyncTaskService } from 'sfc-common/core/serivce/AsyncTaskService'
import { StringFormatter } from 'sfc-common/utils'
import ArchiveExtractForm from 'sfc-common/components/form/ArchiveExtractForm.vue'
import ArchiveCompressForm from 'sfc-common/components/form/ArchiveCompressForm.vue'

function setToClipBoard(ctx: FileListContext, type: FileClipBoardType) {
  getContext().fileClipBoard.value = reactive({
    files: ctx.selectFileList,
    path: ctx.path,
    type: type,
    otherAttr: {
      uid: ctx.uid
    }
  } as FileClipBoard)
}
const otherGroup: MenuGroup<FileListContext, FileListMenuItem> = 
{
  id: 'other',
  name: '其他操作',
  items: [
    {
      id: 'wrap',
      title: '打包下载',
      icon: 'mdi-briefcase-download',
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
      icon: 'mdi-package-variant',
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
        const name = ctx.selectFileList[0].name.toLowerCase()
        const idx = name.lastIndexOf('.')

        // 没有拓展名，排除
        if (idx == -1) {
          return false
        }

        // 判断拓展名是否在支持的压缩类型范围内
        return getContext().feature.value.archiveEngineList.some(e => e.decompressExtensions.some(ext => name.endsWith(ext.toLowerCase())))
      },
      async action(ctx) {
        try {
          const file = ctx.selectFileList[0]
          const dialog = SfcUtils.openComponentDialog(ArchiveExtractForm, {
            props: {
              uid: ctx.uid,
              path: ctx.path,
              encoding: 'UTF8',
              archiveName: file.name
            },
            title: '解压缩参数',
            async onConfirm() {
              const submitResult = await dialog.getInstAsForm().submit()
              if (!submitResult.success) {
                return false
              }

              const formData = dialog.getInstAsForm().getFormData() as {
                path: string
                encoding: string
              }
              const taskId = (await SfcUtils.request(API.archive.asyncExtract({
                source: {
                  ...ctx.getProtocolParams(),
                  path: ctx.path,
                  name: file.name
                },
                archiveParam: {
                  type: file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase(),
                  encoding: formData.encoding
                },
                uid: ctx.uid,
                path: formData.path
              }))).data.data

              let isFinish = false
              const taskDialog = AsyncTaskService.openSimpleAsyncTaskInfoDialog({
                title: '解压缩',
                taskId,
                componentProps: {
                  speedFormatter(speed) {
                    return StringFormatter.toSize(speed) + '/s'
                  }
                },
                async onTaskExit(task) {
                  isFinish = true
                  if (task.status == 2 && formData.path == ctx.path) {
                    await ctx.modelHandler.refresh()
                  }
                },
                async onDialogCancel() {
                  if (!isFinish) {
                    SfcUtils.loadingDialogTask({ msg: '正在取消任务' }, () => SfcUtils.request(API.asyncTask.interrupt(taskId)))
                  }
                  return true
                }
              })
              return true
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
      id: 'compress',
      title: '压缩',
      icon: 'mdi-zip-box',
      renderOn(ctx) {
        if (ctx.readonly) {
          return false
        }
        return ctx.selectFileList.length != 0
      },
      async action(ctx) {
        try {
          const dialog = SfcUtils.openComponentDialog(ArchiveCompressForm, {
            title: '创建压缩任务',
            props: {
              archiveEngineList: getContext().feature.value.archiveEngineList,
              path: ctx.path,
              sourceUid: ctx.uid,
              sourcePath: ctx.path,
              sourceNames: ctx.selectFileList.map(e => e.name)
            },
            async onConfirm() {
              const submitResult = await dialog.getInstAsForm().submit()
              if (!submitResult.success) {
                return false
              }

              const formData = dialog.getInstAsForm().getFormData() as any
              const targetFileName = formData.name + '.' + formData.format

              const taskId = (await SfcUtils.request(API.archive.asyncCompress({
                sourceUid: ctx.uid,
                sourceNames: ctx.selectFileList.map(e => e.name),
                sourcePath: ctx.path as string,
                targetFilePath: StringUtils.appendPath(formData.path, targetFileName),
                targetUid: ctx.uid,
                engineProviderId: formData.engineId,
                engineProperty: {
                  encoding: formData.encoding,
                  compressionLevel: formData.compressionLevel
                },
                waitExit: false
              }))).data.data

              let isFinish = false
              const taskDialog = AsyncTaskService.openSimpleAsyncTaskInfoDialog({
                title: '压缩文件',
                taskId,
                componentProps: {
                  speedFormatter(speed) {
                    return StringFormatter.toSize(speed) + '/s'
                  }
                },
                async onTaskExit(task) {
                  isFinish = true
                  if (task.status == 2 && formData.path == ctx.path) {
                    await ctx.modelHandler.refresh()
                  }
                },
                async onDialogCancel() {
                  if (!isFinish) {
                    SfcUtils.loadingDialogTask({ msg: '正在取消任务' }, () => SfcUtils.request(API.asyncTask.interrupt(taskId)))
                  }
                  return true
                }
              })
              return true
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
        return ctx.selectFileList.length > 0 && !!getContext().session.value.token
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
        return !ctx.readonly && ctx.selectFileList.length > 0 && !!getContext().session.value.token
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
        const clipBoard = getContext().fileClipBoard.value
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
        const clip = getContext().fileClipBoard.value
        if ((clip.otherAttr.uid === 0 || clip.otherAttr.uid) && ctx.path) {

          if (clip.type == 'copy') {
            let isFinish = false
            // 创建复制任务
            const asyncTask = (await SfcUtils.request(API.file.asyncCopy({
              isOverwrite: true,
              sourcePath: clip.path,
              sourceUid: clip.otherAttr.uid,
              targetPath: ctx.path,
              targetUid: ctx.uid,
              files: clip.files.map(e => e.name)
            }))).data.data

            // 打开复制任务信息对话框
            const dialog = AsyncTaskService.openSimpleAsyncTaskInfoDialog({
              title: '复制文件',
              taskId: asyncTask.id,
              componentProps: {
                speedFormatter(speed) {
                  return StringFormatter.toSize(speed) + '/s'
                }
              },
              async onTaskExit(task) {
                // 任务退出后，如果已完成则刷新当前列表
                isFinish = true
                if (task.status == 2) {
                  dialog.close()
                  ctx.modelHandler.refresh()
                  await SfcUtils.snackbar('复制完成')
                }
              },
              async onDialogCancel() {
                // 点击取消时，如果任务未完成则中断任务
                if (!isFinish) {
                  SfcUtils.beginLoading()
                  try {
                    await SfcUtils.request(API.asyncTask.interrupt(asyncTask.id))
                  } finally {
                    SfcUtils.closeLoading()
                  }
                }
                return true
              },
            })
          } else if (clip.type == 'cut') {
            await SfcUtils.request(API.file.move({
              files: clip.files.map(e => { return {
                source: StringUtils.appendPath(clip.path, e.name),
                target: StringUtils.appendPath(ctx.path as string, e.name),
              } }),
              sourceUid: clip.otherAttr.uid,
              targetUid: ctx.uid as number
            }))
            getContext().fileClipBoard.value = reactive({} as FileClipBoard)
          }
          await ctx.modelHandler.refresh()
        }
      }
    }
  ]
}

export default otherGroup