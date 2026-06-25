import { LoadingManager } from 'sfc-common/utils'

export function useLoadingManager() {
  const lm = new LoadingManager()
  return {
    loadingManager: lm,
    isLoading: lm.getLoadingRef(),
    beginLoading: lm.beginLoading.bind(lm),
    closeLoading: lm.closeLoading.bind(lm)
  }
}