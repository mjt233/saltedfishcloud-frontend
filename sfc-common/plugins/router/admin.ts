import IndexViewVue from 'sfc-common/views/admin/IndexView.vue'
import * as VueRouter from 'vue-router'
const AdminRoute: VueRouter.RouteRecordRaw = {
  path: '/admin/:configNode*',
  name: 'admin',
  component: IndexViewVue
}
export default AdminRoute