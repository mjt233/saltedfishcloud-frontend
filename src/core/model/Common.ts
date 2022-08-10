/**
 * 下拉选择选项
 */
export interface SelectOption {
  title: string,
  value: any,
  action?: () => any
}


/**
 * 数据ID类型
 */
export type IdType = number | string

/**
 * 配置节点类型
 */
export type ConfigNodeInputType = 'switch' | 'select' | 'multi-select' | 'ratio' | 'checkbox' | 'text' | 'form'

/**
 * 属性配置节点
 */
export interface ConfigNode {
  /* 节点名 */
  name: string

  /* 节点值 */
  value: string

  /* 描述 */
  descript?: string

  /* 数据编辑输入方式 */
  inputType: ConfigNodeInputType

  /* 可选项，用于为select、multi-select、ratio和checkbox类型提供可选值 */
  options?: SelectOption[]

  /* 子节点，用于为form表单类型提供子表单数据，子表单的值为json格式化字符串 */
  subNode?: ConfigNodeGroup[]

  /* 图标 */
  icon?: string
}

export interface ConfigNodeGroup {
  /* 配置组名称 */
  name: string

  /* 配置组 */
  nodes: ConfigNode[]
}