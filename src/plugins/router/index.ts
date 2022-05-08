
import * as VueRouter from 'vue-router'
import CommonRoute from './common'

const routes: VueRouter.RouteRecordRaw[] = []
routes.push(CommonRoute)

const router =  VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: routes
})


export default router