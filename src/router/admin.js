import admin from '../view/admin'
import overview from '../view/admin/Overview'
import welcome from '../view/admin/Welcome'

/**
 * @type {import('_vue-router@3.5.1@vue-router/types/router').RouteConfig}
 */
const adminRoute =  {
    path: '/admin',
    component: admin,
    children:[
        {
            path: 'overview',
            component: overview
        },
        {
            path: '/',
            component: welcome
        }
    ]
}
export default adminRoute