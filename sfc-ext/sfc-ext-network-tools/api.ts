import { Upnp } from './model'
import { NetworkInterfaceInfo, WolDevice } from './model/common'
import { CommonRequest, IdType, useJsonBody } from 'sfc-common'
export namespace NwtApi {
  export namespace Wol {
    export function findByUid(uid: IdType, checkOnline?: boolean): CommonRequest<WolDevice[]> {
      return {
        url: '/nwt/findWolByUid',
        params: { uid, checkOnline: checkOnline ? true : false }
      }
    }

    export function saveWolDevice(device: WolDevice): CommonRequest {
      return {
        url: '/nwt/saveWolDevice',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: device
      }
    }

    export function wakeWolDevice(deviceId: IdType): CommonRequest {
      return {
        url: '/nwt/wakeWolDevice',
        params: { id: deviceId }
      }
    }

    export function batchDelete(ids: IdType[]): CommonRequest {
      return {
        url: '/nwt/batchDeleteWol',
        data: ids,
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    }
  }

  export function getAllInterface(): CommonRequest<NetworkInterfaceInfo[]> {
    return {
      url: '/nwt/getAllInterface'
    }
  }


  export namespace UPnP {
    /**
     * 获取系统已发现的UPnP设备列表
     * @param isForceCheckAlive 是否强制检查设备在线情况
     */
    export function listUPnP(isForceCheckAlive?: boolean): CommonRequest<Upnp.UpnpDevice[]> {
      return {
        url: '/nwt/listUPnP',
        params: { forceCheckAlive: isForceCheckAlive || false }
      }
    }

    /**
     * 获取UPnP设备图标
     * @param usn UPnP设备USN
     * @param index 图标索引
     */
    export function getUPnPIcon(usn: string, index: number) {
      return {
        url: `/nwt/getUPnPIcon?usn=${usn}&index=${index}`
      }
    }

    /**
     * 获取UPnP设备服务描述
     * @param usn UPnP设备UDN/USN
     * @param serviceType 服务类型，如: urn:schemas-upnp-org:service:AVTransport:1
     */
    export function getUpnpServiceScpd(usn: string, serviceType: string): CommonRequest<Upnp.Scpd> {
      return {
        url: '/nwt/getUpnpServiceScpd',
        params: {
          usn,
          serviceType
        }
      }
    }

    /**
     * 发起 UPnP 服务方法调用
     * @param param UPnP调用参数
     */
    export function invokeUpnpService(param: Upnp.ServiceActionInvokeParam): CommonRequest<Upnp.SimpleHttpResponse> {
      return useJsonBody({
        url: '/nwt/invokeUpnpService',
        method: 'post',
        data: param
      })
    }

    /**
     * 将多媒体内容（图片、音频、视频）投屏到指定设备
     * @param usn UPnP设备UDN/USN
     * @param serviceType 服务类型，如: urn:schemas-upnp-org:service:AVTransport:1
     */
    export function castMedia(usn: string, uri: string): CommonRequest<void> {
      return {
        url: '/nwt/castMedia',
        params: {
          usn, uri
        },
        method: 'post'
      }
    }
  }
}