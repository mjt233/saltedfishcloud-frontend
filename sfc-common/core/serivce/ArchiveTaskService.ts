import API from 'sfc-common/api'
import ArchiveCompressForm from 'sfc-common/components/form/ArchiveCompressForm.vue'
import ArchiveExtractForm from 'sfc-common/components/form/ArchiveExtractForm.vue'
import { getContext } from 'sfc-common/core/context'
import { FileListContext, IdType } from 'sfc-common/model'
import { StringFormatter } from 'sfc-common/utils'
import { SfcUtils } from 'sfc-common/utils/SfcUtils'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { AsyncTaskService } from './AsyncTaskService'

/**
 * 创建解压任务所需的表单数据结构
 */
export interface CreateExtractTaskFormData {
  /** 解压引擎ID */
  engineId: string

  /** 文件名编码 */
  encoding: string

  /** 解压格式（不带点） */
  format: string

  /** 解压目标路径 */
  path: string

  /** 压缩包密码 */
  password?: string
}

/**
 * 创建压缩任务所需的表单数据结构
 */
export interface CreateCompressTaskFormData {
  /** 输出文件名（不含后缀） */
  name: string

  /** 压缩格式（不带点） */
  format: string

  /** 输出目录路径 */
  path: string

  /** 压缩引擎ID */
  engineId: string

  /** 文件名编码 */
  encoding: string

  /** 压缩级别 */
  compressionLevel?: 'STORE' | 'FASTEST' | 'FAST' | 'NORMAL' | 'HIGH' | 'ULTRA'

  /** 压缩包密码 */
  password?: string
}

/**
 * 解压任务对话框参数
 */
export interface OpenExtractDialogOptions {
  /** 文件列表上下文 */
  ctx: FileListContext

  /** 待解压文件名 */
  fileName: string

  /** 对话框标题 */
  title?: string
}

/**
 * 压缩任务对话框参数
 */
export interface OpenCompressDialogOptions {
  /** 文件列表上下文 */
  ctx: FileListContext

  /** 待压缩文件名列表 */
  sourceNames: string[]

  /** 对话框标题 */
  title?: string
}

/**
 * 压缩任务服务
 */
export class ArchiveTaskService {
  /**
   * 创建解压缩异步任务
   * @param ctx 文件列表上下文
   * @param fileName 待解压文件名
   * @param formData 表单数据
   * @returns 任务ID
   */
  static async createExtractTask(ctx: FileListContext, fileName: string, formData: CreateExtractTaskFormData): Promise<IdType> {
    return (await SfcUtils.request(API.archive.asyncExtract({
      source: {
        ...ctx.getProtocolParams(),
        path: ctx.path,
        name: fileName
      },
      engineProviderId: formData.engineId,
      archiveEngineProperty: {
        encoding: formData.encoding,
        extension: '.' + formData.format,
        encryptionParam: formData.password ? {
          password: formData.password
        } : undefined
      },
      uid: ctx.uid,
      path: formData.path
    }))).data.data
  }

  /**
   * 创建压缩异步任务
   * @param ctx 文件列表上下文
   * @param sourceNames 待压缩文件名列表
   * @param formData 表单数据
   * @returns 任务ID
   */
  static async createCompressTask(ctx: FileListContext, sourceNames: string[], formData: CreateCompressTaskFormData): Promise<IdType> {
    const targetFileName = formData.name + '.' + formData.format
    return (await SfcUtils.request(API.archive.asyncCompress({
      sourceUid: ctx.uid,
      sourceNames,
      sourcePath: ctx.path as string,
      targetFilePath: StringUtils.appendPath(formData.path, targetFileName),
      targetUid: ctx.uid,
      engineProviderId: formData.engineId,
      engineProperty: {
        encoding: formData.encoding,
        extension: '.' + formData.format,
        compressionLevel: formData.compressionLevel,
        encryptionParam: formData.password ? {
          password: formData.password
        } : undefined
      },
      waitExit: false
    }))).data.data
  }

  /**
   * 打开异步任务信息对话框
   * @param options 配置项
   */
  static openArchiveTaskInfoDialog(options: {
    title: string
    taskId: IdType
    onTaskExit?: (task: any) => Promise<void> | void
  }) {
    let isFinish = false
    const { title, taskId, onTaskExit } = options
    AsyncTaskService.openSimpleAsyncTaskInfoDialog({
      title,
      taskId,
      componentProps: {
        speedFormatter(speed) {
          return StringFormatter.toSize(speed) + '/s'
        }
      },
      async onTaskExit(task) {
        isFinish = true
        if (onTaskExit) {
          await onTaskExit(task)
        }
      },
      async onDialogCancel() {
        if (!isFinish) {
          SfcUtils.loadingDialogTask({ msg: '正在取消任务' }, () => SfcUtils.request(API.asyncTask.interrupt(taskId)))
        }
        return true
      }
    })
  }

  /**
   * 打开解压任务表单并创建任务
   * @param options 选项
   * @returns 用户确认并创建任务后返回true，否则返回false
   */
  static async openExtractDialogAndCreateTask(options: OpenExtractDialogOptions): Promise<boolean> {
    const { ctx, fileName, title = '解压文件' } = options
    return await new Promise<boolean>((resolve) => {
      let resolved = false
      const dialog = SfcUtils.openComponentDialog(ArchiveExtractForm, {
        props: {
          uid: ctx.uid,
          path: ctx.path,
          encoding: 'UTF8',
          filename: fileName,
          archiveEngineList: getContext().feature.value.archiveEngineList
        },
        title,
        async onConfirm() {
          const submitResult = await dialog.getInstAsForm().submit()
          if (!submitResult.success) {
            return false
          }

          const formData = dialog.getInstAsForm().getFormData() as CreateExtractTaskFormData
          const taskId = await ArchiveTaskService.createExtractTask(ctx, fileName, formData)
          ArchiveTaskService.openArchiveTaskInfoDialog({
            title: '解压缩',
            taskId,
            async onTaskExit(task) {
              if (task.status == 2 && formData.path == ctx.path) {
                await ctx.modelHandler.refresh()
              }
            }
          })

          resolved = true
          resolve(true)
          return true
        },
        onCancel() {
          if (!resolved) {
            resolve(false)
            resolved = true
          }
          return true
        }
      })
    })
  }

  /**
   * 打开压缩任务表单并创建任务
   * @param options 选项
   * @returns 用户确认并创建任务后返回true，否则返回false
   */
  static async openCompressDialogAndCreateTask(options: OpenCompressDialogOptions): Promise<boolean> {
    const { ctx, sourceNames, title = '创建压缩任务' } = options
    return await new Promise<boolean>((resolve) => {
      let resolved = false
      const dialog = SfcUtils.openComponentDialog(ArchiveCompressForm, {
        title,
        props: {
          archiveEngineList: getContext().feature.value.archiveEngineList,
          path: ctx.path,
          sourceUid: ctx.uid,
          sourcePath: ctx.path,
          sourceNames
        },
        async onConfirm() {
          const submitResult = await dialog.getInstAsForm().submit()
          if (!submitResult.success) {
            return false
          }

          const formData = dialog.getInstAsForm().getFormData() as CreateCompressTaskFormData
          const taskId = await ArchiveTaskService.createCompressTask(ctx, sourceNames, formData)
          ArchiveTaskService.openArchiveTaskInfoDialog({
            title: '压缩文件',
            taskId,
            async onTaskExit(task) {
              if (task.status == 2 && formData.path == ctx.path) {
                await ctx.modelHandler.refresh()
              }
            }
          })

          resolved = true
          resolve(true)
          return true
        },
        onCancel() {
          if (!resolved) {
            resolve(false)
            resolved = true
          }
          return true
        }
      })
    })
  }
}
