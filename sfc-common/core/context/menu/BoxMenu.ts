import { h } from 'vue'
import { MenuGroup, BoxMenuContext } from './type'
import FileCollectionView from 'sfc-common/components/common/FileCollection/FileCollectionView.vue'
import { context } from '..'
import FileShareView from 'sfc-common/components/common/FileShare/FileShareView.vue'
import DesktopConfigList from 'sfc-common/components/common/Desktop/DesktopConfigList.vue'
import { ConditionFunction } from 'sfc-common/core/helper'
import ProxyConfigForm from 'sfc-common/components/common/ProxyConfig/ProxyConfigForm.vue'
import { ProxyConfig } from 'sfc-common/components'

/**
 * 默认的百宝箱菜单
 */
const defaultBoxMenu: MenuGroup<BoxMenuContext>[] = [
  {
    id: 'shareAndCollection',
    name: '文件交流',
    items: [
      {
        id: 'file-collect',
        title: '文件收集',
        icon: 'mdi-package-down',
        action(ctx) {
          ctx.currentComponent = h(FileCollectionView, {
            uid: context.session.value.user.id
          })
          ctx.title = '文件收集'
        },
        renderOn(ctx) {
          return !!context.session.value.token
        }
      },
      {
        id: 'file-share',
        title: '文件分享',
        icon: 'mdi-share-variant',
        action(ctx) {
          ctx.currentComponent = h(FileShareView, {
            uid: context.session.value.user.id
          })
          ctx.title = '文件分享'
        },
        renderOn() {
          return !!context.session.value.token
        }
      }
    ]
  },
  {
    id: 'custom',
    name: '定制选项',
    items: [
      {
        id: 'desktop',
        title: '我的桌面',
        icon: 'mdi-home',
        action(ctx) {
          ctx.currentComponent = h(DesktopConfigList, {
            uid: context.session.value.user.id
          })
          ctx.title = '首页桌面配置'
        },
        renderOn(ctx) {
          return !!context.session.value.token
        },
      },
      {
        id: 'theme',
        title: '主题与样式',
        icon: 'mdi-palette',
        action(ctx) {
          ctx.currentComponent = h('div', null, '该功能暂未开发')
          ctx.title = '主题与样式'
        },
        renderOn(ctx) {
          return !!context.session.value.token
        },
      },
      {
        id: 'proxy',
        title: '代理节点',
        icon: 'mdi-web',
        renderOn(ctx) {
          return ConditionFunction.hasLogin(context)
        },
        action(ctx) {
          ctx.title = '代理节点'
          ctx.currentComponent = h(ProxyConfig, { uid: context.session.value.user.id })
        }
      }
    ]
  }
]
export default defaultBoxMenu