import { AppMenu } from './menu/type'
/**
 * 全局上下文属性
 */
export interface AppContext {
  /**
   * 标题
   */
  appTitle: string,

  /**
   * 系统主题
   */
  theme: string,

  /**
   * 用户界面主菜单
   */
  menu: AppMenu,
  [otherKey: string]: any
}
