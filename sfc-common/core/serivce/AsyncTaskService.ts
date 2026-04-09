import SimpleAsyncTaskInfo from 'sfc-common/components/common/AsyncTask/SimpleAsyncTaskInfo.vue'
import { IdType } from 'sfc-common/model'
import { AsyncTaskRecord } from 'sfc-common/model/AsyncTaskRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { ExtractPropTypes, mergeProps } from 'vue'

export interface AsyncTaskInfoOptions {
  title: string

  taskId: IdType

  componentProps?: InstanceType<typeof SimpleAsyncTaskInfo>['$props']

  onDialogCancel?(): boolean | Promise<boolean>

  onTaskExit?(task: AsyncTaskRecord): void
}

export namespace AsyncTaskService {
  export function openSimpleAsyncTaskInfoDialog(opt: AsyncTaskInfoOptions) {
    return SfcUtils.openComponentDialog(SimpleAsyncTaskInfo, {
      props: mergeProps({
        taskId: opt.taskId,
        async onTaskExit(task: AsyncTaskRecord) {
          opt.onTaskExit?.(task)
        }
      }, opt.componentProps || {}),
      onCancel: opt.onDialogCancel,
      persistent: true,
      fullscreen: false,
      showConfirm: false,
      title: '复制文件'
    })
  }
}