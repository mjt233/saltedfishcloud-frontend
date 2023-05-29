import { DesktopComponentConfig } from './../core/model/Desktop'
import { CommonRequest, IdType } from 'sfc-common/model'
import { DesktopComponent } from 'sfc-common/model/Desktop'
import { useJsonBody } from 'sfc-common/utils/FormUtils/CommonFormUtils'

const desktop = {
  prefix: '/desktop',
  /**
   * 获取所有可配置的组件
   */
  listAllComponent(): CommonRequest<DesktopComponent[]> {
    return {
      url: `${this.prefix}/listAllComponent`
    }
  },
  /**
   * 获取用户配置的组件
   */
  listComponentConfig(uid: IdType): CommonRequest<DesktopComponentConfig[]> {
    return {
      url: `${this.prefix}/listComponentConfig`,
      params: {
        uid
      }
    }
  },
  /**
   * 保存一个桌面组件配置
   */
  saveComponentConfig(config: DesktopComponentConfig): CommonRequest<DesktopComponentConfig> {
    return useJsonBody({
      url: `${this.prefix}/saveComponentConfig`,
      data: config,
      method: 'post'
    })
  },
  /**
   * 删除一个桌面组件配置
   * @param id 配置id
   */
  deleteConfig(id: IdType): CommonRequest {
    return {
      url: `${this.prefix}/deleteConfig`,
      params: {
        id
      },
      method: 'post'
    }
  }
}
export default desktop