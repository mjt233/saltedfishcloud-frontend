import { CommonRequest, IdType } from 'sfc-common'

export namespace WebDavApi {
  /**
   * 设置新的WebDAV密码
   * @param uid 用户id
   * @param password 新的WebDAV账号密码
   */
  export function setWebDavPassword(uid: IdType, password: string): CommonRequest {
    return {
      url: '/webDavAuth/setWebDavPassword',
      method: 'POST',
      data: {
        uid,
        password
      }
    }
  }


  /**
   * 获取WebDAV认证配置状态，判断是否已设置密码
   * @param uid 用户id
   */
  export function getWebDavAuthStatus(uid: IdType): CommonRequest<boolean> {
    return {
      url: '/webDavAuth/getAuthStatus',
      method: 'POST',
      data: {
        uid
      }
    }
  }
}