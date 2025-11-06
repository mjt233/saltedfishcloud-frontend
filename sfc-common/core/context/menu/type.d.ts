import { ConfigNodeModel } from './../../../model/Common'
import { IdType } from 'sfc-common/model'
import { ChildrenType } from 'sfc-common/utils/SfcUtils/common/DyncMount'
import { ToRefs, VNode } from 'vue'
import { AppContext } from '../type'

export interface AdminContextConfigChangeEvent {
  source: string
  node: ConfigNodeModel
}

export type NodeMap = {
  [source: string]: {[key: string]: ConfigNodeModel}
}

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

  /**
   * 通知管理端主页配置发生变更
   * @param source 来源来源标识，用来区分是来自哪个页面的变更
   * @param node 发生变更的配置节点信息
   */
  changeConfig(source: string, node: ConfigNodeModel)

  /**
   * 添加配置变更监听器
   * @param source 监听者来源标识，用于后续统一移除监听
   * @param listener   监听回调函数
   */
  addConfigChangeListener(source: string, listener: (event: AdminContextConfigChangeEvent) => void)

  /**
   * 添加一个保存前的处理方法
   * @param source 监听者来源标识，用于后续统一移除监听
   * @param handler 保存前处理回调，若Reject或抛出异常则终止保存流程并自动弹出提示
   */
  addBeforeSaveListener(source: string, handler: () => Promise<any>)

  /**
   * 监听确认保存方法
   * @param source 监听者来源标识，用于后续统一移除监听
   * @param saveHandler 保存处理回调
   */
  addSaveListener(source: string, saveHandler: () => Promise<any>)

  /**
   * 移除所有注册的监听处理回调
   * @param source 监听者
   */
  removeAllListener(source: string)

  /**
   * 获取其他自定义的节点map
   */
  getExtraNodeMap(): NodeMap

  /**
   * 重置其他自定义节点map的值，移除对应的变更状态
   * @param source 来源标识
   */
  resetExtraNodeMap(source: string);
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

export type MenuSubItem<T> = MenuGroup<T>[] | ((ctx: T) => MenuGroup<T>[])

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
  route: string,

  /**
   * 子菜单
   */
  subItems?: MenuSubItem<T>

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