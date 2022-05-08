
/**
 * 菜单项
 */
export interface MenuItem {
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
  [otherKey: string]: any
}

export interface AppMenu {
  backgroundImg: string,
  items: MenuItem[]
}
