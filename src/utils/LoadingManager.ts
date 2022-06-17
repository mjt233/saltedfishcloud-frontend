import { Ref, ref } from 'vue'
type PromiseExecutor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void
export class LoadingControlPromise<T> extends Promise<T> {
  public autoLoading: boolean
  constructor(executor: PromiseExecutor<T>, autoLoading: boolean) {
    super(executor)
    this.autoLoading = autoLoading
  }
}
export class LoadingManager {
  private loading: Ref<boolean>
  private count = 0
  constructor() {
    this.loading = ref(false)
  }

  public beginLoading() {
    this.count++
    this.update()
  }

  public closeLoading() {
    this.count--
    this.update()
  }

  private update() {
    this.loading.value = this.count > 0
  }

  public getLoadingRef() {
    return this.loading
  }
}