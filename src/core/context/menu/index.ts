import * as MenuType from './type.js'
import defaultMenuBackground from '@/assets/img/bg/bg2.jpg'
const defaultAppMenu: MenuType.AppMenu = {
  backgroundImg: defaultMenuBackground,
  items: [
    {
      id: 'main',
      isSubHeader: true,
      title: '主功能'
    },
    {
      id: 'public',
      title: '公共网盘',
      route: '/public',
      icon: 'mdi-folder'
    },
    {
      id: 'private',
      title: '私人网盘',
      route: '/private',
      icon: 'mdi-lock'
    },
    {
      id: 'account',
      title: '账号',
      isSubHeader: true
    },
    {
      id: 'login',
      title: '登录',
      route: '/login',
      icon: 'mdi-login',
      renderOn: ctx => {
        return ctx.session.value.token == ''
      }
    },
    {
      id: 'logout',
      title: '退出登录',
      icon: 'mdi-logout',
      renderOn: ctx => {
        return ctx.session.value.token != ''
      }
    }
  ]
}

export default defaultAppMenu