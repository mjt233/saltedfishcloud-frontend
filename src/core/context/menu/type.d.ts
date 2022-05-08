import { ToRefs } from 'vue'
import { AppContext } from '../type'

/**
 * 菜单项
 */
export interface MenuItem {
  /**
   * 唯一标识
   */
  id: string | number,

  /**
   * 菜单标题
   */
  title: string,

  /**
   * 菜单图标
   */
  icon?: string,

  /**
   * 菜单转跳路由
   */
  route?: string,

  /**
   * 是否为副标题
   */
  isSubHeader?: boolean,

  /**
   * 当函数返回true时才显示
   */
  renderOn?: (ctx: ToRefs<AppContext>) => boolean
  [otherKey: string]: any
}

export interface AppMenu {
  backgroundImg: string,
  items: MenuItem[]
}
