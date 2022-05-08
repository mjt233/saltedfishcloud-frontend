import * as VueRouter from 'vue-router'
import Index from '@/views/common/Index.vue'
import CommonWelcome from '@/views/common/Welcome.vue'


const commonRoute: VueRouter.RouteRecordRaw  =  {
  path: '/',
  component: Index,
  children: [
    {
      path: '/',
      component: CommonWelcome
    },
    {
      path: '/**',
      component: CommonWelcome
    },
    {
      path: '/public',
      component: () => import('@/views/common/PublicDisk.vue')
    },
    {
      path: '/private',
      component: () => import('@/views/common/PrivateDisk.vue')
    },
    {
      path: '/login',
      component: () => import('@/views/common/LoginView.vue')
    }
  ]
}
export default commonRoute