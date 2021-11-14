import Vue from 'vue'
import Router from 'vue-router'
import adminRoute from './admin'
import commonRouteOpt from './common'
import independent from './independent'
Vue.use(Router)

/**
 * @type {import('_vue-router@3.5.1@vue-router/types/router').RouterOptions}
 */
const option = {
    routes: []
}
option.routes.push(commonRouteOpt)
option.routes.push(adminRoute)
option.routes.push(independent)
const router = new Router(option)

/**
 * 当admin与common之间的路由转跳时通过判断body的paddingLeft标记抽屉导航栏是否处于关闭状态，以便组件挂载后关闭抽屉，防止抽屉导航栏遮挡body
 */
router.afterEach((to, from) => {
    if (to.matched[0] && from.matched[0] && to.matched[0].path != from.matched[0].path && getComputedStyle(document.body).paddingLeft == '0px') {
        to.params.close = true
    }
})
export default router
