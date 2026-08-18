import type { IdType } from 'sfc-common'

/**
 * 团队角色
 * 权限递进：READ < WRITE < MANAGE < OWNER
 */
export enum TeamRole {
  /** 只读成员 */
  READ = 1,
  /** 读写成员 */
  WRITE = 2,
  /** 团队管理员 */
  MANAGE = 3,
  /** 团队所有者 */
  OWNER = 4
}

/**
 * 团队信息
 */
export interface TeamInfo {
  /** 团队 id（即团队文件空间 uid） */
  id: IdType
  /** 团队名称 */
  name: string
  /** 团队描述 */
  description?: string
  /** 所有者用户 id */
  ownerUid: IdType
  /** 当前用户角色（1-4） */
  myRole?: number
  /** 正常成员数量 */
  memberCount?: number
}

/**
 * 团队成员（已注册）
 */
export interface MemberItem {
  /** 成员用户 id */
  uid: IdType
  /** 用户名 */
  username?: string
  /** 邮箱 */
  email?: string
  /** 角色（1-4） */
  role: number
  /** 入团时间戳 */
  joinAt?: number
}

/**
 * 待注册成员（邀请）
 */
export interface InviteItem {
  /** 邀请 id */
  inviteId: IdType
  /** 预填用户名 */
  username?: string
  /** 预填邮箱 */
  email?: string
  /** 接受后角色（1-3） */
  role: number
  /** 邀请令牌 */
  token: string
  /** 过期时间戳 */
  expireAt?: number
  /** 创建时间戳 */
  createAt?: number
  /** 是否已过期 */
  expired?: boolean
  /** 状态：1 待接受 2 已接受 3 已撤销 */
  status?: number
}

/**
 * 分页内容
 */
export interface PageContent<T> {
  content: T[]
  totalCount: number
  totalPage: number
}

/**
 * 团队成员列表（正常成员分页 + 待注册成员）
 */
export interface TeamMemberList {
  members: PageContent<MemberItem>
  invites: InviteItem[]
}

/**
 * 团队详情
 */
export interface TeamDetail {
  team: TeamInfo
  memberList: TeamMemberList
  /** 当前用户角色 */
  myRole: number
}

/**
 * 邀请公开信息（受邀页展示）
 */
export interface InviteInfo {
  teamName?: string
  inviterName?: string
  username?: string
  email?: string
  /** 是否过期 */
  expired: boolean
  /** 是否仍有效 */
  valid: boolean
}

/**
 * 用户搜索结果
 */
export interface UserSearchItem {
  uid: IdType
  username: string
  email?: string
}
