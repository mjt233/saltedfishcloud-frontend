import { reactive } from 'vue'
import type { TeamInfo } from './model'

/**
 * 团队空间插件共享状态
 */
export const teamStore = reactive({
  /**
   * 我的团队列表缓存
   */
  teams: [] as TeamInfo[],
  /**
   * 当前选中的团队
   */
  currentTeam: null as TeamInfo | null
})
