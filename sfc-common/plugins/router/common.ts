import * as VueRouter from 'vue-router'
import Index from 'sfc-common/views/common/IndexView.vue'
import DesktopView from 'sfc-common/views/common/DesktopView.vue'


const commonRoute: VueRouter.RouteRecordRaw  =  {
  path: '/',
  component: Index,
  children: [
    {
      path: '/',
      component: DesktopView,
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/**',
      component: DesktopView,
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/public',
      component: () => import('sfc-common/views/common/PublicDisk.vue'),
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/public/:path*',
      component: () => import('sfc-common/views/common/PublicDisk.vue'),
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/private',
      component: () => import('sfc-common/views/common/PrivateDisk.vue')
    },
    {
      path: '/private/:path*',
      component: () => import('sfc-common/views/common/PrivateDisk.vue')
    },
    {
      path: '/login',
      component: () => import('sfc-common/views/common/LoginView.vue'),
      meta: {
        allowNoLogin: true
      }
    },
    {
      path: '/personalCenter',
      component: () => import('sfc-common/views/common/PersonalCenter.vue')
    },
    {
      path: '/register',
      component: () => import('sfc-common/views/common/RegisterView.vue')
    },
    {
      path: '/forget',
      component: () => import('sfc-common/views/common/ForgetView.vue')
    },
    {
      path: '/box',
      component: () => import('sfc-common/views/common/BoxView.vue')
    },
    {
      path: '/box/:itemId',
      component: () => import('sfc-common/views/common/BoxView.vue')
    },
    {
      path: '/collect/:cid/:vid',
      component: () => import('sfc-common/views/common/CollectionSubmitView.vue')
    },
    {
      path: '/s/:sid/:vid',
      component: () => import('sfc-common/views/common/FileShareView.vue')
    }
  ]
}
export default commonRoute