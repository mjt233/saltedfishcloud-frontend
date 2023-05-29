import { SfcUtils } from './SfcUtils'

export type TaskRunner<T> = () => Promise<T>
export interface AsyncTaskQueue<T> {
  addTask: (generator: TaskRunner<T>) => void
}

export function buildAsyncTaskQueue<T>(): AsyncTaskQueue<T> {
  const queue: TaskRunner<T>[] = []
  const execute = async() => {
    while(queue.length) {
      try {
        const runner = queue[0] as TaskRunner<T>
        await runner()
      } catch(err) {
        console.log(err)
        SfcUtils.snackbar(err)
      } finally {
        queue.shift()
      }
      
    }
  }
  return {
    addTask(runner) {
      queue.push(runner)
      if (queue.length == 1) {
        execute()
      }
    }
  }
}