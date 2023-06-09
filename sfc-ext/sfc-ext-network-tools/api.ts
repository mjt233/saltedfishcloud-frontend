import { NetworkInterfaceInfo, WolDevice } from './model'
import { CommonRequest, IdType } from 'sfc-common'
export namespace NwtApi {
  export namespace Wol {
    export function findByUid(uid: IdType): CommonRequest<WolDevice[]> {
      return {
        url: '/nwt/findWolByUid',
        params: { uid }
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
  }

  export function getAllInterface(): CommonRequest<NetworkInterfaceInfo[]> {
    return {
      url: '/nwt/getAllInterface'
    }
  }
}