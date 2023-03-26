import { AdminContext } from './type.d'
import AdminOverviewVue from 'sfc-common/views/admin/AdminOverview.vue'
import ClusterManagerVue from 'sfc-common/views/admin/ClusterManager.vue'
import { h } from 'vue'
import { MenuGroup } from './type'
import MonitorView from 'sfc-common/views/admin/MonitorView.vue'
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
    }
    // {
    //   id: 'plugin-manager',
    //   name: '插件管理',
    //   icon: 'mdi-puzzle',
    //   items: []
    // }
  ]
} 