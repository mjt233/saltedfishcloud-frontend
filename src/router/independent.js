/**
 * @type {import('vue-router').RouteConfig[]}
 */
const routeOpt = [
    {
        path: '/submit',
        component: require('@/view/independent/SubmitFile').default
    },
    {
        path: '/s/:sid/:verification',
        component: require('@/view/independent/Share').default
    }
]
export default routeOpt
