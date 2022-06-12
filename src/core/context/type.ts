import { Session } from './session'
import { AppMenu, MenuGroup } from './menu/type'
import { RouteLocationNormalized, Router } from 'vue-router'
import { EventBus } from './EventBus'
import { FileListContext, SystemFeature } from '../model'

interface RouteInfo {
  /**
   * 当前路由
   */
  curr?: RouteLocationNormalized,
  /**
   * 上一路由
   */
  prev?: RouteLocationNormalized,

  /**
   * 路由器
   */
  router?: Router
}

export interface ValidateErrorMessage {
  id: number,
  errorMessages: string
}

export interface ValidateResult {
  valid: boolean,
  errorMessages: ValidateErrorMessage[]
}

export interface AppFeature {
  enableRegCode: boolean,
  enableEmailReg: boolean,
  [otherKey: string]: any
}

export interface VisiableWindows {
  uploadList: boolean
  [otherKey: string]: boolean
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
   * 当前系统主题
   */
  theme: string,

  /**
   * 当前系统主题（原始，不受黑暗模式影响）
   */
  originTheme: string,

  /**
   * 菜单
   */
  menu: {
    /**
     * 用户界面主菜单
     */
    mainMenu: AppMenu,

    fileListMenu: MenuGroup<FileListContext>[]
  }

  /**
   * 默认头像src属性
   */
  defaultAvatar: string,

  /**
   * 用户会话属性
   */
  session: Session,

  /**
   * 事件总线
   */
  eventBus: EventBus,

  feature: SystemFeature,

  /**
   * 路由信息
   */
  routeInfo: RouteInfo,

  visiableWindows: VisiableWindows
  [otherKey: string]: any
}
