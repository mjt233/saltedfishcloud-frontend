import { AuditModel } from 'sfc-common'

/**
 * 站点访问方式：1 - 按主机名匹配，2 - 按路径匹配
 */
export type AccessWay = 1 | 2;

export interface StaticPublishProperty {
  /**
   * 服务端口
   */
  serverPort: number

  /**
   * 服务协议
   */
  protocol: string

  /**
   * 是否只允许管理员发布站点
   */
  isOnlyAdminPublish: boolean

  /**
   * 按系统主机名匹配站点的主机后缀
   */
  byHostSuffix: string

  /**
   * 按用户路径匹配站点的主机后缀
   */
  byPathSuffix: string
}

/**
 * 静态资源站点发布信息
 */
export interface StaticPublishRecord extends AuditModel {
  
  /**
   * 部署名（站点名）
   */
  siteName: string

  /**
   * 发布者用户名
   */
  username: string

  /**
   * 站点访问方式：1 - 按主机名匹配，2 - 按路径匹配
   */
  accessWay: AccessWay

  /**
   * 发布目录路径
   */
  path: string

  /**
   * 是否开启index.html主页
   */
  isEnableIndex: boolean

  /**
   * 是否开启目录访问列出文件列表
   */
  isEnableFileList: boolean

  /**
   * 是否需要登录
   */
  isNeedLogin: boolean

  /**
   * 自定义登录用户名
   */
  loginUsername?: string | null

  /**
   * 自定义登录密码
   */
  loginPassword?: string | null
}