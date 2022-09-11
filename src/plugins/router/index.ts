
import { EventNameConstants } from '@/core/constans/EventName'
import { context } from '@/core/context'
import * as VueRouter from 'vue-router'
import { isNavigationFailure } from 'vue-router'
import AdminRoute from './admin'
import CommonRoute from './common'

const routes: VueRouter.RouteRecordRaw[] = []
routes.push(CommonRoute)
routes.push(AdminRoute)

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
  context.eventBus.value.emit(EventNameConstants.ROUTE_CHANGE, {
    to,
    from
  })
})

export default router