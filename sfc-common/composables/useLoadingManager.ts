import { LoadingManager } from 'sfc-common/utils'

export function useLoadingManager() {
  const lm = new LoadingManager()
  return {
    loadingManager: lm,
    isLoading: lm.getLoadingRef(),
  }
}