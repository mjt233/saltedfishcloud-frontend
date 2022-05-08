import * as MenuType from './type.js'
import defaultMenuBackground from '@/assets/img/bg/bg2.jpg'
const defaultAppMenu: MenuType.AppMenu = {
  backgroundImg: defaultMenuBackground,
  items: [
    {
      isSubHeader: true,
      title: '主功能'
    },
    {
      title: '公共网盘',
      route: '/public',
      icon: 'mdi-folder'
    },
    {
      title: '私人网盘',
      route: '/private',
      icon: 'mdi-lock'
    },
    {
      title: '登录',
      route: '/login',
      icon: 'mdi-login'
    }
  ]
}

export default defaultAppMenu