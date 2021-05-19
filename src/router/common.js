import PublicBrowser from '../view/common/PublicBrowser.vue'
import PrivateDisk from '../view/common/PrivateDisk'
import common from '../view/common'
import welcome from '../view/common/Welcome'

export default {
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
            component: PublicBrowser
        },
        {
            path: 'public',
            name: 'PublicBrowser2',
            component: PublicBrowser
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
            path: 'test',
            component: require('../view/common/Test').default
        },
        {
            path: 'reg',
            component: require('../view/common/RegUser').default
        }
    ]
}