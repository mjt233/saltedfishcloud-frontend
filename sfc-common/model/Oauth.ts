import { AuditModel, BaseUserInfo, IdType, RawUser } from 'sfc-common'

export interface ThirdPartyPlatformUser extends AuditModel {
  /**
   * 第三方平台类型
   */
  platformType: string

  /**
   * 第三方账号用户名
   */
  userName: string

  /**
   * 第三方平台账号绑定的邮箱，可能为空
   */
  email: string

  /**
   * 是否已激活。
   * 需要完成以下步骤才能激活：
   * 1. 已有的咸鱼云账号绑定第三方平台
   * 2. 直接使用第三方平台新登录的账号，作为全新账号注册
   */
  isActive: boolean

  /**
   * 启用状态（1 - 启用， 0 - 停用）
   */
  status: number

  /**
   * 第三方平台账号的唯一标识
   */
  thirdPartyUserId: string

  /**
   * 第三方平台用户头像url
   */
  avatarUrl?: string
}

export interface ThirdPartyAuthPlatform extends AuditModel {
  /**
   * 平台类型
   */
  type: string

  /**
   * 平台名称
   */
  name: string

  /**
   * 平台图标
   */
  icon: string

  /**
   * 是否启用
   */
  isEnable: boolean

  /**
   * 平台参数配置
   */
  config: string

  /**
   * 是否允许注册新用户
   */
  isAllowRegister: true

  /**
   * 服务器后台向第三方平台请求接口调用时，使用的代理id
   */
  proxyId?: IdType

  /**
   * 第三方认证授权地址
   */
  authUrl: string
}

/**
 * 第三方平台认证回调结果
 */
export interface ThirdPartyPlatformCallbackResult {

  /**
   * 认证成功后已关联或即将关联的咸鱼云系统用户。
   * 当该字段有值，但isNewUser为true时，表示一个已登录的用户操作了第三方登录，可能在进行关联操作。前端在确认关联时需要比对是否与页面当前用户一致，不一致时应拒绝操作。
   */
  user: RawUser

  /**
   * 认证成功后的平台用户信息
   */
  platformUser: ThirdPartyPlatformUser

  /**
   * 是否需要转跳URL
   */
  redirectUrl: string

  /**
   * 是否为新用户。新用户则表示首次通过第三方登录登入系统，未关联或创建咸鱼云账号
   */
  isNewUser: boolean

  /**
   * 本次登录操作id
   */
  actionId: string

  /**
   * 产生的新登录token
   */
  newToken: string
}

export interface BindUserParam {
  
  /**
   * 第三方登录操作id
   */
  actionId: string

  /**
   * 自动绑定（根据第三方登录时自动匹配到的用户绑定，邮箱相同 或 已登录状态下进行第三方账号绑定时传入true）
   */
  autoBind?: boolean

  /**
   * 待绑定的用户名/邮箱
   */
  account?: string

  /**
   * 待绑定的用户密码
   */
  password?: string
}

/**
 * 第三方OAuth应用信息
 */
export interface ThirdPartyApp extends AuditModel {
  /**
   * 应用名称
   */
  name: string

  /**
   * 用户确认授权后的回调URL
   */
  callbackUrl: string

  /**
   * 应用介绍
   */
  describeContent?: string

  /**
   * 联系邮箱
   */
  email?: string

  /**
   * 应用图标(URL 支持base64)
   */
  icon?: string

  /**
   * 是否已启用
   */
  isEnabled: boolean
}

/**
 * 第三方OAuth应用密钥凭证
 */
export interface ThirdPartyAppKeyVo {
  
  /**
   * 应用id
   */
  appId: IdType

  /**
   * 客户端密钥
   */
  clientSecret: string

  /**
   * 凭证名称标签
   */
  name: string

  /**
   * 备注
   */
  remark: string

  /**
   * id
   */
  id: IdType

  /**
   * 创建时间
   */
  createAt: string

  /**
   * 更新时间
   */
  updateAt: string

  /**
   * 创建者id
   */
  uid: string
}