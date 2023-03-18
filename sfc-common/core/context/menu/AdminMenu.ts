import { AdminContext } from './type.d'
import AdminOverviewVue from 'sfc-common/views/admin/AdminOverview.vue'
import { h } from 'vue'
import { MenuGroup } from './type'
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
    // {
    //   id: 'plugin-manager',
    //   name: '插件管理',
    //   icon: 'mdi-puzzle',
    //   items: []
    // }
  ]
} 