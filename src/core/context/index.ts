/**
 * 菜单项
 */
interface MenuItem {
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

/**
 * 全局上下文属性
 */
interface AppContext {
  /**
   * 用户界面主菜单
   */
  commonMenu: MenuItem[],

  /**
   * 系统主题
   */
  theme: string,
  [otherKey: string]: any
}

const context: AppContext = {
  theme: 'default',
  commonMenu: [
    {
      isSubHeader: true,
      title: '主功能'
    },
    {
      title: '公共网盘',
      route: '/public',
      icon: 'mdi-folder'
    },
    {
      title: '私人网盘',
      route: '/private',
      icon: 'mdi-lock'
    },
    {
      title: '登录',
      route: '/login',
      icon: 'mdi-lock'
    }
  ]
}

export {
  context
}
export type {
  MenuItem
}