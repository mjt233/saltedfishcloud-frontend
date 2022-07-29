import { h } from 'vue'
import { MenuGroup, BoxMenuContext } from './type'
import FileCollectionView from '@/components/common/FileCollection/FileCollectionView.vue'
import { context } from '..'
import FileShareView from '@/components/common/FileShare/FileShareView.vue'

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
  }
]
export default defaultBoxMenu