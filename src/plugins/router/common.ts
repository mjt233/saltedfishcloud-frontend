import * as VueRouter from 'vue-router'
import Index from '@/views/common/Index.vue'
import CommonWelcome from '@/views/common/Welcome.vue'


const commonRoute: VueRouter.RouteRecordRaw  =  {
  path: '/',
  component: Index,
  children: [
    {
      path: '/',
      component: CommonWelcome,
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/**',
      component: CommonWelcome,
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/public',
      component: () => import('@/views/common/PublicDisk.vue'),
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/private',
      component: () => import('@/views/common/PrivateDisk.vue')
    },
    {
      path: '/login',
      component: () => import('@/views/common/LoginView.vue'),
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/personalCenter',
      component: () => import('@/views/common/PersonalCenter.vue')
    }
  ]
}
export default commonRoute