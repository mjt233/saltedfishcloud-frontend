import Vue from 'vue'
import Router from 'vue-router'
import PublicBrowser from '@/view/PublicBrowser.vue'
import index from '@/view/index'
Vue.use(Router)

export default new Router({
  routes: [
      {
          path: '/public/*',
          name: 'PublicBrowser',
          component: PublicBrowser
      },
      {
          path: '/public',
          name: 'PublicBrowser2',
          component: PublicBrowser
      },
      {
          path: '/',
          name: 'index',
          component: index
      },
      {
          path: '/private',
          component: require('@/view/PrivateDisk').default
      },
      {
          path: '/login',
          component: require('@/view/Login').default
      },{path: '/my', component: require('@/view/My').default}
  ]
})
