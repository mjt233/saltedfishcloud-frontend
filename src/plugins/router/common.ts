import * as VueRouter from 'vue-router'
import Index from '@/views/common/IndexView.vue'
import CommonWelcome from '@/views/common/WelcomeView.vue'


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
    },
    {
      path: '/register',
      component: () => import('@/views/common/RegisterView.vue')
    }
  ]
}
export default commonRoute