import { h } from 'vue'
import { MenuGroup, BoxMenuContext } from './type'
import FileCollectionView from 'sfc-common/components/common/FileCollection/FileCollectionView.vue'
import { context } from '..'
import FileShareView from 'sfc-common/components/common/FileShare/FileShareView.vue'
import DesktopConfigList from 'sfc-common/components/common/Desktop/DesktopConfigList.vue'

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
    name: '个性定制',
    items: [
      {
        id: 'desktop',
        title: '首页桌面',
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
      }
    ]
  }
]
export default defaultBoxMenu