import { useJsonBody, type ApiRequest, type CommonRequest, type IdType } from 'sfc-common'
import type { InviteInfo, InviteItem, TeamDetail, TeamInfo, TeamMemberList, UserSearchItem } from './model'

/**
 * 团队空间后端接口封装
 * 路径前缀 /api/team，全部经 SfcUtils.request 发送
 */
const TeamApi = {
  prefix: '/team',
  featurePrefix: 'team',
  feature: {
    isEnabled: 'isEnabled'
  },
  /**
   * 创建团队
   * @param data 创建请求
   */
  create(data: { name: string, description?: string }): CommonRequest<TeamInfo> {
    return useJsonBody({ url: `${this.prefix}/create`, method: 'post', data })
  },
  /**
   * 修改团队信息
   * @param data 修改请求
   */
  updateInfo(data: { teamId: IdType, name?: string, description?: string }): CommonRequest<TeamInfo> {
    return useJsonBody({ url: `${this.prefix}/updateInfo`, method: 'post', data })
  },
  /**
   * 解散团队
   * @param teamId 团队 id
   */
  deleteTeam(teamId: IdType): CommonRequest {
    return useJsonBody({ url: `${this.prefix}/delete`, method: 'post', data: { teamId } })
  },
  /**
   * 查询我的团队列表（管理员可查全部）
   * @param all 是否查全部
   */
  list(all = false): CommonRequest<TeamInfo[]> {
    return { url: `${this.prefix}/list`, method: 'get', params: { all } }
  },
  /**
   * 查询团队详情
   * @param teamId 团队 id
   */
  detail(teamId: IdType): CommonRequest<TeamDetail> {
    return { url: `${this.prefix}/detail`, method: 'get', params: { teamId, page: 0, size: 100 } }
  },
  /**
   * 查询成员列表（含待注册成员）
   * @param teamId 团队 id
   */
  memberList(teamId: IdType): CommonRequest<TeamMemberList> {
    return { url: `${this.prefix}/memberList`, method: 'get', params: { teamId, page: 0, size: 100 } }
  },
  /**
   * 退出团队
   * @param teamId 团队 id
   */
  quit(teamId: IdType): CommonRequest {
    return useJsonBody({ url: `${this.prefix}/quit`, method: 'post', data: { teamId } })
  },
  /**
   * 转移所有权
   * @param teamId 团队 id
   * @param targetUid 目标用户 id
   */
  transferOwner(teamId: IdType, targetUid: IdType): CommonRequest {
    return useJsonBody({ url: `${this.prefix}/transferOwner`, method: 'post', data: { teamId, targetUid } })
  },
  /**
   * 添加成员
   * @param teamId 团队 id
   * @param uid 用户 id
   * @param role 角色
   */
  addMember(teamId: IdType, uid: IdType, role: number): CommonRequest {
    return useJsonBody({ url: `${this.prefix}/addMember`, method: 'post', data: { teamId, uid, role } })
  },
  /**
   * 移除成员
   * @param teamId 团队 id
   * @param uid 用户 id
   */
  removeMember(teamId: IdType, uid: IdType): CommonRequest {
    return useJsonBody({ url: `${this.prefix}/removeMember`, method: 'post', data: { teamId, uid } })
  },
  /**
   * 修改成员角色
   * @param teamId 团队 id
   * @param uid 用户 id
   * @param role 新角色
   */
  updateMemberRole(teamId: IdType, uid: IdType, role: number): CommonRequest {
    return useJsonBody({ url: `${this.prefix}/updateMemberRole`, method: 'post', data: { teamId, uid, role } })
  },
  /**
   * 搜索用户（用户名/邮箱）
   * @param keyword 关键词
   */
  searchUser(keyword: string): CommonRequest<UserSearchItem[]> {
    return { url: `${this.prefix}/searchUser`, method: 'get', params: { keyword } }
  },
  /**
   * 创建邀请
   * @param data 创建请求
   */
  createInvite(data: { teamId: IdType, username?: string, email?: string, role: number }): CommonRequest<InviteItem> {
    return useJsonBody({ url: `${this.prefix}/createInvite`, method: 'post', data })
  },
  /**
   * 获取邀请链接
   * @param teamId 团队 id
   * @param inviteId 邀请 id
   */
  getInviteLink(teamId: IdType, inviteId: IdType): CommonRequest<InviteItem> {
    return { url: `${this.prefix}/getInviteLink`, method: 'get', params: { teamId, inviteId } }
  },
  /**
   * 撤销邀请
   * @param teamId 团队 id
   * @param inviteId 邀请 id
   */
  revokeInvite(teamId: IdType, inviteId: IdType): CommonRequest {
    return useJsonBody({ url: `${this.prefix}/revokeInvite`, method: 'post', data: { teamId, inviteId } })
  },
  /**
   * 重新生成邀请链接
   * @param teamId 团队 id
   * @param inviteId 邀请 id
   */
  regenerateInvite(teamId: IdType, inviteId: IdType): CommonRequest<InviteItem> {
    return useJsonBody({ url: `${this.prefix}/regenerateInvite`, method: 'post', data: { teamId, inviteId } })
  },
  /**
   * 查询邀请公开信息（免登录）
   * @param token 邀请令牌
   */
  inviteInfo(token: string): CommonRequest<InviteInfo> {
    return { url: `${this.prefix}/inviteInfo`, method: 'get', params: { token } }
  },
  /**
   * 接受邀请（免登录）：注册账号并加入团队
   * @param data 接受请求
   */
  acceptInvite(data: { token: string, username?: string, password: string }): ApiRequest<IdType> {
    return useJsonBody({ url: `${this.prefix}/acceptInvite`, method: 'post', data })
  }
}

export default TeamApi
