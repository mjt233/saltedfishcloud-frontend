import { AppMenu } from './menu/type'
export interface Session {
  token: string,
  user: User
}

export type UserRole = 'admin' | 'normal' | 'public'
export interface User {
  uid: number,
  name: string,
  role: UserRole
}

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
  mainMenu: AppMenu,

  /**
   * 默认头像src属性
   */
  defaultAvatar: string,

  /**
   * 用户会话属性
   */
  session: Session,
  [otherKey: string]: any
}
