import { url } from 'inspector'
import { CommonRequest, ConfigNodeModel, JsonResult } from 'sfc-common/model'
import { ThirdPartyAuthPlatform } from 'sfc-common/model/Oauth'
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
  }
}