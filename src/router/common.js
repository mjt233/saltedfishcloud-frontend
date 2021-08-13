import PublicDisk from '../view/common/PublicDisk.vue'
import PrivateDisk from '../view/common/PrivateDisk'
import common from '../view/common'
import welcome from '../view/common/Welcome'

/**
 * @type {import('_vue-router@3.5.1@vue-router/types/router').RouteConfig}
 */
const routeOpt = {
    path: '/',
    component: common,
    children: [
        {
            path: '/',
            component: welcome
        },
        {
            path: 'public/*',
            name: 'PublicBrowser',
            component: PublicDisk
        },
        {
            path: 'public',
            name: 'PublicBrowser2',
            component: PublicDisk
        },
        {
            path: 'private',
            component: PrivateDisk,
            name: 'privateDisk'
        },
        {
            path: 'private/**',
            component: PrivateDisk,
            name: 'privateDisk2'
        },
        {
            path: 'login',
            component: require('../view/common/Login').default
        },
        {
            path: 'my',
            component: require('../view/common/My').default,
            name: 'my'
        },
        {
            path: 'reg',
            component: require('../view/common/RegUser').default
        }
    ]
}
export default routeOpt
