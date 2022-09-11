export interface NodeInfo {
  /**
   * 节点名称
   */ 
  name: string

  /**
   * 节点所属用户id
   */
  uid: number

  /**
   * 节点id
   */
  id: string

  /**
   * 父节点id
   */
  parent: string

  /**
   * 是否为根节点
   */
  rootNode: boolean
}