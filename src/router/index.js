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
export default new Router(option)