import { Upnp } from './model'
import { NetworkInterfaceInfo, WolDevice } from './model/common'
import { CommonRequest, IdType } from 'sfc-common'
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
     */
    export function listUPnP(): CommonRequest<Upnp.UpnpDevice[]> {
      return {
        url: '/nwt/listUPnP'
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
  }
}