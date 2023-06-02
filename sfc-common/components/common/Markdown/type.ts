export interface ImagePatseOption {
  /**
   * 位置，1 - 当前路径，2 - 指定路径
   */
  location: '1' | '2',

  /**
   * 指定路径或前缀
   */
  path: string,

  /**
   * 每次保存前询问
   */
  alwayConfirm: true,

  /**
   * 文件名
   */
  name: string
}

export interface TitleTreeNode {
  title: string

  level: number

  child: TitleTreeNode[]

  el: HTMLElement
}