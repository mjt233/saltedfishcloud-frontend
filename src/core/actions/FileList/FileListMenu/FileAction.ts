import DeleteConfirm from '@/components/common/DeleteConfirm.vue'
import { FileListContext } from '@/core/model'
import SfcUtils from '@/utils/SfcUtils'
import { h } from 'vue'
import { MenuGroup } from '../type'

const fileActionGroup: MenuGroup<FileListContext> = 
{
  id: 'action',
  name: '文件操作',
  items: [
    {
      id: 'rename',
      title: '重命名',
      icon: 'mdi-form-textbox',
      renderOn(ctx) {
        return !ctx.readonly && ctx.selectFileList.length == 1
      },
      action(ctx) {
        const fileInfo = ctx.selectFileList[0]
        ctx.modelHandler.rename(fileInfo.name, fileInfo.md5).then(async ret => {
          if (ret) {
            ctx.modelHandler.refresh()
          }
        })
      }
    },
    {
      id: 'delete',
      title: '删除',
      icon: 'mdi-delete',
      renderOn(ctx) {
        return !ctx.readonly && ctx.selectFileList.length >= 1
      },
      action(ctx) {
        const asyncFunWrap = async() => {
          await SfcUtils.confirm('', '', {
            children: [ h(DeleteConfirm, { fileList: ctx.selectFileList }) ],
            cancelToReject: true
          })
          await ctx.modelHandler.delete(ctx.selectFileList.map(file => file.name))
          await ctx.modelHandler.refresh()
          SfcUtils.snackbar('删除成功')
        }
        asyncFunWrap()
      }
    }
  ]
}

export default fileActionGroup