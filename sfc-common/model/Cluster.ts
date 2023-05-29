export interface ClusterNodeInfo {
  /**
   * 实例标识
   */
  id: string

  /**
   * 主机名
   */
  host: string

  /**
   * ip地址
   */
  ip: string

  /**
   * cpu数
   */
  cpu: number
  
  /**
   * 内存容量
   */
  memory: string

  /**
   * 临时存储空间大小
   */
  tempSpace: string
}