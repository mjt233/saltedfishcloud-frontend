import { AdminContext } from './type.d'
import AdminOverviewVue from 'sfc-common/views/admin/AdminOverview.vue'
import ClusterManagerVue from 'sfc-common/views/admin/ClusterManager.vue'
import AdminAsyncTaskView from 'sfc-common/views/admin/AdminAsyncTaskView.vue'
import { h } from 'vue'
import { MenuGroup } from './type'
import MonitorView from 'sfc-common/views/admin/MonitorView.vue'
import ThirdPlatformLoginConfigView from 'sfc-common/views/admin/ThirdPlatformLoginConfigView.vue'
import { ChildrenType } from 'sfc-common/utils/SfcUtils/common/DyncMount'
import ThirdPartyAppConfigView from 'sfc-common/views/admin/ThirdPartyAppConfigView.vue'

const cache = {} as {[k:string]: ChildrenType}
export function getDefaultAdminMenu(): MenuGroup<AdminContext>[] {
  return [
    {
      id: 'overview',
      name: '系统总览',
      icon: 'mdi-chart-pie',
      action(ctx) {
        ctx.component = h(AdminOverviewVue)
      },
      items: []
    },
    {
      id: 'cluster',
      name: '集群管理',
      icon: 'mdi-cloud',
      action(ctx) {
        ctx.component = h(ClusterManagerVue)
      },
      items: []
    },
    {
      id: 'monitor',
      name: '运行信息',
      icon: 'mdi-monitor-dashboard',
      action(ctx) {
        ctx.component = h(MonitorView)
      },
      items: []
    },
    {
      id: 'async-task',
      name: '后台任务',
      icon: 'mdi-calendar-text-outline',
      items: [],
      action(ctx) {
        ctx.component = h(AdminAsyncTaskView)
      }
    },
    {
      id: 'third-platform-config',
      name: '第三方平台',
      icon: 'mdi-link-box',
      items: [
        {
          id: 'third-platform-login',
          title: '第三方登录',
          action(ctx) {
            if (!cache[this.id]) {
              cache[this.id] = h(ThirdPlatformLoginConfigView, { adminContext: ctx })
            }
            ctx.component = cache[this.id]
          },
        },
        {
          id: 'third-platform-income',
          title: 'OAuth 应用',
          action(ctx) {
            ctx.component = h(ThirdPartyAppConfigView, { adminContext: ctx  })
          },
        }
      ]
    }
  ]
} 