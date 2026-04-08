import { IdType } from 'sfc-common/model'
import { AsyncTaskRecord } from 'sfc-common/model/AsyncTaskRecord'

export interface AsyncTaskInfoEmits {
  (e: 'task-exit', task: AsyncTaskRecord): void
}