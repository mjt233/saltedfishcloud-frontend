import { FileListContext } from '@/core/model'
import { MenuGroup } from './type.d'
const defaultFileListMenu: MenuGroup<FileListContext>[] = [
  {
    id: 'main',
    name: '新增',
    items: [
      {
        id: 'mkdir',
        title: '新建文件夹',
        action(e) {
          
        }
      }
    ]
  }
]

export {
  defaultFileListMenu
}