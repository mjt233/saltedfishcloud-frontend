import { CommonRequest, ClusterNodeInfo } from 'sfc-common/model'

const cluster = {
  prefix: '/cluster',
  listNodes():CommonRequest<ClusterNodeInfo[]> {
    return {
      url: `${this.prefix}/listNodes`
    }
  }
}

export default cluster