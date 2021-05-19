import Vue from 'vue'
import Router from 'vue-router'
import adminRoute from './admin'
import commonRouteOpt from './common'
Vue.use(Router)

/**
 * @type {import('_vue-router@3.5.1@vue-router/types/router').RouterOptions}
 */
const option = {
    routes: []
}
option.routes.push(commonRouteOpt)
option.routes.push(adminRoute)
let router = new Router(option)
router.afterEach((to, from) => {

    /**
     * @param {import('_vue-router@3.5.1@vue-router/types/router').RouteRecord} e 
     * @returns 
     */
    let filter = e => e.name && (e.name === 'common' || e.name === 'admin')
    let toName = to.matched.filter(filter).map(e => e.name)[0]
    let fromName = from.matched.filter(filter).map(e => e.name)[0]
    let left = getComputedStyle(document.body)['paddingLeft']
    
    if (toName && fromName && toName != fromName && left == '0px') {
        to.params['close'] = true
    }
})
export default router