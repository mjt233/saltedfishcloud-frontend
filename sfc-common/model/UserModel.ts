import { IdType } from './Common'
/**
 * 用户角色类型
 */
export type UserRole = 'admin' | 'normal' | 'public'

/**
 * 用户类型常量
 */
export namespace UserTypeConstans {
  export const ADMIN = 1
  export const NORMAL = 0
}

/**
 * 用户类型值
 */
export type UserType = 1|0

/**
 * 基础用户信息（不包含敏感数据）
 */
export interface BaseUserInfo {
  /**
   * 用户id
   */
  id: IdType

  /**
   * 用户名
   */
  user: string
}

/**
 * 服务器响应的原始用户对象
 */
export interface RawUser extends BaseUserInfo {

  /**
   * 用户类型，1 - 管理员，0 - 普通用户
   * 见 {@link UserTypeConstans }和 {@link UserType}
   */
  type: UserType,

  /**
   * 该用户的私人存储空间配额大小（GiB）
   */
  quota: number,

  /**
   * 绑定的邮箱
   */
  email?: string
}


/**
 * 通过AppContext维护的Session会话上下文中的用户对象
 */
export interface SessionUser {
  /**
   * 用户id
   */
  id: number,

  /**
   * 用户名
   */
  name: string,

  /**
   * 用户角色类型
   */
  role: UserRole,

  /**
   * 用户绑定的邮箱
   */
  email?: string,

  /**
   * 该用户的私人存储空间配额大小（GiB）
   */
  quota: number
}