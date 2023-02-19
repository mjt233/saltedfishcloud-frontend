import axios from 'axios'
import { Canceler } from 'axios'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { ApiRequest } from 'sfc-common/model'
let cancel: Canceler
export async function loadMDToHtml(url: string) {
  if (cancel != null) {
    cancel('cancel')
  }
  const ret = await SfcUtils.request({
    url,
    cancelToken: new axios.CancelToken(c => cancel = c)
  } as ApiRequest<string>)
  return ret.request.responseText
}