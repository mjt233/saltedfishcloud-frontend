import { AuditModel } from 'sfc-common'

/**
 * Shell执行参数
 */
export interface ShellExecuteParameter {
  /**
   * 待执行命令
   */
  cmd: string

  /**
   * 程序输出的字符编码
   */
  charset: 'gbk' | 'utf8' | string
  
  /**
  * 使用的交互式shell初始命令
  */
  shell: string

  /**
   * 附加的环境变量
   */
  env: {[key: string]: string}

  /**
   * 超时等待时间，单位秒。超时后进程将被杀死。若小于等于0则表示不处理超时。
   */
  timeout?: number

  /**
   * 工作目录，若为空则默认使用咸鱼云的运行路径
   */
  workDirectory?: string

  /**
   * 会话名称
   */
  name?: string
}

/**
 * Shell执行结果
 */
export interface ShellExecuteResult {
  /**
   * 程序退出代码
   */
  exitCode: number

  /**
   * 执行耗时(ms)
   */
  time: number

  /**
   * 命令执行输出
   */
  output: string
}

/**
 * Shell会话信息
 */
export interface ShellSessionRecord extends AuditModel {
  /**
   * 执行主机
   */
  host: string

  /**
   * 是否运行中
   */
  running: boolean

  /**
   * 会话名称
   */
  name: string
}