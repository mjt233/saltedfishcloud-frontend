import * as VueRouter from 'vue-router';
import index from '@/views/common/index.vue'
import CommonWelcome from '@/views/common/welcome.vue'

const CommonRoute: VueRouter.RouteRecordRaw  =  {
  path: '/',
  component: index,
  children: [
    {
      path: '/',
      component: CommonWelcome
    }
  ]
}
export default CommonRoute