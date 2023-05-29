import { IdType } from 'sfc-common/model'
import { ChildrenType } from 'sfc-common/utils/SfcUtils/common/DyncMount'
import { ToRefs, VNode } from 'vue'
import { AppContext } from '../type'

export interface AdminContext {
  /**
   * 当前显示的组件
   */
  component?: ChildrenType,
  /**
   * 当前显示的菜单组
   */
  group?: IdType,
  /**
   * 当前显示的菜单项
   */
  item?: IdType
}


/**
 * 菜单组
 */
export interface MenuGroup<T> {
  /**
   * 唯一标识
   */
  id: string | number,

  /**
   * 菜单组名称
   */
  name: string,

  /**
   * 菜单项列表
   */
  items: MenuItem<T>[],

  /**
   * 当函数返回true时才显示
   */
  renderOn?: (ctx?: T) => boolean,

  /**
   * 菜单组颜色
   */
  color?: string

  /**
   * 菜单组图标
   */
  icon?: string

  /**
   * 整个分类的点击事件，一般在不存在子项的分类中使用（如整个按钮，该按钮下没有子按钮菜单）
   * 取决于具体的组件实现
   */
  action?: (ctx: T) => any
}

/**
 * 菜单项
 */
export interface MenuItem<T> {
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
   * 当函数返回true时才显示
   */
  renderOn?: (ctx: T) => boolean,

  /**
   * 菜单点击动作
   */
  action?: (ctx: T) => any
  [otherKey: string]: any
}

export interface AppMenu {
  backgroundImg: string,
  group: MenuGroup<ToRefs<AppContext>>[]
}


export interface BoxMenuContext {
  /**
   * 当前打开的组件VNode/组件名/或无
   */
  currentComponent?: VNode | string

  /**
   * 当前打开的窗口标题
   */
  title?: string
}