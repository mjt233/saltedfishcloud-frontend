
import * as VueRouter from 'vue-router'
import test from '@/components/Test.vue'

const routes = [
    { path: '/test', component: test }
]

const router =  VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: routes
})


export default router