import { ConditionFunction, getContext, MenuHelper } from 'sfc-common'

MenuHelper.addMoreBoxMenu({
  id: 'webdav-config',
  title: 'WebDAV授权',
  action: e => {
    e.currentComponent = 'WebDAVConfig'
    e.title = 'WebDAV授权'
  },
  renderOn(ctx) {
    return ConditionFunction.hasLogin(getContext())
  },
})