import { BindUserParam, ThirdPartyPlatformUser } from './../model/Oauth'
import { CommonRequest, ConfigNodeModel, IdType, JsonResult, RawUser } from 'sfc-common/model'
import { ThirdPartyAuthPlatform, ThirdPartyPlatformCallbackResult } from 'sfc-common/model/Oauth'
import { useJsonBody } from 'sfc-common/utils'

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
  bindUser(param: BindUserParam): CommonRequest<RawUser & {token: string}> {
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
  }
}