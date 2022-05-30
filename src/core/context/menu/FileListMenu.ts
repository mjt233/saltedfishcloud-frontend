import { Validators } from '@/core/helper/Validators'
import { FileListContext } from '@/core/model'
import { ValidateRule } from '@/core/model/component/type'
import SfcUtils from '@/utils/SfcUtils'
import { MenuGroup } from './type.d'
const defaultFileListMenu: MenuGroup<FileListContext>[] = [
  {
    // 新增菜单
    id: 'add',
    name: '新增',
    items: [
      {
        id: 'upload',
        title: '上传',
        action(e) {
          return e.modelHandler.upload()
        },
        renderOn(ctx) {
          return !ctx.readonly
        },
        icon: 'mdi-upload'
      },
      {
        id: 'mkdir',
        title: '新建文件夹',
        async action(ctx) {
          // 定义校验器，不允许为空，不允许重名
          const rules: ValidateRule[] = [
            Validators.notNull('文件夹名称不能为空'),
            (e: string) => {
              if(ctx.fileList.find(file => file.name == e)) {
                return '文件名重复'
              } else {
                return true
              }
            }
          ]

          // 构造默认文件名，重名编号自动加1
          let sameCount = 1
          let defaultName = '新建文件夹'
          ctx.fileList.forEach(file => {
            if (file.name == defaultName) {
              sameCount++
            }
            if (sameCount > 1) {
              defaultName = `新建文件夹(${sameCount})`
            }
          })

          // 打开输入对话框
          const name = await SfcUtils.prompt({
            title: '新建文件夹',
            label: '文件夹名称',
            rules,
            defaultValue: defaultName
          })
          await ctx.modelHandler.mkdir(name)
          await ctx.modelHandler.refresh()
        },
        renderOn(ctx) {
          return !ctx.readonly
        },
        icon: 'mdi-folder-plus'
      }
    ]
  },
  {
    id: 'common',
    name: '通用功能',
    items: [
      {
        id: 'refresh',
        title: '刷新',
        async action(ctx) {
          return await ctx.modelHandler.refresh()
        },
        icon: 'mdi-refresh'
      }
    ]
  },
  {
    id: 'action',
    name: '文件操作',
    items: [
      {
        id: 'rename',
        title: '重命名',
        icon: 'mdi-form-textbox',
        renderOn(ctx) {
          return !ctx.readonly
        }
      }
    ]
  }
]

export {
  defaultFileListMenu
}