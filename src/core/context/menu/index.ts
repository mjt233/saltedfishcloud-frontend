import * as MenuType from './type.js'
import defaultMenuBackground from '@/assets/img/bg/bg2.jpg'
import { ConditionFunction } from '@/core/helper/ConditionFunction.js'
import SfcUtils from '@/utils/SfcUtils/index.js'

const defaultMainMenu: MenuType.AppMenu = {
  backgroundImg: defaultMenuBackground,
  group: [
    // 主功能
    {
      id: 'main',
      name: '主功能',
      items: [
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
      ]
    },

    // 账号
    {
      id: 'account',
      name: '账号',
      items: [
        {
          id: 'login',
          title: '登录',
          route: '/login',
          icon: 'mdi-login',
          renderOn: ConditionFunction.noLogin
        },
        {
          id: 'my',
          title: '个人中心',
          icon: 'mdi-account',
          route: '/personalCenter',
          renderOn: ConditionFunction.hasLogin
        },
        {
          id: 'logout',
          title: '退出登录',
          icon: 'mdi-logout',
          action(ctx) {
            ctx.session.value.logout()
            SfcUtils.snackbar('退出成功')
          },
          renderOn: ConditionFunction.hasLogin
        }
      ]
    },
  ]
}

export default defaultMainMenu