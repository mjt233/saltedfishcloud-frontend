import { Validators } from 'sfc-common/core/helper/Validators'
import { FileListContext } from 'sfc-common/model'
import { ValidateRule } from 'sfc-common/model/component/type'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { MenuGroup } from 'sfc-common/core/context'

const addGroup: MenuGroup<FileListContext> = {
  // 新增菜单
  id: 'add',
  name: '新增',
  renderOn(ctx?) {
    return ctx?.selectFileList.length == 0
  },
  items: [
    {
      id: 'upload',
      title: '上传',
      action(e) {
        e.modelHandler.upload().then(e.modelHandler.refresh)
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
        try {

          const name = await SfcUtils.prompt({
            title: '新建文件夹',
            label: '文件夹名称',
            rules,
            defaultValue: defaultName,
            cancelToReject: true
          })
          await ctx.modelHandler.mkdir(name)
          await ctx.modelHandler.refresh()
        } catch(err) {
          if (err == 'cancel') {
            return
          } else {
            return Promise.reject(err)
          }
        }
      },
      renderOn(ctx) {
        return !ctx.readonly
      },
      icon: 'mdi-folder-plus'
    }
  ]
}

export default addGroup