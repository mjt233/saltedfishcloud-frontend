import { h } from 'vue'
import { MenuGroup, BoxMenuContext } from './type'
import SfcUtils from '@/utils/SfcUtils'
import FileCollectionView from '@/views/box/FileCollectionView.vue'

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
          ctx.currentComponent = h(FileCollectionView)
          ctx.title = '文件收集'
        }
      }
    ]
  }
]
export default defaultBoxMenu