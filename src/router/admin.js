import admin from '../view/admin'
import overview from '../view/admin/Overview'
import welcome from '../view/admin/Welcome'
import user from '../view/admin/User'
import sys from '../view/admin/Sys'
import safe from '../view/admin/Safe'
import store from '../view/admin/Store'

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
        },
        {
            path: 'user',
            component: user
        },
        {
            path: 'sys',
            component: sys
        },
        {
            path: 'store',
            component: store
        },
        {
            path: 'safe',
            component: safe
        }
    ]
}
export default adminRoute