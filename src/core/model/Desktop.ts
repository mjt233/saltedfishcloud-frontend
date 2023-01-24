import { AuditModel, ConfigNodeModel, IdType } from './Common'

export interface DesktopComponent extends AuditModel {

  /** 组件描述标题 */
  title: string

  /** 描述介绍 */
  describe: string

  /** 组件名称 */
  name: string 
 
  /**  配置原型参数列表，深度为1 */
  config: ConfigNodeModel[]
 
  /** 图标 */
  icon: string
 
  /** 显示顺序 */
  showOrder: number 
}

export interface DesktopComponentConfig extends AuditModel {

  /** 组件标题 */
  title: string 

  /** 组件名称 */
  name: string 
 
  /** 组件配置参数 */
  params: string
 
  /** 图标 */
  icon: string 

  /** 组件类型 */
  type: string
 
  /** 显示顺序 */
  showOrder: number 

  /** 布局占用的单位宽度 */
  width: number

  /** 布局占用的单位宽度 */
  height: number

  /** 备注 */
  remark: string

  /** 是否使用卡片样式 */
  useCard: number

  /** 是否启用 */
  enabled: number
}


