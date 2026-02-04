import { ConditionFunction, getContext, MenuHelper } from 'sfc-common'
import WebDavAuthConfig from './components/WebDavAuthConfig.vue'
import { h } from 'vue'

MenuHelper.addMoreBoxMenu({
  id: 'webdav-config',
  title: 'WebDAV 配置',
  icon: 'mdi-nas',
  action: e => {
    e.currentComponent = h(WebDavAuthConfig, {
      uid: getContext().session.value.user.id
    })
    e.title = 'WebDAV 配置'
  },
  renderOn(ctx) {
    return ConditionFunction.hasLogin(getContext())
  },
})