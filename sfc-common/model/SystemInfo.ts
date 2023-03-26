/**
 * 系统信息
 */
export interface SystemInfo {
  /**
   * 每个cpu核心平均负载
   */
  cpuLoad: number

  /**
   * 总内存
   */
  totalMemory: string

  /**
   * 已用内存
   */
  usedMemory: string

  /**
   * 内存使用率
   */
  memoryUsedRate: string

  /**
   * 操作系统
   */
  os?: string

  /**
   * cpu名称
   */
  cpu?: string

  /**
   * cpu逻辑核心数
   */
  cpuLogicCount?: number

  /**
   * cpu物理核心数
   */
  cpuPhysicalCount?: number
}
