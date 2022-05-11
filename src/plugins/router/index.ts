
import { context } from '@/core/context'
import * as VueRouter from 'vue-router'
import { isNavigationFailure } from 'vue-router'
import CommonRoute from './common'

const routes: VueRouter.RouteRecordRaw[] = []
routes.push(CommonRoute)

const router =  VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: routes
})

router.afterEach((to, from, failure) => {
  if (isNavigationFailure(failure)) {
    console.log('failed navigation', failure)
    return
  }
  context.routeInfo.value.curr = to
  context.routeInfo.value.prev = from
})

export default router