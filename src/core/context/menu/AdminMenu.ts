import { AdminContext } from './type.d'
import AdminOverviewVue from '@/views/admin/AdminOverview.vue'
import { h } from 'vue'
import { MenuGroup } from './type'
export function getDefaultAdminMenu(): MenuGroup<AdminContext>[] {
  return [
    {
      id: 'general',
      name: '常规',
      items: [
        {
          id: 'overview',
          title: '系统总览',
          icon: 'mdi-chart-pie',
          action(ctx) {
            ctx.component = h(AdminOverviewVue)
          }
        },
        {
          id: 'user',
          title: '用户管理',
          icon: 'mdi-account-multiple',
          action(ctx) {
            ctx.component = h('div', null, '用户管理')
          }
        }
      ]
    },
    {
      id: 'demo',
      name: '独立菜单',
      items: [],
      icon: 'mdi-package'
    }
  ]
} 