import { AppFeature } from './type.d'
import { Session } from './session'
import { ToRefs } from 'vue'
import { AppMenu } from './menu/type'
import { RouteLocationNormalized, Router } from 'vue-router'
import { EventBus } from './EventBus'

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
  errorMessages: string[]
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
    mainMenu: AppMenu
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

  feature: AppFeature,

  /**
   * 路由信息
   */
  routeInfo: RouteInfo,
  [otherKey: string]: any
}
