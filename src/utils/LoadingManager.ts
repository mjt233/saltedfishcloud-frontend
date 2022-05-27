import { Ref, ref } from 'vue'

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