import * as MenuType from './type'
import defaultMenuBackground from '@/assets/img/bg/bg2.jpg'
import { ConditionFunction } from '@/core/helper/ConditionFunction'
import SfcUtils from '@/utils/SfcUtils'

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
    {
      id: 'other',
      name: '便捷功能',
      items: [
        {
          id: 'box',
          title: '百宝箱',
          route: '/box',
          icon: 'mdi-view-grid'
        }
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
          id: 'register',
          title: '注册',
          route: '/register',
          icon: 'mdi-clipboard-account',
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
    {
      id: 'manage',
      name: '管理',
      items: [
        {
          id: 'admin',
          title: '系统管理',
          route: '/admin',
          icon: 'mdi-cog'
        }
      ]
    }
  ]
}

export default defaultMainMenu