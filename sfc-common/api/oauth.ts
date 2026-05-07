import { PageableRequest } from './../model/ApiRequest'
import { BindUserParam, ThirdPartyApp, ThirdPartyAppAuthorization, ThirdPartyAppKeyVo, ThirdPartyAppUserAuthorizationVo, ThirdPartyPlatformUser, UserAuthorizeResult } from './../model/Oauth'
import { CommonPageInfo, CommonRequest, ConfigNodeModel, IdType, JsonResult, UserPrincipal } from 'sfc-common/model'
import { ThirdPartyAuthPlatform, ThirdPartyPlatformCallbackResult } from 'sfc-common/model/Oauth'
import { useJsonBody } from 'sfc-common/utils/FormUtils/CommonFormUtils'

export default {
  prefix: 'oauth',
  /**
   * 管理员接口-获取第三方平台配置节点，用于构建表单视图
   */
  getThirdPartyPlatformConfig(): CommonRequest<{ [platform:string] :ConfigNodeModel[]}> {
    return {
      url: `${this.prefix}/getThirdPartyPlatformConfig`
    }
  },
  /**
   * 管理员接口-获取第三方平台配置参数值
   */
  getThirdPartyPlatformConfigValue(): CommonRequest<{ [platform:string]: ThirdPartyAuthPlatform }> {
    return {
      url: `${this.prefix}/getThirdPartyPlatformConfigValue`
    }
  },
  /**
   * 保存第三方平台配置参数
   * @param platformList 待保存的第三方平台配置对象
   */
  saveThirdPartyPlatformConfigValue(platformList: ThirdPartyAuthPlatform[]): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/saveThirdPartyPlatformConfigValue`,
      data: platformList,
      method: 'post'
    })
  },
  /**
   * 列出系统当前可用的第三方平台
   */
  listPlatform(): CommonRequest<ThirdPartyAuthPlatform[]> {
    return {
      url: `${this.prefix}/listPlatform`
    }
  },
  /**
   * 使用第三方登录创建新账号
   * @param actionId 第三方登录的操作动作id
   * @returns 创建成功后的新token
   */
  createUser(actionId: string): CommonRequest<ThirdPartyPlatformCallbackResult> {
    return {
      url: `${this.prefix}/createUser`,
      params: {
        actionId
      }
    }
  },
  bindUser(param: BindUserParam): CommonRequest<UserPrincipal & {token: string}> {
    return useJsonBody({
      url: `${this.prefix}/bindUser`,
      method: 'post',
      data: param
    })
  },
  listAssocPlatformUser(uid: IdType): CommonRequest<ThirdPartyPlatformUser[]> {
    return {
      url: `${this.prefix}/listAssocPlatformUser`,
      params: {uid}
    }
  },
  /**
   * 新增/保存第三方OAuth应用信息
   * @param thirdPartyApp 第三方OAuth应用信息
   * @returns 
   */
  saveThirdPartyApp(thirdPartyApp: ThirdPartyApp): CommonRequest<ThirdPartyApp> {
    return useJsonBody({
      url: `${this.prefix}/saveThirdPartyApp`,
      method: 'post',
      data: thirdPartyApp
    })
  },
  /**
   * 列出第三方OAuth应用信息
   * @param pageableRequest 分页参数
   * @returns 
   */
  listThirdPartyApp(pageableRequest: PageableRequest): CommonRequest<CommonPageInfo<ThirdPartyApp>> {
    return {
      url: `${this.prefix}/listThirdPartyApp`,
      params: pageableRequest
    }
  },
  /**
   * 批量删除第三方OAuth应用信息
   * @param ids 待删除的OAuth应用id
   * @returns 
   */
  deleteThirdPartyApp(ids: IdType[]): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/deleteThirdPartyApp`,
      method: 'post',
      data: ids
    })
  },
  /**
   * 为第三方OAuth应用生成新的密钥
   * @param appId 待生成密钥的OAuth应用id
   * @param name 密钥名称
   * @returns 新的密钥信息，密钥原文有且仅有一次机会在该接口中查看
   */
  generateNewOauthAppKey(appId: IdType, name?: string): CommonRequest<ThirdPartyAppKeyVo> {
    const params = {
      appId
    } as any
    if (name) {
      params.name = name
    }
    return {
      url: `${this.prefix}/generateNewOauthAppKey`,
      params: params
    }
  },
  /**
   * 列出第三方OAuth应用密钥
   * @param appId 待列出密钥的OAuth应用id
   * @returns 密钥列表
   */
  listOAuthAppKey(appId: IdType): CommonRequest<ThirdPartyAppKeyVo[]> {
    return {
      url: `${this.prefix}/listOAuthAppKey`,
      params: {
        appId
      }
    }
  },
  /**
   * 删除第三方OAuth应用密钥
   * @param keyIds 待删除密钥的id
   * @returns 
   */
  deleteOAuthAppKey(keyIds: IdType[]): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/deleteOAuthAppKey`,
      data: keyIds,
      method: 'post'
    })
  },
  /**
   * 修改第三方OAuth应用密钥信息，只能修改名称和描述
   * @param keyVo 待修改密钥信息
   */
  changeOAuthAppKey(keyVo: ThirdPartyAppKeyVo): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/changeOAuthAppKey`,
      method: 'post',
      data: keyVo
    })
  },
  /**
   * 获取当前用户在第三方OAuth应用的授权信息
   * @param appId 第三方OAuth应用id
   */
  getUserAuthorization(appId: IdType): CommonRequest<ThirdPartyAppUserAuthorizationVo> {
    return {
      url: `${this.prefix}/getUserAuthorization`,
      params: {
        appId
      }
    }
  },
  /**
   * 当前用户确认授权第三方应用
   * @param appId 第三方OAuth应用id
   * @param scope 授权范围（增量授权，多个权限使用空格分割）
   */
  authorize(appId: IdType, scope: IdType): CommonRequest<UserAuthorizeResult> {
    return {
      url: `${this.prefix}/authorize`,
      params: {
        appId, scope
      }
    }
  },
  /**
   * 获取用户已关联的第三方平台
   * @param uid 用户id
   */
  listUserAuthentication(uid: IdType): CommonRequest<ThirdPartyAppAuthorization[]> {
    return {
      url: `${this.prefix}/listUserAuthentication`,
      params: {
        uid
      }
    }
  },
  /**
   * 撤销用户对第三方OAuth应用的授权
   * @param appId 第三方OAuth应用id
   * @param uid 用户id
   */
  revoke(appId: IdType, uid: IdType): CommonRequest {
    return {
      url: `${this.prefix}/revoke`,
      params: {
        appId, uid
      },
      method: 'post'
    }
  }
}